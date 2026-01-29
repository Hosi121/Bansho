import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/documents/[id]/restore - Restore a deleted document
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const documentId = Number.parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    if (Number.isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    // Check ownership and that document is deleted
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
        deletedAt: { not: null },
      },
    });

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found in trash' }, { status: 404 });
    }

    // Restore document by clearing deletedAt
    const document = await prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: null },
      include: {
        tags: true,
      },
    });

    // Transform response
    const transformedDocument = {
      id: document.id.toString(),
      title: document.title,
      content: document.content,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      tags: document.tags.map((tag) => tag.name),
    };

    return NextResponse.json(transformedDocument);
  } catch (error) {
    console.error('Error restoring document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
