import { useState, useCallback, useEffect } from 'react';
import { DocumentGraphData, DocumentEdge, DocumentNode, Document } from '@/types/document';
import * as documentAPI from '@/libs/api/document';
import { useAuth } from '@/libs/hooks/useAuth';

const generateGraphLayout = (documents: Document[]): DocumentGraphData => {
  if (documents.length === 0) {
    return { nodes: [], edges: [] };
  }
  const radius = 5; // 円の半径
  const nodes: DocumentNode[] = documents.map((doc, index) => {
    const angle = (2 * Math.PI * index) / documents.length;
    return {
      id: doc.id,
      position: {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        z: 0,
      },
      title: doc.title,
      documentInfo: doc,
    };
  });

  const edges: DocumentEdge[] = [];
  for (let i = 0; i < documents.length; i++) {
    for (let j = i + 1; j < documents.length; j++) {
      edges.push({
        id: `${documents[i].id}-${documents[j].id}`,
        sourceId: documents[i].id,
        targetId: documents[j].id,
        strength: 0.1, // 初期値
      });
    }
  }

  return { nodes, edges };
};

/**
 * ドキュメント一覧からグラフデータを生成し、関連度を計算・更新するフック
 */
export const useDocumentGraph = (documents: Document[]) => {
  const { logout } = useAuth();
  const [graphData, setGraphData] = useState<DocumentGraphData>({ nodes: [], edges: [] });
  const [isCalculatingRelation, setIsCalculatingRelation] = useState<boolean>(false);
  const [graphError, setGraphError] = useState<string | null>(null);

  // ドキュメントが変わるたびにグラフデータを再生成
  const regenerateGraph = useCallback(async () => {
    if (!documents || documents.length === 0) {
      setGraphData({ nodes: [], edges: [] });
      return;
    }

    setGraphError(null);
    setIsCalculatingRelation(true);

    try {
      // 1) グラフ初期配置
      const graph = generateGraphLayout(documents);

      // 2) ドキュメント間の関連度計算
      const updatedEdges = [...graph.edges];
      for (const edge of updatedEdges) {
        try {
          const sourceDoc = documents.find((d) => d.id === edge.sourceId);
          const targetDoc = documents.find((d) => d.id === edge.targetId);

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
          // 計算に失敗した場合はそのままにしておく
        }
      }

      setGraphData({ ...graph, edges: updatedEdges });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to build graph';
      setGraphError(errorMessage);
    } finally {
      setIsCalculatingRelation(false);
    }
  }, [documents, logout]);

  // documents が変わるたびに再生成
  useEffect(() => {
    regenerateGraph();
  }, [documents, regenerateGraph]);

  return {
    graphData,
    isCalculatingRelation,
    graphError,
    regenerateGraph,
  };
};

export type UseDocumentGraphReturn = ReturnType<typeof useDocumentGraph>;