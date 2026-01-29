import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/documents/[id]/pin - Toggle pin status
export async function POST(_request: NextRequest, context: RouteContext) {
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

    // Check ownership
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
        deletedAt: null,
      },
    });

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Toggle pin status
    const document = await prisma.document.update({
      where: { id: documentId },
      data: { isPinned: !existingDocument.isPinned },
      include: {
        tags: true,
      },
    });

    return NextResponse.json({
      id: document.id.toString(),
      title: document.title,
      isPinned: document.isPinned,
    });
  } catch (error) {
    console.error('Error toggling pin status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
