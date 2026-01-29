import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const bulkDeleteSchema = z.object({
  documentIds: z.array(z.string()).min(1),
});

// POST /api/documents/bulk/delete - Soft delete multiple documents
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id, 10);
    const body = await request.json();

    const result = bulkDeleteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { documentIds } = result.data;
    const parsedDocumentIds = documentIds.map((id) => Number.parseInt(id, 10));

    // Soft delete all documents that belong to the user
    const updateResult = await prisma.document.updateMany({
      where: {
        id: { in: parsedDocumentIds },
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: `${updateResult.count} documents deleted`,
      count: updateResult.count,
    });
  } catch (error) {
    console.error('Error bulk deleting documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
