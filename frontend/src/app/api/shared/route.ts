import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/shared - Get all documents shared with the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id, 10);

    const shares = await prisma.documentShare.findMany({
      where: {
        sharedWithId: userId,
        document: {
          deletedAt: null,
        },
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: { id: true, email: true, name: true, avatar: true },
            },
            tags: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sharedDocuments = shares.map((share) => ({
      id: share.document.id.toString(),
      title: share.document.title,
      content: share.document.content,
      createdAt: share.document.createdAt,
      updatedAt: share.document.updatedAt,
      tags: share.document.tags.map((tag) => tag.name),
      permission: share.permission,
      sharedAt: share.createdAt,
      owner: {
        id: share.document.user.id.toString(),
        email: share.document.user.email,
        name: share.document.user.name,
        avatar: share.document.user.avatar,
      },
    }));

    return NextResponse.json(sharedDocuments);
  } catch (error) {
    console.error('Get shared documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
