import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/documents/[id]/versions - Get all versions for a document
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = parseInt(id, 10);
    const userId = parseInt(session.user.id);

    // Check if user has access to document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        deletedAt: null,
        OR: [{ userId }, { shares: { some: { sharedWithId: userId } } }],
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const versions = await prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { version: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json(
      versions.map((v) => ({
        id: v.id.toString(),
        version: v.version,
        title: v.title,
        createdAt: v.createdAt,
        user: {
          id: v.user.id.toString(),
          name: v.user.name,
          email: v.user.email,
          avatar: v.user.avatar,
        },
      }))
    );
  } catch (error) {
    console.error('Get versions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/documents/[id]/versions - Create a new version manually
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = parseInt(id, 10);
    const userId = parseInt(session.user.id);

    // Check if user owns the document or has edit permission
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        deletedAt: null,
        OR: [{ userId }, { shares: { some: { sharedWithId: userId, permission: 'edit' } } }],
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or no edit permission' },
        { status: 404 }
      );
    }

    // Get the latest version number
    const latestVersion = await prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const newVersion = (latestVersion?.version || 0) + 1;

    // Create new version
    const version = await prisma.documentVersion.create({
      data: {
        documentId,
        title: document.title,
        content: document.content,
        version: newVersion,
        createdBy: userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json(
      {
        id: version.id.toString(),
        version: version.version,
        title: version.title,
        createdAt: version.createdAt,
        user: {
          id: version.user.id.toString(),
          name: version.user.name,
          email: version.user.email,
          avatar: version.user.avatar,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create version error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
