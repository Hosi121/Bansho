"use client";

import React, { useEffect } from 'react';
import AppLayout from '@/components/common/layout/AppLayout';
import KnowledgeGraph from '@/components/workspace/KnowledgeGraph';
import DocumentList from '@/components/workspace/DocumentList';
import { useDocuments } from '@/libs/hooks/useDocuments';

const WorkspacePage = () => {
  const {
    documents,
    graphData,
    selectedDocumentId,
    isLoading,
    error,
    fetchDocuments,
    selectDocument
  } = useDocuments();

  // 依存配列を空にして初回のみ実行されるようにする
  useEffect(() => {
    fetchDocuments();
  }, []); // ← fetchDocuments を依存配列から削除

  if (error) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-3rem)] bg-[#1A1B23] flex items-center justify-center">
          <div className="text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
            {error}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-3rem)] bg-[#1A1B23] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7B8CDE]" />
        </div>
      </AppLayout>
    );
  }

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