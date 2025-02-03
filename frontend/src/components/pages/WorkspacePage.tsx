"use client";

import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import AppLayout from '@/components/common/layout/AppLayout';
import KnowledgeGraph from '@/components/workspace/KnowledgeGraph';
import DocumentList from '@/components/workspace/DocumentList';
import { useDocuments } from '@/libs/hooks/useDocuments';
import { Document, DocumentGraphData } from '@/types/document';

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
  } = useDocuments() as WorkspaceData;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDocumentSelect = (id: string) => {
    selectDocument(id);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-3rem)] bg-[#1A1B23] relative">
        {/* モバイルメニューボタン - 左上に固定 */}
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-16 left-4 z-50 p-2 rounded-lg bg-[#232429] text-white 
            hover:bg-[#2A2B32] transition-colors duration-200 shadow-lg border border-white/10"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="h-full flex">
          {/* サイドバー */}
          <aside
            className={`w-[240px] bg-[#232429] border-r border-white/10 
              fixed md:relative h-full z-40 transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          >
            <DocumentList
              documents={documents}
              selectedId={selectedDocumentId}
              onSelect={handleDocumentSelect}
              isMobile={isMobile}
            />
          </aside>

          {/* オーバーレイ（モバイルのみ） */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* メインコンテンツ */}
          <main className="flex-1 bg-[#1A1B23] w-full md:w-[calc(100%-240px)]">
            <div className="h-full w-full">
              <KnowledgeGraph
                data={graphData}
                onNodeClick={handleDocumentSelect}
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