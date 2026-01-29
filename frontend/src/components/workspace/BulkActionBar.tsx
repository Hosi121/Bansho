'use client';

import { CheckSquare, FolderInput, Square, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Folder } from '@/types/document';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  folders: Folder[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onMove: (folderId: string | null) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  folders,
  onSelectAll,
  onClearSelection,
  onMove,
  onDelete,
  isLoading = false,
}: BulkActionBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    await onDelete();
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-card border rounded-lg shadow-lg">
        <span className="text-sm font-medium">{selectedCount}件選択中</span>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
          disabled={isLoading}
        >
          {selectedCount === totalCount ? (
            <>
              <Square className="mr-1 size-4" />
              選択解除
            </>
          ) : (
            <>
              <CheckSquare className="mr-1 size-4" />
              全て選択
            </>
          )}
        </Button>

        <div className="h-4 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isLoading}>
              <FolderInput className="mr-1 size-4" />
              移動
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => onMove(null)}>ルートに移動</DropdownMenuItem>
            {folders.map((folder) => (
              <DropdownMenuItem key={folder.id} onClick={() => onMove(folder.id)}>
                {folder.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isLoading}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1 size-4" />
          削除
        </Button>

        <div className="h-4 w-px bg-border" />

        <Button variant="ghost" size="icon" onClick={onClearSelection} disabled={isLoading}>
          <X className="size-4" />
          <span className="sr-only">選択を解除</span>
        </Button>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedCount}件のドキュメントを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              選択したドキュメントはゴミ箱に移動されます。後から復元することができます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
