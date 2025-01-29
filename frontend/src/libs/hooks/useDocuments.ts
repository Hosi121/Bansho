import { useDocumentList } from '@/libs/hooks/useDocumentList';
import { useDocumentGraph } from '@/libs/hooks/useDocumentGraph';

export const useDocuments = () => {
  const {
    documents,
    isLoading: isDocumentLoading,
    error: documentError,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  } = useDocumentList();

  const {
    graphData,
    isCalculatingRelation,
    graphError,
    regenerateGraph,
  } = useDocumentGraph(documents);

  // このフックで一緒くたに返す
  return {
    // ドキュメント関連
    documents,
    isDocumentLoading,
    documentError,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,

    // グラフ関連
    graphData,
    isCalculatingRelation,
    graphError,
    regenerateGraph,
  };
};