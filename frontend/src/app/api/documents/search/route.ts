import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchDocumentSchema } from "@/lib/validations";

// GET /api/documents/search?q=query - Search documents
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    // Validate input
    const result = searchDocumentSchema.safeParse({ q: query });
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const searchQuery = result.data.q;

    // Search in title and content
    const documents = await prisma.document.findMany({
      where: {
        userId,
        deletedAt: null,
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { content: { contains: searchQuery, mode: "insensitive" } },
          { tags: { some: { name: { contains: searchQuery, mode: "insensitive" } } } },
        ],
      },
      include: {
        tags: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 50, // Limit results
    });

    // Transform to match frontend expected format
    const transformedDocuments = documents.map((doc) => ({
      id: doc.id.toString(),
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      tags: doc.tags.map((tag) => tag.name),
      excerpt: doc.content.substring(0, 200) + (doc.content.length > 200 ? "..." : ""),
    }));

    return NextResponse.json(transformedDocuments);
  } catch (error) {
    console.error("Error searching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
