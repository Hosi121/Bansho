export interface DocumentEdgeData {
  id: number;
  from_document_id: number;
  to_document_id: number;
  weight: number;
}

export interface Backlink {
  id: string;
  title: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isPinned: boolean;
  folderId?: string | null;
  excerpt?: string;
  matchType?: 'title' | 'content' | 'tag';
  matchStart?: number;
  matchEnd?: number;
  edges_from?: DocumentEdgeData[];
  edges_to?: DocumentEdgeData[];
  backlinks?: Backlink[];
  sharedPermission?: 'view' | 'edit';
}

export interface DocumentNode {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  title: string;
  documentInfo: Document;
}

export interface DocumentEdge {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number; // 関連度を表す値（0-1）
}

export interface DocumentGraphData {
  nodes: DocumentNode[];
  edges: DocumentEdge[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  children?: Folder[];
  createdAt: Date;
  updatedAt: Date;
}
