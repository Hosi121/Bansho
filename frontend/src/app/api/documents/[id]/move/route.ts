import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const moveDocumentSchema = z.object({
  folderId: z.number().int().positive().nullable(),
});

// PUT /api/documents/[id]/move - Move a document to a folder
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    const body = await request.json();
    const result = moveDocumentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { folderId } = result.data;

    // Verify document exists and belongs to user
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

    // Verify folder exists and belongs to user if provided
    if (folderId !== null) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId,
          deletedAt: null,
        },
      });

      if (!folder) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
      }
    }

    // Update document's folder
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: { folderId },
    });

    return NextResponse.json({
      id: updatedDocument.id.toString(),
      folderId: updatedDocument.folderId?.toString() || null,
      message: 'Document moved successfully',
    });
  } catch (error) {
    console.error('Move document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
