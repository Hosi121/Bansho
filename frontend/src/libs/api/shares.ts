export interface ShareUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

export interface DocumentShareInfo {
  id: string;
  permission: 'view' | 'edit';
  createdAt: Date;
  user: ShareUser;
}

export interface SharedDocument {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  permission: 'view' | 'edit';
  sharedAt: Date;
  owner: ShareUser;
}

export async function getDocumentShares(documentId: string): Promise<DocumentShareInfo[]> {
  const response = await fetch(`/api/documents/${documentId}/share`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch shares');
  }
  return response.json();
}

export async function shareDocument(
  documentId: string,
  email: string,
  permission: 'view' | 'edit' = 'view'
): Promise<DocumentShareInfo> {
  const response = await fetch(`/api/documents/${documentId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, permission }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to share document');
  }
  return response.json();
}

export async function updateSharePermission(
  documentId: string,
  shareId: string,
  permission: 'view' | 'edit'
): Promise<DocumentShareInfo> {
  const response = await fetch(`/api/documents/${documentId}/share?shareId=${shareId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permission }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to update share');
  }
  return response.json();
}

export async function removeShare(documentId: string, shareId: string): Promise<void> {
  const response = await fetch(`/api/documents/${documentId}/share?shareId=${shareId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to remove share');
  }
}

export async function getSharedDocuments(): Promise<SharedDocument[]> {
  const response = await fetch('/api/shared');
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch shared documents');
  }
  return response.json();
}
