import { Document } from '@/types/document';
import { authenticatedFetch } from './client';

// ドキュメント一覧を取得
export async function getDocuments(onUnauthorized: () => void): Promise<Document[]> {
  const response = await authenticatedFetch(
    'http://localhost:8080/api/v1/documents',
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    },
    onUnauthorized
  );

  if (!response.ok) {
    console.error('Documents fetch failed:', response.status, response.statusText);
    throw new Error('Failed to fetch documents');
  }

  return response.json();
}

// 特定のドキュメントを取得
export async function getDocumentById(id: string, onUnauthorized: () => void): Promise<Document> {
  const response = await authenticatedFetch(
    `/api/v1/documents${id}`,
    { method: 'GET' },
    onUnauthorized
  );

  if (!response.ok) {
    throw new Error('Failed to fetch document');
  }

  return response.json();
}

// 新しいドキュメントを作成
export async function createDocument(
  document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>,
  onUnauthorized: () => void
): Promise<Document> {
  const response = await authenticatedFetch(
    `/api/v1/documents`,
    {
      method: 'POST',
      body: JSON.stringify(document)
    },
    onUnauthorized
  );

  if (!response.ok) {
    throw new Error('Failed to create document');
  }

  return response.json();
}

// ドキュメントを更新
export async function updateDocument(
  id: string,
  document: Partial<Document>,
  onUnauthorized: () => void
): Promise<Document> {
  const response = await authenticatedFetch(
    `/api/v1/documents${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(document)
    },
    onUnauthorized
  );

  if (!response.ok) {
    throw new Error('Failed to update document');
  }

  return response.json();
}

// ドキュメントを削除
export async function deleteDocument(id: string, onUnauthorized: () => void): Promise<void> {
  const response = await authenticatedFetch(
    `/api/v1/documents${id}`,
    { method: 'DELETE' },
    onUnauthorized
  );

  if (!response.ok) {
    throw new Error('Failed to delete document');
  }
}

// ドキュメント間の関連性を計算
export async function calculateRelation(
  doc1: string,
  doc2: string,
  onUnauthorized: () => void
): Promise<number> {
  const response = await authenticatedFetch(
    `/api/v1/relations`,
    {
      method: 'POST',
      body: JSON.stringify({ doc1, doc2 })
    },
    onUnauthorized
  );

  if (!response.ok) {
    throw new Error('Failed to calculate relation');
  }

  const data = await response.json();
  return data.relation;
}