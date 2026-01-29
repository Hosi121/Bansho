import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDocumentSchema } from "@/lib/validations";

// GET /api/documents - Get all documents for the authenticated user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    const documents = await prisma.document.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        tags: true,
        edgesFrom: {
          include: {
            toDocument: {
              select: { id: true, title: true },
            },
          },
        },
        edgesTo: {
          include: {
            fromDocument: {
              select: { id: true, title: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform to match frontend expected format
    const transformedDocuments = documents.map((doc) => ({
      id: doc.id.toString(),
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      tags: doc.tags.map((tag) => tag.name),
      edges_from: doc.edgesFrom.map((edge) => ({
        id: edge.id,
        from_document_id: edge.fromDocumentId,
        to_document_id: edge.toDocumentId,
        weight: edge.weight,
      })),
      edges_to: doc.edgesTo.map((edge) => ({
        id: edge.id,
        from_document_id: edge.fromDocumentId,
        to_document_id: edge.toDocumentId,
        weight: edge.weight,
      })),
    }));

    return NextResponse.json(transformedDocuments);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();

    // Validate input
    const result = createDocumentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { title, content, tags } = result.data;

    // Create document with tags
    const document = await prisma.document.create({
      data: {
        title,
        content: content || "",
        userId,
        tags: tags?.length
          ? {
              connectOrCreate: tags.map((tagName) => ({
                where: { name: tagName },
                create: { name: tagName },
              })),
            }
          : undefined,
      },
      include: {
        tags: true,
        edgesFrom: true,
        edgesTo: true,
      },
    });

    // Transform response
    const transformedDocument = {
      id: document.id.toString(),
      title: document.title,
      content: document.content,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      tags: document.tags.map((tag) => tag.name),
      edges_from: [],
      edges_to: [],
    };

    return NextResponse.json(transformedDocument, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
