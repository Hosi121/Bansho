import { Document } from './document';

export interface SearchParams {
  query: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  items: Document[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}