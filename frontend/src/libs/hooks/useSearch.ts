import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Document } from '@/types/document';
import { searchDocuments } from '@/libs/api/search';

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    try {
      const response = await searchDocuments({ query: searchQuery });
      setSearchResults(response.items);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err instanceof Error ? err.message : '検索に失敗しました');
      setSearchResults([]);
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
    error,
    handleSearch,
    handleResultClick
  };
};
