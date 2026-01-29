import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/tags - Get all tags for the current user with document counts
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const tags = await prisma.tag.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            documents: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(
      tags.map((tag) => ({
        id: tag.id.toString(),
        name: tag.name,
        documentCount: tag._count.documents,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      }))
    );
  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
