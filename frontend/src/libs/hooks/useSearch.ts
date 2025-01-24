import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Document } from '@/types/document';
import { searchDocuments } from '@/libs/api/search';
import { MOCK_DOCUMENTS } from './useDocuments';

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await searchDocuments({ query: searchQuery });
      setSearchResults(response.items);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } catch (error) {
      console.error('Search failed:', error);
      const mockResults = MOCK_DOCUMENTS.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(mockResults);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, router]);

  const handleResultClick = useCallback((doc: Document) => {
    router.push(`/editor/${doc.id}`);
  }, [router]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    handleSearch,
    handleResultClick
  };
};