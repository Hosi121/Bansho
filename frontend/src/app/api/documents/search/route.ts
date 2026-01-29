import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { searchDocumentSchema } from '@/lib/validations';

// Generate excerpt with highlighted match context
function generateHighlightedExcerpt(
  content: string,
  query: string,
  contextLength = 80
): { excerpt: string; matchStart: number; matchEnd: number } | null {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerContent.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return null;
  }

  // Calculate excerpt boundaries
  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(content.length, matchIndex + query.length + contextLength);

  let excerpt = content.substring(start, end);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < content.length ? '...' : '';

  excerpt = prefix + excerpt + suffix;

  // Calculate match position in excerpt
  const matchStart = prefix.length + (matchIndex - start);
  const matchEnd = matchStart + query.length;

  return { excerpt, matchStart, matchEnd };
}

// GET /api/documents/search?q=query - Search documents
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id);
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Validate input
    const result = searchDocumentSchema.safeParse({ q: query });
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const searchQuery = result.data.q;

    // Search in title and content using ILIKE for Japanese support
    const documents = await prisma.document.findMany({
      where: {
        userId,
        deletedAt: null,
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { content: { contains: searchQuery, mode: 'insensitive' } },
          {
            tags: {
              some: { name: { contains: searchQuery, mode: 'insensitive' } },
            },
          },
        ],
      },
      include: {
        tags: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    // Transform to match frontend expected format with highlighted excerpts
    const transformedDocuments = documents.map((doc) => {
      // Check where the match was found and generate appropriate excerpt
      const titleMatch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const contentHighlight = generateHighlightedExcerpt(doc.content, searchQuery);
      const tagMatch = doc.tags.some((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      let excerpt: string;
      let matchType: 'title' | 'content' | 'tag';
      let matchStart: number | undefined;
      let matchEnd: number | undefined;

      if (titleMatch) {
        // Match in title - show beginning of content
        excerpt = doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : '');
        matchType = 'title';
      } else if (contentHighlight) {
        // Match in content - show context around match
        excerpt = contentHighlight.excerpt;
        matchType = 'content';
        matchStart = contentHighlight.matchStart;
        matchEnd = contentHighlight.matchEnd;
      } else if (tagMatch) {
        // Match in tag - show beginning of content
        excerpt = doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : '');
        matchType = 'tag';
      } else {
        // Fallback
        excerpt = doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : '');
        matchType = 'content';
      }

      return {
        id: doc.id.toString(),
        title: doc.title,
        content: doc.content,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        tags: doc.tags.map((tag) => tag.name),
        excerpt,
        matchType,
        matchStart,
        matchEnd,
      };
    });

    return NextResponse.json(transformedDocuments);
  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
