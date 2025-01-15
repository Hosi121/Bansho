"use client";

import React, { useEffect } from 'react';
import AppLayout from '@/components/common/layout/AppLayout';
import KnowledgeGraph from '@/components/workspace/KnowledgeGraph';
import DocumentList from '@/components/workspace/DocumentList';
import { useDocuments } from '@/libs/hooks/useDocuments';
import { Loader } from 'lucide-react';
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
    isLoading,
    fetchDocuments,
    selectDocument
  } = useDocuments() as WorkspaceData;  // 型アサーション

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center text-gray-200">
          <Loader className="animate-spin" size={32} />
        </div>
      );
    }

    return (
      <div className="h-full flex">
        <aside className="w-[240px] bg-[#1a1b26] overflow-y-auto">
          <DocumentList
            documents={documents}
            selectedId={selectedDocumentId}
            onSelect={selectDocument}
          />
        </aside>

        <main className="flex-1 bg-[#f1f1f1]">
          <div className="h-full rounded-lg">
            <KnowledgeGraph
              data={graphData}
              onNodeClick={selectDocument}
              selectedNodeId={selectedDocumentId}
            />
          </div>
        </main>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-3rem)]">
        {renderContent()}
      </div>
    </AppLayout>
  );
};

export default WorkspacePage;