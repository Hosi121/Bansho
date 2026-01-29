import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateDocumentSchema } from "@/lib/validations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/documents/[id] - Get a specific document
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const documentId = parseInt(id);
    const userId = parseInt(session.user.id);

    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
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
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Transform response
    const transformedDocument = {
      id: document.id.toString(),
      title: document.title,
      content: document.content,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      tags: document.tags.map((tag) => tag.name),
      edges_from: document.edgesFrom.map((edge) => ({
        id: edge.id,
        from_document_id: edge.fromDocumentId,
        to_document_id: edge.toDocumentId,
        weight: edge.weight,
      })),
      edges_to: document.edgesTo.map((edge) => ({
        id: edge.id,
        from_document_id: edge.fromDocumentId,
        to_document_id: edge.toDocumentId,
        weight: edge.weight,
      })),
    };

    return NextResponse.json(transformedDocument);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Update a document
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const documentId = parseInt(id);
    const userId = parseInt(session.user.id);

    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const result = updateDocumentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const { title, content, tags } = result.data;

    // Update document
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && {
          tags: {
            set: [], // Disconnect all existing tags
            connectOrCreate: tags.map((tagName) => ({
              where: { userId_name: { userId, name: tagName } },
              create: { name: tagName, userId },
            })),
          },
        }),
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
      edges_from: document.edgesFrom.map((edge) => ({
        id: edge.id,
        from_document_id: edge.fromDocumentId,
        to_document_id: edge.toDocumentId,
        weight: edge.weight,
      })),
      edges_to: document.edgesTo.map((edge) => ({
        id: edge.id,
        from_document_id: edge.fromDocumentId,
        to_document_id: edge.toDocumentId,
        weight: edge.weight,
      })),
    };

    return NextResponse.json(transformedDocument);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete a document (soft delete)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const documentId = parseInt(id);
    const userId = parseInt(session.user.id);

    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
