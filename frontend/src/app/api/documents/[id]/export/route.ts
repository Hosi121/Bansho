import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generatePDF } from '@/lib/pdf';
import { prisma } from '@/lib/prisma';

// GET /api/documents/[id]/export?format=pdf|markdown
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = parseInt(id, 10);
    const userId = parseInt(session.user.id);

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'markdown';

    if (!['pdf', 'markdown'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "pdf" or "markdown"' },
        { status: 400 }
      );
    }

    // Check if user owns the document
    let document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
        deletedAt: null,
      },
    });

    // If not owner, check if document is shared with user
    if (!document) {
      const share = await prisma.documentShare.findFirst({
        where: {
          documentId,
          sharedWithId: userId,
        },
        include: {
          document: true,
        },
      });

      if (share && !share.document.deletedAt) {
        document = share.document;
      }
    }

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Sanitize filename
    const sanitizedTitle =
      document.title
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 100) || 'document';

    if (format === 'markdown') {
      // Export as Markdown
      const content = `# ${document.title}\n\n${document.content}`;
      const filename = `${sanitizedTitle}.md`;

      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        },
      });
    }

    // Export as PDF
    try {
      const pdfBuffer = await generatePDF({
        title: document.title,
        content: document.content,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      });

      const filename = `${sanitizedTitle}.pdf`;

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
