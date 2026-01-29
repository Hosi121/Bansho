import { Document } from '@/types/document';

// ドキュメント一覧を取得
export async function getDocuments(): Promise<Document[]> {
  const response = await fetch('/api/documents', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    console.error('Documents fetch failed:', response.status, response.statusText);
    throw new Error('Failed to fetch documents');
  }

  return response.json();
}

// 特定のドキュメントを取得
export async function getDocumentById(id: string): Promise<Document> {
  const response = await fetch(`/api/documents/${id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 404) {
      throw new Error('Document not found');
    }
    throw new Error('Failed to fetch document');
  }

  return response.json();
}

// ユーザーのドキュメント一覧を取得（getDocumentsと同じ）
export async function getDocumentsByUserId(): Promise<Document[]> {
  return getDocuments();
}

// 新しいドキュメントを作成
export async function createDocument(
  document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Document> {
  const response = await fetch('/api/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(document)
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to create document');
  }

  return response.json();
}

// ドキュメントを更新
export async function updateDocument(
  id: string,
  document: Partial<Document>
): Promise<Document> {
  const response = await fetch(`/api/documents/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(document)
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 404) {
      throw new Error('Document not found');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to update document');
  }

  return response.json();
}

// ドキュメントを削除
export async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`/api/documents/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 404) {
      throw new Error('Document not found');
    }
    throw new Error('Failed to delete document');
  }
}

// ドキュメントを検索
export async function searchDocuments(query: string): Promise<Document[]> {
  const response = await fetch(`/api/documents/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to search documents');
  }

  return response.json();
}

// ドキュメント間の関連性を計算
export async function calculateRelation(
  doc1: string,
  doc2: string
): Promise<number> {
  const response = await fetch('/api/relations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ documentIds: [parseInt(doc1), parseInt(doc2)] })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to calculate relation');
  }

  const data = await response.json();
  return data.relation;
}
