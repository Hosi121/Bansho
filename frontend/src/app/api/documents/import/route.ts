import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Maximum file size (1MB)
const MAX_FILE_SIZE = 1024 * 1024;

// Maximum number of files per import
const MAX_FILES = 50;

interface ImportSuccess {
  id: string;
  title: string;
}

interface ImportFailed {
  filename: string;
  error: string;
}

// POST /api/documents/import - Import markdown files
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id, 10);

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed per import` },
        { status: 400 }
      );
    }

    const success: ImportSuccess[] = [];
    const failed: ImportFailed[] = [];

    // Process each file
    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      const filename = file.name;

      // Validate file extension
      if (!filename.toLowerCase().endsWith('.md')) {
        failed.push({ filename, error: 'File must be a .md file' });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        failed.push({ filename, error: 'File size exceeds 1MB limit' });
        continue;
      }

      try {
        // Read file content
        const content = await file.text();

        // Extract title from filename (remove .md extension)
        const title = filename.replace(/\.md$/i, '');

        // Create document
        const document = await prisma.document.create({
          data: {
            title,
            content,
            userId,
          },
        });

        success.push({
          id: document.id.toString(),
          title: document.title,
        });
      } catch (error) {
        console.error(`Error importing file ${filename}:`, error);
        failed.push({
          filename,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success,
      failed,
    });
  } catch (error) {
    console.error('Error importing documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
