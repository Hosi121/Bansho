import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const shareDocumentSchema = z.object({
  email: z.string().email('Invalid email address'),
  permission: z.enum(['view', 'edit']).default('view'),
});

const updateShareSchema = z.object({
  permission: z.enum(['view', 'edit']),
});

// GET /api/documents/[id]/share - Get all shares for a document
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
        deletedAt: null,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const shares = await prisma.documentShare.findMany({
      where: { documentId },
      include: {
        sharedWith: {
          select: { id: true, email: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      shares.map((share) => ({
        id: share.id.toString(),
        permission: share.permission,
        createdAt: share.createdAt,
        user: {
          id: share.sharedWith.id.toString(),
          email: share.sharedWith.email,
          name: share.sharedWith.name,
          avatar: share.sharedWith.avatar,
        },
      }))
    );
  } catch (error) {
    console.error('Get shares error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/documents/[id]/share - Share a document with a user
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    const body = await request.json();
    const result = shareDocumentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, permission } = result.data;

    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
        deletedAt: null,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Find user to share with
    const targetUser = await prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found with this email' }, { status: 404 });
    }

    // Cannot share with yourself
    if (targetUser.id === userId) {
      return NextResponse.json({ error: 'Cannot share document with yourself' }, { status: 400 });
    }

    // Check if already shared
    const existingShare = await prisma.documentShare.findUnique({
      where: {
        documentId_sharedWithId: {
          documentId,
          sharedWithId: targetUser.id,
        },
      },
    });

    if (existingShare) {
      return NextResponse.json(
        { error: 'Document is already shared with this user' },
        { status: 400 }
      );
    }

    const share = await prisma.documentShare.create({
      data: {
        documentId,
        sharedWithId: targetUser.id,
        permission,
      },
      include: {
        sharedWith: {
          select: { id: true, email: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json(
      {
        id: share.id.toString(),
        permission: share.permission,
        createdAt: share.createdAt,
        user: {
          id: share.sharedWith.id.toString(),
          email: share.sharedWith.email,
          name: share.sharedWith.name,
          avatar: share.sharedWith.avatar,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Share document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/documents/[id]/share?shareId=xxx - Update share permission
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const result = updateShareSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
        deletedAt: null,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const share = await prisma.documentShare.update({
      where: { id: parseInt(shareId, 10) },
      data: { permission: result.data.permission },
      include: {
        sharedWith: {
          select: { id: true, email: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json({
      id: share.id.toString(),
      permission: share.permission,
      createdAt: share.createdAt,
      user: {
        id: share.sharedWith.id.toString(),
        email: share.sharedWith.email,
        name: share.sharedWith.name,
        avatar: share.sharedWith.avatar,
      },
    });
  } catch (error) {
    console.error('Update share error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/documents/[id]/share?shareId=xxx - Remove share
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
    }

    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
        deletedAt: null,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await prisma.documentShare.delete({
      where: { id: parseInt(shareId, 10) },
    });

    return NextResponse.json({ message: 'Share removed successfully' });
  } catch (error) {
    console.error('Delete share error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
