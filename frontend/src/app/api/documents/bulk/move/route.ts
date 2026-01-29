import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const bulkMoveSchema = z.object({
  documentIds: z.array(z.string()).min(1),
  folderId: z.string().nullable(),
});

// POST /api/documents/bulk/move - Move multiple documents to a folder
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id, 10);
    const body = await request.json();

    const result = bulkMoveSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { documentIds, folderId } = result.data;
    const parsedDocumentIds = documentIds.map((id) => Number.parseInt(id, 10));
    const parsedFolderId = folderId ? Number.parseInt(folderId, 10) : null;

    // Verify folder ownership if moving to a folder
    if (parsedFolderId !== null) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: parsedFolderId,
          userId,
          deletedAt: null,
        },
      });

      if (!folder) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
      }
    }

    // Update all documents that belong to the user
    const updateResult = await prisma.document.updateMany({
      where: {
        id: { in: parsedDocumentIds },
        userId,
        deletedAt: null,
      },
      data: {
        folderId: parsedFolderId,
      },
    });

    return NextResponse.json({
      message: `${updateResult.count} documents moved`,
      count: updateResult.count,
    });
  } catch (error) {
    console.error('Error bulk moving documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
