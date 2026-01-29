import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be less than 50 characters'),
});

// GET /api/tags/[id] - Get a single tag with its documents
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tagId = parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
        deletedAt: null,
      },
      include: {
        documents: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: tag.id.toString(),
      name: tag.name,
      documents: tag.documents.map((doc) => ({
        id: doc.id.toString(),
        title: doc.title,
        updatedAt: doc.updatedAt,
      })),
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    });
  } catch (error) {
    console.error('Get tag error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/tags/[id] - Update a tag (rename)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tagId = parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    const body = await request.json();
    const result = updateTagSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name } = result.data;

    // Check if tag exists and belongs to user
    const existingTag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
        deletedAt: null,
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Check for duplicate name
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        userId,
        name,
        deletedAt: null,
        id: { not: tagId },
      },
    });

    if (duplicateTag) {
      return NextResponse.json({ error: 'A tag with this name already exists' }, { status: 409 });
    }

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: { name },
    });

    return NextResponse.json({
      id: tag.id.toString(),
      name: tag.name,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    });
  } catch (error) {
    console.error('Update tag error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tags/[id] - Soft delete a tag
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tagId = parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    // Check if tag exists and belongs to user
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
        deletedAt: null,
      },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Soft delete the tag
    await prisma.tag.update({
      where: { id: tagId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
