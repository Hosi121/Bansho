import { useCallback, useState } from 'react';
import { createDocument, deleteDocument, getDocuments, updateDocument } from '@/libs/api/document';
import type { Document, DocumentGraphData } from '@/types/document';

const createGraphData = (documents: Document[]): DocumentGraphData => {
  // ノードの位置をランダムに生成
  const nodes = documents.map((doc) => ({
    id: doc.id,
    position: {
      x: (Math.random() - 0.5) * 6, // -3 から 3 の範囲
      y: (Math.random() - 0.5) * 6,
      z: (Math.random() - 0.5) * 6,
    },
    title: doc.title,
    documentInfo: doc,
  }));

  // エッジを生成（edges_from/edges_toから）
  const edges: DocumentGraphData['edges'] = [];
  const edgeSet = new Set<string>();

  documents.forEach((doc) => {
    const docEdges =
      (
        doc as unknown as {
          edges_from?: Array<{
            id: number;
            from_document_id: number;
            to_document_id: number;
            weight: number;
          }>;
        }
      ).edges_from || [];
    docEdges.forEach((edge) => {
      const edgeKey = `${edge.from_document_id}-${edge.to_document_id}`;
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        edges.push({
          id: `e${edge.id}`,
          sourceId: edge.from_document_id.toString(),
          targetId: edge.to_document_id.toString(),
          strength: edge.weight,
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

  const addDocument = useCallback(
    async (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
      setIsLoading(true);
      setError(null);
      try {
        const newDoc = await createDocument(doc);
        setDocuments((prev) => [...prev, newDoc]);
        setGraphData(createGraphData([...documents, newDoc]));
        return newDoc;
      } catch (err) {
        console.error('Failed to create document:', err);
        setError(err instanceof Error ? err.message : 'Failed to create document');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [documents]
  );

  const editDocument = useCallback(
    async (id: string, updates: Partial<Document>) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedDoc = await updateDocument(id, updates);
        setDocuments((prev) => prev.map((doc) => (doc.id === id ? updatedDoc : doc)));
        const updatedDocuments = documents.map((doc) => (doc.id === id ? updatedDoc : doc));
        setGraphData(createGraphData(updatedDocuments));
        return updatedDoc;
      } catch (err) {
        console.error('Failed to update document:', err);
        setError(err instanceof Error ? err.message : 'Failed to update document');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [documents]
  );

  const removeDocument = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await deleteDocument(id);
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        const remainingDocuments = documents.filter((doc) => doc.id !== id);
        setGraphData(createGraphData(remainingDocuments));
      } catch (err) {
        console.error('Failed to delete document:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete document');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [documents]
  );

  const selectDocument = useCallback((id: string) => {
    setSelectedDocumentId(id);
  }, []);

  // Bulk selection
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(documents.map((doc) => doc.id)));
  }, [documents]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Bulk operations
  const bulkMove = useCallback(
    async (folderId: string | null) => {
      if (selectedIds.size === 0) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/documents/bulk/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentIds: Array.from(selectedIds),
            folderId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to move documents');
        }

        clearSelection();
        await fetchDocuments();
      } catch (err) {
        console.error('Failed to bulk move documents:', err);
        setError(err instanceof Error ? err.message : 'Failed to move documents');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedIds, clearSelection, fetchDocuments]
  );

  const bulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/documents/bulk/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds: Array.from(selectedIds),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete documents');
      }

      clearSelection();
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to bulk delete documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete documents');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedIds, clearSelection, fetchDocuments]);

  return {
    documents,
    graphData,
    selectedDocumentId,
    selectedIds,
    isLoading,
    error,
    fetchDocuments,
    addDocument,
    editDocument,
    removeDocument,
    selectDocument,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkMove,
    bulkDelete,
  };
};

export type UseDocumentsReturn = ReturnType<typeof useDocuments>;
