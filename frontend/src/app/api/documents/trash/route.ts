import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/documents/trash - Get all deleted documents for the authenticated user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id, 10);

    const documents = await prisma.document.findMany({
      where: {
        userId,
        deletedAt: { not: null },
      },
      include: {
        tags: true,
      },
      orderBy: { deletedAt: 'desc' },
    });

    // Transform to match frontend expected format
    const transformedDocuments = documents.map((doc) => ({
      id: doc.id.toString(),
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
      tags: doc.tags.map((tag) => tag.name),
      excerpt: doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : ''),
    }));

    return NextResponse.json(transformedDocuments);
  } catch (error) {
    console.error('Error fetching deleted documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
