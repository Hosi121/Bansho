"use client";

import React, { useEffect } from 'react';
import AppLayout from '@/components/common/layout/AppLayout';
import KnowledgeGraph from '@/components/workspace/KnowledgeGraph';
import DocumentList from '@/components/workspace/DocumentList';
import { useDocuments } from '@/libs/hooks/useDocuments';
import { Document, DocumentGraphData } from '@/types/document';

// 明示的に型を指定
interface WorkspaceData {
  documents: Document[];
  graphData: DocumentGraphData;
  selectedDocumentId: string | null;
  isLoading: boolean;
  fetchDocuments: () => Promise<void>;
  selectDocument: (id: string) => void;
}

const WorkspacePage = () => {
  const {
    documents,
    graphData,
    selectedDocumentId,
    fetchDocuments,
    selectDocument
  } = useDocuments() as WorkspaceData;  // 型アサーション

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <AppLayout>
      <div className="h-[calc(100vh-3rem)] bg-[#1A1B23]">
        <div className="h-full flex">
          <aside className="w-[240px] bg-[#232429] border-r border-white/10">
            <DocumentList
              documents={documents}
              selectedId={selectedDocumentId}
              onSelect={selectDocument}
            />
          </aside>
          <main className="flex-1 bg-[#1A1B23]">
            <div className="h-full w-full">
              <KnowledgeGraph
                data={graphData}
                onNodeClick={selectDocument}
                selectedNodeId={selectedDocumentId}
              />
            </div>
          </main>
        </div>
      </div>
    </AppLayout>
  );
};

export default WorkspacePage;