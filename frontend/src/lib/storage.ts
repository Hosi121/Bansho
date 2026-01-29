import { put, del } from '@vercel/blob';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export async function uploadImage(
  file: File,
  documentId: string
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5MB limit');
  }

  // Validate mime type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const pathname = `documents/${documentId}/${timestamp}-${sanitizedName}`;

  // Upload to Vercel Blob
  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    filename: file.name,
    size: file.size,
    mimeType: file.type,
  };
}

export async function deleteImage(url: string): Promise<void> {
  await del(url);
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'ファイルサイズは5MB以下にしてください' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: '対応している画像形式: JPEG, PNG, GIF, WebP, SVG' };
  }

  return { valid: true };
}
