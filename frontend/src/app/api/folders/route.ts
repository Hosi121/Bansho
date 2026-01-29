import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(100, 'Folder name must be less than 100 characters'),
  parentId: z.number().int().positive().nullable().optional(),
});

// GET /api/folders - List all folders for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id, 10);

    const folders = await prisma.folder.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { documents: { where: { deletedAt: null } } },
        },
      },
    });

    const formattedFolders = folders.map((folder) => ({
      id: folder.id.toString(),
      name: folder.name,
      parentId: folder.parentId?.toString() || null,
      documentCount: folder._count.documents,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    }));

    return NextResponse.json(formattedFolders);
  } catch (error) {
    console.error('Get folders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/folders - Create a new folder
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id, 10);

    const body = await request.json();
    const result = createFolderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, parentId } = result.data;

    // Verify parent folder belongs to user if provided
    if (parentId) {
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
    }

    // Check for duplicate folder name at same level
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId,
        parentId: parentId || null,
        name,
        deletedAt: null,
      },
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: 'A folder with this name already exists at this location' },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        userId,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(
      {
        id: folder.id.toString(),
        name: folder.name,
        parentId: folder.parentId?.toString() || null,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
