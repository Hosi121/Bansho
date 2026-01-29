'use client';

import React from 'react';
import { File, Plus, FolderIcon } from 'lucide-react';
import { Document } from '@/types/document';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  documents: Document[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isMobile: boolean;
}

const DocumentList = ({ documents, selectedId, onSelect, isMobile }: DocumentListProps) => {
  const router = useRouter();
  const handleCreateNewDocument = () => {
    router.push('/editor');
  };

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
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
            フォルダ
          </div>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <FolderIcon className="mr-2 size-4" />
              全ての文書
            </Button>
          </div>
        </div>

        {/* Documents Section */}
        <div className="px-3 pt-6">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
            文書
          </div>
          <div className="space-y-1">
            {documents.map((doc) => (
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
