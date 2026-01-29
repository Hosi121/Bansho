import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { uploadImage, deleteImage } from '@/lib/storage';

// GET /api/documents/[id]/images - Get all images for a document
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = parseInt(id, 10);
    const userId = session.user.id;

    // Check if user has access to document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        deletedAt: null,
        OR: [
          { userId },
          { shares: { some: { sharedWithId: userId } } },
        ],
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const images = await prisma.documentImage.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      images.map((img) => ({
        id: img.id.toString(),
        url: img.url,
        filename: img.filename,
        mimeType: img.mimeType,
        size: img.size,
        createdAt: img.createdAt,
      }))
    );
  } catch (error) {
    console.error('Get images error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/documents/[id]/images - Upload an image
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = parseInt(id, 10);
    const userId = session.user.id;

    // Check if user owns the document or has edit permission
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        deletedAt: null,
        OR: [
          { userId },
          { shares: { some: { sharedWithId: userId, permission: 'edit' } } },
        ],
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or no edit permission' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to storage
    const uploadResult = await uploadImage(file, id);

    // Save to database
    const image = await prisma.documentImage.create({
      data: {
        documentId,
        url: uploadResult.url,
        filename: uploadResult.filename,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
      },
    });

    return NextResponse.json(
      {
        id: image.id.toString(),
        url: image.url,
        filename: image.filename,
        mimeType: image.mimeType,
        size: image.size,
        createdAt: image.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload image error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/documents/[id]/images?imageId=xxx - Delete an image
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = parseInt(id, 10);
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    // Check if user owns the document or has edit permission
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        deletedAt: null,
        OR: [
          { userId },
          { shares: { some: { sharedWithId: userId, permission: 'edit' } } },
        ],
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or no edit permission' },
        { status: 404 }
      );
    }

    // Get image
    const image = await prisma.documentImage.findFirst({
      where: {
        id: parseInt(imageId, 10),
        documentId,
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete from storage
    try {
      await deleteImage(image.url);
    } catch (err) {
      console.error('Failed to delete from storage:', err);
      // Continue to delete from database anyway
    }

    // Delete from database
    await prisma.documentImage.delete({
      where: { id: image.id },
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
