'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/common/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { BulkActionBar } from '@/components/workspace/BulkActionBar';
import DocumentList from '@/components/workspace/DocumentList';
import KnowledgeGraph from '@/components/workspace/KnowledgeGraph';
import { cn } from '@/lib/utils';
import { useDocuments } from '@/libs/hooks/useDocuments';
import { useFolders } from '@/libs/hooks/useFolders';

const WorkspacePage = () => {
  const {
    documents,
    graphData,
    selectedDocumentId,
    selectedIds,
    isLoading,
    fetchDocuments,
    selectDocument,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkMove,
    bulkDelete,
  } = useDocuments();

  const { folders } = useFolders();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

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

  // Enable selection mode when there are selections
  useEffect(() => {
    if (selectedIds.size > 0) {
      setSelectionMode(true);
    }
  }, [selectedIds.size]);

  const handleClearSelection = () => {
    clearSelection();
    setSelectionMode(false);
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
              selectedIds={selectedIds}
              selectionMode={selectionMode}
              onSelect={handleDocumentSelect}
              onPinToggle={fetchDocuments}
              onToggleSelection={toggleSelection}
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

        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={documents.length}
          folders={folders}
          onSelectAll={selectAll}
          onClearSelection={handleClearSelection}
          onMove={bulkMove}
          onDelete={bulkDelete}
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
};

export default WorkspacePage;
