import { DocumentGraphData } from './document';

export interface KnowledgeGraphProps {
  data: DocumentGraphData;
  onNodeClick: (id: string) => void;
  selectedNodeId: string | null;
}