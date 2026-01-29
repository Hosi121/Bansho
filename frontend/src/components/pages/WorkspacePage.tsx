'use client';

import { Menu, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/common/layout/AppLayout';
import { Button } from '@/components/ui/button';
import DocumentList from '@/components/workspace/DocumentList';
import KnowledgeGraph from '@/components/workspace/KnowledgeGraph';
import { cn } from '@/lib/utils';
import { useDocuments } from '@/libs/hooks/useDocuments';
import type { Document, DocumentGraphData } from '@/types/document';

interface WorkspaceData {
  documents: Document[];
  graphData: DocumentGraphData;
  selectedDocumentId: string | null;
  isLoading: boolean;
  fetchDocuments: () => Promise<void>;
  selectDocument: (id: string) => void;
}

const WorkspacePage = () => {
  const { documents, graphData, selectedDocumentId, fetchDocuments, selectDocument } =
    useDocuments() as WorkspaceData;

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
      <div className="h-[calc(100dvh-3rem)] relative">
        {/* モバイルメニューボタン */}
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden fixed top-16 left-4 z-50 shadow-lg"
          aria-label={isSidebarOpen ? 'メニューを閉じる' : 'メニューを開く'}
        >
          {isSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>

        <div className="h-full flex">
          {/* サイドバー */}
          <aside
            className={cn(
              'w-60 bg-card border-r fixed md:relative h-full z-40 transition-transform',
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            )}
          >
            <DocumentList
              documents={documents}
              selectedId={selectedDocumentId}
              onSelect={handleDocumentSelect}
              onPinToggle={fetchDocuments}
              isMobile={isMobile}
            />
          </aside>

          {/* オーバーレイ（モバイルのみ） */}
          {isSidebarOpen && (
            <button
              type="button"
              className="fixed inset-0 bg-black/50 z-30 md:hidden cursor-default"
              onClick={() => setIsSidebarOpen(false)}
              onKeyDown={(e) => e.key === 'Escape' && setIsSidebarOpen(false)}
              aria-label="サイドバーを閉じる"
            />
          )}

          {/* メインコンテンツ */}
          <main className="flex-1 w-full md:w-[calc(100%-240px)]">
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
