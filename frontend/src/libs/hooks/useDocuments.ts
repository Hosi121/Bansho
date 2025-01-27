import { useState, useCallback, useEffect } from 'react';
import { Document, DocumentGraphData, DocumentNode, DocumentEdge } from '@/types/document';
import * as documentAPI from '@/libs/api/document';

const generateGraphLayout = (documents: Document[]): DocumentGraphData => {
  // 円形レイアウトの生成
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

  // 初期のエッジを生成
  const edges: DocumentEdge[] = [];
  for (let i = 0; i < documents.length; i++) {
    for (let j = i + 1; j < documents.length; j++) {
      // タグの共通性に基づいて初期の関連度を設定
      const commonTags = documents[i].tags.filter(tag => 
        documents[j].tags.includes(tag)
      );
      const initialStrength = commonTags.length > 0 ? 0.3 : 0.1;
      
      edges.push({
        id: `e${i}-${j}`,
        sourceId: documents[i].id,
        targetId: documents[j].id,
        strength: initialStrength
      });
    }
  }

  return { nodes, edges };
};

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [graphData, setGraphData] = useState<DocumentGraphData>({ nodes: [], edges: [] });
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await documentAPI.getDocuments();
      setDocuments(docs);
      
      // グラフデータを生成
      const graph = generateGraphLayout(docs);
      setGraphData(graph);

      // 文書間の関連性を計算して更新
      const updatedEdges = [...graph.edges];
      for (const edge of updatedEdges) {
        try {
          const relation = await documentAPI.calculateRelation(
            documents.find(d => d.id === edge.sourceId)?.content || '',
            documents.find(d => d.id === edge.targetId)?.content || ''
          );
          edge.strength = relation;
        } catch (err) {
          console.warn('Failed to calculate relation:', err);
          // エッジの関連度は初期値のまま
        }
      }
      
      setGraphData(prev => ({ ...prev, edges: updatedEdges }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Failed to fetch documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

  const selectDocument = useCallback((id: string) => {
    setSelectedDocumentId(id);
  }, []);

  // コンポーネントマウント時にデータを取得
  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    graphData,
    selectedDocumentId,
    isLoading,
    error,
    fetchDocuments,
    selectDocument
  };
};

export type UseDocumentsReturn = ReturnType<typeof useDocuments>;