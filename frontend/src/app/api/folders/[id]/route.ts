import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(100, 'Folder name must be less than 100 characters')
    .optional(),
  parentId: z.number().int().positive().nullable().optional(),
});

// GET /api/folders/[id] - Get a single folder
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const folderId = Number.parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
        deletedAt: null,
      },
      include: {
        documents: {
          where: { deletedAt: null },
          select: { id: true, title: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
        },
        children: {
          where: { deletedAt: null },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: folder.id.toString(),
      name: folder.name,
      parentId: folder.parentId?.toString() || null,
      documents: folder.documents.map((doc) => ({
        id: doc.id.toString(),
        title: doc.title,
        updatedAt: doc.updatedAt,
      })),
      children: folder.children.map((child) => ({
        id: child.id.toString(),
        name: child.name,
      })),
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    });
  } catch (error) {
    console.error('Get folder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/folders/[id] - Update a folder
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const folderId = Number.parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    const body = await request.json();
    const result = updateFolderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Verify folder exists and belongs to user
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
        deletedAt: null,
      },
    });

    if (!existingFolder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const { name, parentId } = result.data;

    // Prevent moving folder to itself
    if (parentId === folderId) {
      return NextResponse.json({ error: 'Cannot move folder to itself' }, { status: 400 });
    }

    // Verify parent folder belongs to user if provided
    if (parentId !== undefined && parentId !== null) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentId,
          userId,
          deletedAt: null,
        },
      });

      if (!parentFolder) {
        return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 });
      }

      // Prevent circular reference (moving folder to its descendant)
      const isDescendant = await checkIsDescendant(folderId, parentId);
      if (isDescendant) {
        return NextResponse.json(
          { error: 'Cannot move folder to its own descendant' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate folder name at same level
    if (name) {
      const newParentId = parentId !== undefined ? parentId : existingFolder.parentId;
      const duplicateFolder = await prisma.folder.findFirst({
        where: {
          userId,
          parentId: newParentId,
          name,
          deletedAt: null,
          id: { not: folderId },
        },
      });

      if (duplicateFolder) {
        return NextResponse.json(
          { error: 'A folder with this name already exists at this location' },
          { status: 409 }
        );
      }
    }

    const folder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        ...(name && { name }),
        ...(parentId !== undefined && { parentId }),
      },
    });

    return NextResponse.json({
      id: folder.id.toString(),
      name: folder.name,
      parentId: folder.parentId?.toString() || null,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    });
  } catch (error) {
    console.error('Update folder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/folders/[id] - Soft delete a folder
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const folderId = Number.parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    // Verify folder exists and belongs to user
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
        deletedAt: null,
      },
      include: {
        children: { where: { deletedAt: null } },
        documents: { where: { deletedAt: null } },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Check if folder has children or documents
    if (folder.children.length > 0 || folder.documents.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete folder with contents. Move or delete contents first.' },
        { status: 400 }
      );
    }

    // Soft delete the folder
    await prisma.folder.update({
      where: { id: folderId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to check if targetId is a descendant of folderId
async function checkIsDescendant(folderId: number, targetId: number): Promise<boolean> {
  const folder = await prisma.folder.findUnique({
    where: { id: targetId },
    select: { parentId: true },
  });

  if (!folder) return false;
  if (folder.parentId === folderId) return true;
  if (folder.parentId === null) return false;

  return checkIsDescendant(folderId, folder.parentId);
}
