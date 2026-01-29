import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateDocumentSchema } from '@/lib/validations';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/documents/[id] - Get a specific document
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const documentId = Number.parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    // First check if user owns the document
    let document = await prisma.document.findFirst({
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

    // If not owner, check if document is shared with user
    let sharedPermission: string | null = null;
    if (!document) {
      const share = await prisma.documentShare.findFirst({
        where: {
          documentId,
          sharedWithId: userId,
        },
        include: {
          document: {
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
          },
        },
      });

      if (share && !share.document.deletedAt) {
        document = share.document;
        sharedPermission = share.permission;
      }
    }

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
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
      ...(sharedPermission && { sharedPermission }),
    };

    return NextResponse.json(transformedDocument);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/documents/[id] - Update a document
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const documentId = Number.parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
    }

    const body = await request.json();

    // Validate input
    const result = updateDocumentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Check ownership
    let existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
        deletedAt: null,
      },
    });

    const isOwner = !!existingDocument;
    let documentOwnerId = userId;

    // If not owner, check if user has edit permission
    if (!existingDocument) {
      const share = await prisma.documentShare.findFirst({
        where: {
          documentId,
          sharedWithId: userId,
          permission: 'edit',
        },
        include: {
          document: true,
        },
      });

      if (share && !share.document.deletedAt) {
        existingDocument = share.document;
        documentOwnerId = share.document.userId;
      }
    }

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found or no edit permission' },
        { status: 404 }
      );
    }

    const { title, content, tags } = result.data;

    // Create a version before updating (if content changed)
    if (content !== undefined && content !== existingDocument.content) {
      const latestVersion = await prisma.documentVersion.findFirst({
        where: { documentId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      await prisma.documentVersion.create({
        data: {
          documentId,
          title: existingDocument.title,
          content: existingDocument.content,
          version: (latestVersion?.version || 0) + 1,
          createdBy: userId,
        },
      });
    }

    // Update document
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        // Only allow tag updates if user is owner
        ...(tags !== undefined &&
          isOwner && {
            tags: {
              set: [], // Disconnect all existing tags
              connectOrCreate: tags.map((tagName) => ({
                where: { userId_name: { userId: documentOwnerId, name: tagName } },
                create: { name: tagName, userId: documentOwnerId },
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
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/documents/[id] - Delete a document (soft delete)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const documentId = Number.parseInt(id, 10);
    const userId = Number.parseInt(session.user.id, 10);

    if (isNaN(documentId)) {
      return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
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
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
