import { Document } from '@/types/document';

// ドキュメント一覧を取得
export const getDocuments = async (): Promise<Document[]> => {
  try {
    const response = await fetch('/api/documents', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch documents');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return [];
  }
};

// 2つのドキュメント間の関連性を計算
export const calculateRelation = async (doc1: string, doc2: string): Promise<number> => {
  try {
    const response = await fetch('/api/relations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doc1,
        doc2,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to calculate relation');
    }

    const data = await response.json();
    return data.relation;
  } catch (error) {
    console.error('Error calculating relation:', error);
    return 0; // エラー時はデフォルト値として0を返す
  }
};