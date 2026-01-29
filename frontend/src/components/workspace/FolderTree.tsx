'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FolderIcon, FolderOpen, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { FolderTreeNode } from '@/libs/hooks/useFolders';
import { CreateFolderDialog } from '@/components/dialogs/CreateFolderDialog';
import { toast } from 'sonner';

interface FolderTreeProps {
  folders: FolderTreeNode[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => Promise<void>;
  onRenameFolder: (id: string, name: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
}

interface FolderItemProps {
  folder: FolderTreeNode;
  level: number;
  selectedFolderId: string | null;
  expandedFolders: Set<string>;
  onToggleExpand: (folderId: string) => void;
  onSelectFolder: (folderId: string | null) => void;
  onCreateSubfolder: (parentId: string, parentName: string) => void;
  onRenameFolder: (id: string, name: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
}

function FolderItem({
  folder,
  level,
  selectedFolderId,
  expandedFolders,
  onToggleExpand,
  onSelectFolder,
  onCreateSubfolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const isExpanded = expandedFolders.has(folder.id);
  const isSelected = selectedFolderId === folder.id;
  const hasChildren = folder.children.length > 0;

  const handleRename = async () => {
    if (newName.trim() && newName !== folder.name) {
      try {
        await onRenameFolder(folder.id, newName.trim());
        toast.success('フォルダ名を変更しました');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'エラーが発生しました');
        setNewName(folder.name);
      }
    }
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    try {
      await onDeleteFolder(folder.id);
      toast.success('フォルダを削除しました');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer group',
          isSelected ? 'bg-primary/20' : 'hover:bg-muted'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <button
          className="p-0.5 hover:bg-muted rounded"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) {
              onToggleExpand(folder.id);
            }
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" />
            )
          ) : (
            <span className="size-4" />
          )}
        </button>

        <div
          className="flex items-center gap-2 flex-1 min-w-0"
          onClick={() => onSelectFolder(folder.id)}
        >
          {isExpanded ? (
            <FolderOpen className={cn('size-4 flex-shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
          ) : (
            <FolderIcon className={cn('size-4 flex-shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
          )}

          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setNewName(folder.name);
                  setIsRenaming(false);
                }
              }}
              className="flex-1 min-w-0 bg-transparent border-b border-primary outline-none text-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm truncate">{folder.name}</span>
          )}

          {folder.documentCount > 0 && (
            <span className="text-xs text-muted-foreground">({folder.documentCount})</span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCreateSubfolder(folder.id, folder.name)}>
              <Plus className="mr-2 size-4" />
              サブフォルダを作成
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
              <Pencil className="mr-2 size-4" />
              名前を変更
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              expandedFolders={expandedFolders}
              onToggleExpand={onToggleExpand}
              onSelectFolder={onSelectFolder}
              onCreateSubfolder={onCreateSubfolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [parentForCreate, setParentForCreate] = useState<{ id: string | null; name?: string }>({
    id: null,
  });

  const handleToggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleCreateSubfolder = (parentId: string, parentName: string) => {
    setParentForCreate({ id: parentId, name: parentName });
    setCreateDialogOpen(true);
  };

  const handleCreateRootFolder = () => {
    setParentForCreate({ id: null });
    setCreateDialogOpen(true);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          フォルダ
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={handleCreateRootFolder}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <Button
        variant={selectedFolderId === null ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start',
          selectedFolderId === null && 'bg-primary/20'
        )}
        onClick={() => onSelectFolder(null)}
      >
        <FolderIcon className="mr-2 size-4" />
        全ての文書
      </Button>

      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          level={0}
          selectedFolderId={selectedFolderId}
          expandedFolders={expandedFolders}
          onToggleExpand={handleToggleExpand}
          onSelectFolder={onSelectFolder}
          onCreateSubfolder={handleCreateSubfolder}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
        />
      ))}

      <CreateFolderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateFolder={onCreateFolder}
        parentFolderId={parentForCreate.id}
        parentFolderName={parentForCreate.name}
      />
    </div>
  );
}
