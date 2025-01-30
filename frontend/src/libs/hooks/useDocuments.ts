import { useState, useCallback } from 'react';
import { useDocumentList } from '@/libs/hooks/useDocumentList';
import { useDocumentGraph } from '@/libs/hooks/useDocumentGraph';

export const useDocuments = () => {
  // --- ドキュメント一覧: CRUD
  const {
    documents,
    isLoading: isDocumentLoading,
    error: documentError,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  } = useDocumentList();

  // --- グラフ生成・関連度計算
  const {
    graphData,
    isCalculatingRelation,
    graphError,
    regenerateGraph,
  } = useDocumentGraph(documents);

  // (1) 選択中ドキュメントIDを管理する
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  // (2) 選択を更新する関数を用意
  const selectDocument = useCallback((id: string) => {
    setSelectedDocumentId(id);
  }, []);

  const isLoading = isDocumentLoading || isCalculatingRelation;
  const error = documentError || graphError || null;

  // (3) 選択中ID & setter を返却する
  return {
    documents,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    graphData,
    regenerateGraph,
    isLoading,
    error,

    selectedDocumentId, // ここ追加
    selectDocument,      // ここ追加
  };
};
