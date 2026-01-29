import { Document } from '@/types/document';

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
  const response = await fetch(
    `/api/documents/search?q=${encodeURIComponent(params.query)}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('認証が必要です');
    }
    const error = await response.json();
    throw new Error(error.error || '検索に失敗しました');
  }

  const items: Document[] = await response.json();

  // Apply client-side filtering for tags if provided
  let filteredItems = items;
  if (params.tags && params.tags.length > 0) {
    filteredItems = items.filter((item) =>
      params.tags!.some((tag) => item.tags.includes(tag))
    );
  }

  // Apply pagination if provided
  const page = params.page || 1;
  const limit = params.limit || 20;
  const startIndex = (page - 1) * limit;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + limit);

  return {
    items: paginatedItems,
    totalCount: filteredItems.length,
    currentPage: page,
    totalPages: Math.ceil(filteredItems.length / limit),
  };
};
