import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// DELETE /api/documents/[id]/permanent - Permanently delete a document
export async function DELETE(_request: NextRequest, context: RouteContext) {
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

    // Check ownership and that document is in trash
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

    // Delete related records first, then delete the document
    await prisma.$transaction([
      // Delete document shares
      prisma.documentShare.deleteMany({
        where: { documentId },
      }),
      // Delete document versions
      prisma.documentVersion.deleteMany({
        where: { documentId },
      }),
      // Delete document images
      prisma.documentImage.deleteMany({
        where: { documentId },
      }),
      // Delete edges
      prisma.edge.deleteMany({
        where: {
          OR: [{ fromDocumentId: documentId }, { toDocumentId: documentId }],
        },
      }),
      // Finally delete the document
      prisma.document.delete({
        where: { id: documentId },
      }),
    ]);

    return NextResponse.json({ message: 'Document permanently deleted' });
  } catch (error) {
    console.error('Error permanently deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
