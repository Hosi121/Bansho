import { useState, useCallback } from 'react';
import { Document, DocumentGraphData } from '@/types/document';

// モックデータ
export const MOCK_DOCUMENTS: Document[] = [
    {
        id: '1',
        title: "研究プロジェクトA",
        content: "研究プロジェクトAの詳細な内容です。AIを活用した新しい手法の開発について...",
        excerpt: "AIを活用した新しい研究プロジェクト",
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["研究", "AI", "プロジェクト"]
    },
    {
        id: '2',
        title: "週次ミーティング議事録",
        content: "週次ミーティングの詳細な議事録。進捗状況の確認と今後の計画について...",
        excerpt: "プロジェクトの進捗状況の確認",
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["ミーティング", "週次"]
    },
    {
        id: '3',
        title: "技術仕様書",
        content: "システムの技術仕様書の詳細。アーキテクチャ設計と実装方針について...",
        excerpt: "新システムの技術仕様の概要",
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["技術", "仕様"]
    }
];

const createMockGraphData = (documents: Document[]): DocumentGraphData => {
    // ノードの位置をランダムに生成
    const nodes = documents.map(doc => ({
        id: doc.id,
        position: {
            x: (Math.random() - 0.5) * 6,  // -3 から 3 の範囲
            y: (Math.random() - 0.5) * 6,
            z: (Math.random() - 0.5) * 6
        },
        title: doc.title,
        documentInfo: doc
    }));

    // 簡単なエッジを生成（すべてのノードを順番につなぐ）
    const edges = nodes.slice(0, -1).map((node, index) => ({
        id: `e${index}`,
        sourceId: node.id,
        targetId: nodes[index + 1].id,
        strength: 0.5 + Math.random() * 0.5  // 0.5 から 1.0 の範囲
    }));

    // 追加のエッジを生成（最初と最後のノードを接続）
    if (nodes.length > 2) {
        edges.push({
            id: `e${edges.length}`,
            sourceId: nodes[0].id,
            targetId: nodes[nodes.length - 1].id,
            strength: 0.5 + Math.random() * 0.5
        });
    }

    return { nodes, edges };
};

export const useDocuments = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [graphData, setGraphData] = useState<DocumentGraphData>({ nodes: [], edges: [] });
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        try {
            // モックデータを使用
            await new Promise(resolve => setTimeout(resolve, 500)); // ローディング表示のために遅延を追加
            setDocuments(MOCK_DOCUMENTS);
            setGraphData(createMockGraphData(MOCK_DOCUMENTS));
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const selectDocument = useCallback((id: string) => {
        setSelectedDocumentId(id);
    }, []);

    return {
        documents,
        graphData,
        selectedDocumentId,
        isLoading,
        fetchDocuments,
        selectDocument
    };
};

export type UseDocumentsReturn = ReturnType<typeof useDocuments>;