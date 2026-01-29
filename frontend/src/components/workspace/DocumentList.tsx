'use client';

import { File, Pin, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FolderTree } from '@/components/workspace/FolderTree';
import { cn } from '@/lib/utils';
import { useFolders } from '@/libs/hooks/useFolders';
import type { Document } from '@/types/document';

interface DocumentListProps {
  documents: Document[];
  selectedId: string | null;
  selectedIds?: Set<string>;
  selectionMode?: boolean;
  onSelect: (id: string) => void;
  onPinToggle?: (id: string) => void;
  onToggleSelection?: (id: string) => void;
  isMobile: boolean;
}

const DocumentList = ({
  documents,
  selectedId,
  selectedIds = new Set(),
  selectionMode = false,
  onSelect,
  onPinToggle,
  onToggleSelection,
  isMobile,
}: DocumentListProps) => {
  const router = useRouter();
  const [pinningId, setPinningId] = useState<string | null>(null);
  const { folderTree, selectedFolderId, createFolder, updateFolder, deleteFolder, selectFolder } =
    useFolders();

  const handlePinToggle = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (pinningId) return;

    setPinningId(docId);
    try {
      const response = await fetch(`/api/documents/${docId}/pin`, {
        method: 'POST',
      });
      if (response.ok) {
        onPinToggle?.(docId);
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    } finally {
      setPinningId(null);
    }
  };

  const handleCreateNewDocument = () => {
    router.push('/editor');
  };

  const handleCreateFolder = async (name: string, parentId: string | null) => {
    await createFolder({ name, parentId });
  };

  const handleRenameFolder = async (id: string, name: string) => {
    await updateFolder(id, { name });
  };

  // Filter documents by selected folder
  // For now, show all documents when "全ての文書" is selected
  // TODO: Add folderId to Document type and filter accordingly
  const filteredDocuments = documents;

  return (
    <div className="flex flex-col h-full">
      {/* New Document Button */}
      <div className={cn('p-4', isMobile && 'pt-16')}>
        <Button className="w-full" onClick={handleCreateNewDocument}>
          <Plus className="mr-2 size-4" />
          新しい文書を作成
        </Button>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Folders Section */}
        <div className="px-3 pt-2">
          <FolderTree
            folders={folderTree}
            selectedFolderId={selectedFolderId}
            onSelectFolder={selectFolder}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={deleteFolder}
          />
        </div>

        {/* Documents Section */}
        <div className="px-3 pt-6">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
            文書
          </div>
          <div className="space-y-1">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="group relative flex items-center">
                {selectionMode && (
                  <Checkbox
                    checked={selectedIds.has(doc.id)}
                    onCheckedChange={() => onToggleSelection?.(doc.id)}
                    className="ml-2 mr-1"
                    aria-label={`${doc.title}を選択`}
                  />
                )}
                <Button
                  variant={selectedId === doc.id ? 'secondary' : 'ghost'}
                  onClick={() => onSelect(doc.id)}
                  className={cn(
                    'flex-1 justify-start h-auto py-2 pr-10',
                    selectedId === doc.id && 'bg-primary/20',
                    selectedIds.has(doc.id) && 'bg-primary/10'
                  )}
                >
                  <File
                    className={cn(
                      'mr-2 size-4 flex-shrink-0',
                      selectedId === doc.id ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <div className="text-left min-w-0 flex-1">
                    <div className="text-sm font-medium truncate flex items-center gap-1">
                      {doc.isPinned && <Pin className="size-3 text-primary flex-shrink-0" />}
                      <span className="truncate">{doc.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(doc.updatedAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </Button>
                {!selectionMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'absolute right-1 top-1/2 -translate-y-1/2 size-7 opacity-0 group-hover:opacity-100 transition-opacity',
                      doc.isPinned && 'opacity-100'
                    )}
                    onClick={(e) => handlePinToggle(e, doc.id)}
                    disabled={pinningId === doc.id}
                    title={doc.isPinned ? 'ピン留めを解除' : 'ピン留め'}
                  >
                    <Pin
                      className={cn(
                        'size-4',
                        doc.isPinned ? 'text-primary fill-primary' : 'text-muted-foreground'
                      )}
                    />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;
