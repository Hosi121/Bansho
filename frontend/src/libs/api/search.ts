import { Document } from '@/types/document';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface SearchDocumentsParams {
  query: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export const searchDocuments = async (params: SearchDocumentsParams): Promise<{
  items: Document[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}> => {
  const queryParams = new URLSearchParams({
    q: params.query,
    ...(params.page && { page: params.page.toString() }),
    ...(params.limit && { limit: params.limit.toString() }),
    ...(params.tags && { tags: params.tags.join(',') })
  });

  const response = await fetch(
    `${API_BASE_URL}/api/v1/documents/search?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '検索に失敗しました');
  }

  return response.json();
};