import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/libs/hooks/useAuth';
import { Document } from '@/types/document';
import * as documentAPI from '@/libs/api/document';

/**
 * ドキュメント一覧のCRUD機能を提供するフック
 */
export const useDocumentList = () => {
  const { logout } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ドキュメント一覧の取得
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await documentAPI.getDocuments(logout);
      setDocuments(docs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(errorMessage);
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // ドキュメントの作成
  const createDocument = useCallback(
    async (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        await documentAPI.createDocument(document, logout);
        await fetchDocuments(); // 一覧を再取得
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create document';
        setError(errorMessage);
        throw err;
      }
    },
    [fetchDocuments, logout]
  );

  // ドキュメントの更新
  const updateDocument = useCallback(
    async (id: string, document: Partial<Document>) => {
      try {
        await documentAPI.updateDocument(id, document, logout);
        await fetchDocuments(); // 一覧を再取得
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
        setError(errorMessage);
        throw err;
      }
    },
    [fetchDocuments, logout]
  );

  // ドキュメントの削除
  const deleteDocument = useCallback(
    async (id: string) => {
      try {
        await documentAPI.deleteDocument(id, logout);
        await fetchDocuments(); // 一覧を再取得
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
        setError(errorMessage);
        throw err;
      }
    },
    [fetchDocuments, logout]
  );

  // マウント時・あるいは依存が変わったときに自動的に取得
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  };
};

export type UseDocumentListReturn = ReturnType<typeof useDocumentList>;