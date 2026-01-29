'use client';

import React from 'react';
import { File, Plus } from 'lucide-react';
import { Document } from '@/types/document';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FolderTree } from '@/components/workspace/FolderTree';
import { useFolders } from '@/libs/hooks/useFolders';

interface DocumentListProps {
  documents: Document[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isMobile: boolean;
}

const DocumentList = ({ documents, selectedId, onSelect, isMobile }: DocumentListProps) => {
  const router = useRouter();
  const {
    folderTree,
    selectedFolderId,
    createFolder,
    updateFolder,
    deleteFolder,
    selectFolder,
  } = useFolders();

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
      <div className={cn("p-4", isMobile && "pt-16")}>
        <Button
          className="w-full"
          onClick={handleCreateNewDocument}
        >
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
              <Button
                key={doc.id}
                variant={selectedId === doc.id ? "secondary" : "ghost"}
                onClick={() => onSelect(doc.id)}
                className={cn(
                  "w-full justify-start h-auto py-2",
                  selectedId === doc.id && "bg-primary/20"
                )}
              >
                <File className={cn(
                  "mr-2 size-4 flex-shrink-0",
                  selectedId === doc.id ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="text-left">
                  <div className="text-sm font-medium truncate">
                    {doc.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(doc.updatedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;
