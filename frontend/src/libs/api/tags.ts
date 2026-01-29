export interface TagWithCount {
  id: string;
  name: string;
  documentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagWithDocuments extends TagWithCount {
  documents: Array<{
    id: string;
    title: string;
    updatedAt: Date;
  }>;
}

export async function getTags(): Promise<TagWithCount[]> {
  const response = await fetch('/api/tags');
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch tags');
  }
  return response.json();
}

export async function getTag(id: string): Promise<TagWithDocuments> {
  const response = await fetch(`/api/tags/${id}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch tag');
  }
  return response.json();
}

export async function updateTag(id: string, name: string): Promise<TagWithCount> {
  const response = await fetch(`/api/tags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to update tag');
  }
  return response.json();
}

export async function deleteTag(id: string): Promise<void> {
  const response = await fetch(`/api/tags/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete tag');
  }
}
