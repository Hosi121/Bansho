import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/documents/search/titles?q=query - Search document titles for autocomplete
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id, 10);
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    // Search titles - if query is empty, return recent documents
    const documents = await prisma.document.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(query && {
          title: { contains: query, mode: 'insensitive' },
        }),
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    // Transform to minimal format for autocomplete
    const results = documents.map((doc) => ({
      id: doc.id.toString(),
      title: doc.title,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching document titles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
