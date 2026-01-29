'use client';

import { useState, useEffect, useCallback } from 'react';
import { Folder } from '@/types/document';
import {
  getFolders,
  createFolder as createFolderApi,
  updateFolder as updateFolderApi,
  deleteFolder as deleteFolderApi,
  moveDocument as moveDocumentApi,
  FolderWithCount,
  CreateFolderInput,
  UpdateFolderInput,
} from '@/libs/api/folders';

export interface FolderTreeNode extends FolderWithCount {
  children: FolderTreeNode[];
}

function buildFolderTree(folders: FolderWithCount[]): FolderTreeNode[] {
  const folderMap = new Map<string, FolderTreeNode>();
  const rootFolders: FolderTreeNode[] = [];

  // First pass: create nodes with empty children
  folders.forEach((folder) => {
    folderMap.set(folder.id, { ...folder, children: [] });
  });

  // Second pass: build tree structure
  folders.forEach((folder) => {
    const node = folderMap.get(folder.id)!;
    if (folder.parentId) {
      const parent = folderMap.get(folder.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        rootFolders.push(node);
      }
    } else {
      rootFolders.push(node);
    }
  });

  // Sort children by name
  const sortChildren = (nodes: FolderTreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    nodes.forEach((node) => sortChildren(node.children));
  };
  sortChildren(rootFolders);

  return rootFolders;
}

export function useFolders() {
  const [folders, setFolders] = useState<FolderWithCount[]>([]);
  const [folderTree, setFolderTree] = useState<FolderTreeNode[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFolders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getFolders();
      setFolders(data);
      setFolderTree(buildFolderTree(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch folders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = useCallback(async (input: CreateFolderInput): Promise<Folder> => {
    const folder = await createFolderApi(input);
    await fetchFolders();
    return folder;
  }, [fetchFolders]);

  const updateFolder = useCallback(async (id: string, input: UpdateFolderInput): Promise<Folder> => {
    const folder = await updateFolderApi(id, input);
    await fetchFolders();
    return folder;
  }, [fetchFolders]);

  const deleteFolder = useCallback(async (id: string): Promise<void> => {
    await deleteFolderApi(id);
    if (selectedFolderId === id) {
      setSelectedFolderId(null);
    }
    await fetchFolders();
  }, [fetchFolders, selectedFolderId]);

  const moveDocument = useCallback(async (documentId: string, folderId: string | null): Promise<void> => {
    await moveDocumentApi(documentId, folderId);
    await fetchFolders();
  }, [fetchFolders]);

  const selectFolder = useCallback((folderId: string | null) => {
    setSelectedFolderId(folderId);
  }, []);

  return {
    folders,
    folderTree,
    selectedFolderId,
    isLoading,
    error,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    moveDocument,
    selectFolder,
  };
}
