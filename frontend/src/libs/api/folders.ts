import { Folder } from '@/types/document';

export interface FolderWithCount extends Folder {
  documentCount: number;
}

export interface CreateFolderInput {
  name: string;
  parentId?: string | null;
}

export interface UpdateFolderInput {
  name?: string;
  parentId?: string | null;
}

export async function getFolders(): Promise<FolderWithCount[]> {
  const response = await fetch('/api/folders');
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch folders');
  }
  return response.json();
}

export async function getFolder(id: string): Promise<Folder & { documents: Array<{ id: string; title: string; updatedAt: Date }> }> {
  const response = await fetch(`/api/folders/${id}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch folder');
  }
  return response.json();
}

export async function createFolder(input: CreateFolderInput): Promise<Folder> {
  const response = await fetch('/api/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: input.name,
      parentId: input.parentId ? parseInt(input.parentId, 10) : null,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to create folder');
  }
  return response.json();
}

export async function updateFolder(id: string, input: UpdateFolderInput): Promise<Folder> {
  const response = await fetch(`/api/folders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(input.name && { name: input.name }),
      ...(input.parentId !== undefined && {
        parentId: input.parentId ? parseInt(input.parentId, 10) : null,
      }),
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to update folder');
  }
  return response.json();
}

export async function deleteFolder(id: string): Promise<void> {
  const response = await fetch(`/api/folders/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete folder');
  }
}

export async function moveDocument(documentId: string, folderId: string | null): Promise<void> {
  const response = await fetch(`/api/documents/${documentId}/move`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      folderId: folderId ? parseInt(folderId, 10) : null,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to move document');
  }
}
