import { useState, useCallback } from 'react';
import { Document, DocumentGraphData } from '@/types/document';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '@/libs/api/document';

const createGraphData = (documents: Document[]): DocumentGraphData => {
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

  // エッジを生成（edges_from/edges_toから）
  const edges: DocumentGraphData['edges'] = [];
  const edgeSet = new Set<string>();

  documents.forEach(doc => {
    const docEdges = (doc as unknown as { edges_from?: Array<{ id: number; from_document_id: number; to_document_id: number; weight: number }> }).edges_from || [];
    docEdges.forEach(edge => {
      const edgeKey = `${edge.from_document_id}-${edge.to_document_id}`;
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        edges.push({
          id: `e${edge.id}`,
          sourceId: edge.from_document_id.toString(),
          targetId: edge.to_document_id.toString(),
          strength: edge.weight
        });
      }
    });
  });

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
      const data = await getDocuments();
      setDocuments(data);
      setGraphData(createGraphData(data));
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addDocument = useCallback(async (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newDoc = await createDocument(doc);
      setDocuments(prev => [...prev, newDoc]);
      setGraphData(createGraphData([...documents, newDoc]));
      return newDoc;
    } catch (err) {
      console.error('Failed to create document:', err);
      setError(err instanceof Error ? err.message : 'Failed to create document');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

  const editDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedDoc = await updateDocument(id, updates);
      setDocuments(prev => prev.map(doc => doc.id === id ? updatedDoc : doc));
      const updatedDocuments = documents.map(doc => doc.id === id ? updatedDoc : doc);
      setGraphData(createGraphData(updatedDocuments));
      return updatedDoc;
    } catch (err) {
      console.error('Failed to update document:', err);
      setError(err instanceof Error ? err.message : 'Failed to update document');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

  const removeDocument = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      const remainingDocuments = documents.filter(doc => doc.id !== id);
      setGraphData(createGraphData(remainingDocuments));
    } catch (err) {
      console.error('Failed to delete document:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

  const selectDocument = useCallback((id: string) => {
    setSelectedDocumentId(id);
  }, []);

  return {
    documents,
    graphData,
    selectedDocumentId,
    isLoading,
    error,
    fetchDocuments,
    addDocument,
    editDocument,
    removeDocument,
    selectDocument
  };
};

export type UseDocumentsReturn = ReturnType<typeof useDocuments>;
