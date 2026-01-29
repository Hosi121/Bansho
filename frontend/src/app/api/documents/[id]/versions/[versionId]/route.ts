import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/documents/[id]/versions/[versionId] - Get a specific version
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, versionId } = await params;
    const documentId = parseInt(id, 10);
    const versionIdNum = parseInt(versionId, 10);
    const userId = Number.parseInt(session.user.id, 10);

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

    const version = await prisma.documentVersion.findFirst({
      where: {
        id: versionIdNum,
        documentId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: version.id.toString(),
      version: version.version,
      title: version.title,
      content: version.content,
      createdAt: version.createdAt,
      user: {
        id: version.user.id.toString(),
        name: version.user.name,
        email: version.user.email,
        avatar: version.user.avatar,
      },
    });
  } catch (error) {
    console.error('Get version error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/documents/[id]/versions/[versionId] - Restore a version
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, versionId } = await params;
    const documentId = parseInt(id, 10);
    const versionIdNum = parseInt(versionId, 10);
    const userId = Number.parseInt(session.user.id, 10);

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

    // Get the version to restore
    const versionToRestore = await prisma.documentVersion.findFirst({
      where: {
        id: versionIdNum,
        documentId,
      },
    });

    if (!versionToRestore) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // Get the latest version number for creating a new version
    const latestVersion = await prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    // Transaction: create backup version and restore
    const [_backupVersion, updatedDocument] = await prisma.$transaction([
      // Create a version from current state before restoring
      prisma.documentVersion.create({
        data: {
          documentId,
          title: document.title,
          content: document.content,
          version: newVersionNumber,
          createdBy: userId,
        },
      }),
      // Restore the document to the selected version
      prisma.document.update({
        where: { id: documentId },
        data: {
          title: versionToRestore.title,
          content: versionToRestore.content,
        },
        include: { tags: true },
      }),
    ]);

    return NextResponse.json({
      id: updatedDocument.id.toString(),
      title: updatedDocument.title,
      content: updatedDocument.content,
      tags: updatedDocument.tags.map((t) => t.name),
      createdAt: updatedDocument.createdAt,
      updatedAt: updatedDocument.updatedAt,
      message: `Restored to version ${versionToRestore.version}`,
    });
  } catch (error) {
    console.error('Restore version error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
