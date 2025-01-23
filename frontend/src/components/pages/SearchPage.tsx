'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/common/layout/AppLayout';
import SearchResults from '@/components/search/SearchResults';
import { useSearch } from '@/libs/hooks/useSearch';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleSearch,
    handleResultClick,
  } = useSearch();

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      handleSearch();
    }
  }, [searchParams, setSearchQuery, handleSearch]);

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-3rem)] bg-[#13141f] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">検索結果</h1>
            <p className="text-gray-400">
              &quot;{searchQuery}&quot; の検索結果 {searchResults.length}件
            </p>
          </div>

          <div className="bg-[#1a1b23] rounded-xl border border-white/10">
            <SearchResults
              searchQuery={searchQuery}
              results={searchResults}
              onResultClick={handleResultClick}
              isSearching={isSearching}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}