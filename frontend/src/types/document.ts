export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  excerpt?: string;
  matchType?: 'title' | 'content' | 'tag';
  matchStart?: number;
  matchEnd?: number;
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
  color: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  children?: Folder[];
  createdAt: Date;
  updatedAt: Date;
}
