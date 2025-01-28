import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/libs/hooks/useAuth';
import { Document, DocumentGraphData, DocumentNode, DocumentEdge } from '@/types/document';
import * as documentAPI from '@/libs/api/document';

// 円形レイアウトでノードの初期位置を生成
const generateGraphLayout = (documents: Document[]): DocumentGraphData => {
  const radius = 5;  // 円の半径
  const nodes: DocumentNode[] = documents.map((doc, index) => {
    const angle = (2 * Math.PI * index) / documents.length;
    return {
      id: doc.id,
      position: {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        z: 0
      },
      title: doc.title,
      documentInfo: doc
    };
  });

  // すべてのノード間にエッジを生成（後で関連度で更新）
  const edges: DocumentEdge[] = [];
  for (let i = 0; i < documents.length; i++) {
    for (let j = i + 1; j < documents.length; j++) {
      edges.push({
        id: `${documents[i].id}-${documents[j].id}`,
        sourceId: documents[i].id,
        targetId: documents[j].id,
        strength: 0.1  // 初期の関連度
      });
    }
  }

  return { nodes, edges };
};

export const useDocuments = () => {
  const { logout } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [graphData, setGraphData] = useState<DocumentGraphData>({ nodes: [], edges: [] });
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ドキュメント一覧の取得
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      
      const token = localStorage.getItem('token');
      console.log('Token when fetching documents:', token);

      const docs = await documentAPI.getDocuments(logout);
      setDocuments(docs);

      // グラフデータの初期生成
      const graph = generateGraphLayout(docs);

      // ドキュメント間の関連度を計算して更新
      const updatedEdges = [...graph.edges];
      for (const edge of updatedEdges) {
        try {
          const sourceDoc = docs.find(d => d.id === edge.sourceId);
          const targetDoc = docs.find(d => d.id === edge.targetId);

          if (sourceDoc && targetDoc) {
            const relation = await documentAPI.calculateRelation(
              sourceDoc.content,
              targetDoc.content,
              logout
            );
            edge.strength = relation;
          }
        } catch (err) {
          console.warn('Failed to calculate relation:', err);
          // エラーが発生しても処理は継続（デフォルトの関連度を使用）
        }
      }

      setGraphData({ ...graph, edges: updatedEdges });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(errorMessage);
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // 特定のドキュメントを選択
  const selectDocument = useCallback((id: string) => {
    setSelectedDocumentId(id);
  }, []);

  // ドキュメントの作成
  const createDocument = useCallback(async (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await documentAPI.createDocument(document, logout);
      await fetchDocuments(); // 一覧を再取得
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create document';
      setError(errorMessage);
      throw err;
    }
  }, [fetchDocuments, logout]);

  // ドキュメントの更新
  const updateDocument = useCallback(async (id: string, document: Partial<Document>) => {
    try {
      await documentAPI.updateDocument(id, document, logout);
      await fetchDocuments(); // 一覧を再取得
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
      setError(errorMessage);
      throw err;
    }
  }, [fetchDocuments, logout]);

  // ドキュメントの削除
  const deleteDocument = useCallback(async (id: string) => {
    try {
      await documentAPI.deleteDocument(id, logout);
      if (selectedDocumentId === id) {
        setSelectedDocumentId(null);
      }
      await fetchDocuments(); // 一覧を再取得
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      setError(errorMessage);
      throw err;
    }
  }, [fetchDocuments, logout, selectedDocumentId]);

  // コンポーネントマウント時にデータを取得
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    graphData,
    selectedDocumentId,
    isLoading,
    error,
    fetchDocuments,
    selectDocument,
    createDocument,
    updateDocument,
    deleteDocument
  };
};

export type UseDocumentsReturn = ReturnType<typeof useDocuments>;