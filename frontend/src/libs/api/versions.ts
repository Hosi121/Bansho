export interface VersionUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

export interface DocumentVersion {
  id: string;
  version: number;
  title: string;
  createdAt: Date;
  user: VersionUser;
}

export interface DocumentVersionDetail extends DocumentVersion {
  content: string;
}

export async function getVersions(documentId: string): Promise<DocumentVersion[]> {
  const response = await fetch(`/api/documents/${documentId}/versions`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch versions');
  }
  return response.json();
}

export async function getVersion(documentId: string, versionId: string): Promise<DocumentVersionDetail> {
  const response = await fetch(`/api/documents/${documentId}/versions/${versionId}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch version');
  }
  return response.json();
}

export async function createVersion(documentId: string): Promise<DocumentVersion> {
  const response = await fetch(`/api/documents/${documentId}/versions`, {
    method: 'POST',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to create version');
  }
  return response.json();
}

export async function restoreVersion(documentId: string, versionId: string): Promise<{ id: string; title: string; content: string }> {
  const response = await fetch(`/api/documents/${documentId}/versions/${versionId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to restore version');
  }
  return response.json();
}
