'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/common/layout/AppLayout';
import SearchResults from '@/components/search/SearchResults';
import { useSearch } from '@/libs/hooks/useSearch';
import { Card } from '@/components/ui/card';

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
      <div className="min-h-[calc(100dvh-3rem)] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 text-balance">検索結果</h1>
            <p className="text-muted-foreground text-pretty">
              &quot;{searchQuery}&quot; の検索結果 {searchResults.length}件
            </p>
          </div>

          <Card>
            <SearchResults
              searchQuery={searchQuery}
              results={searchResults}
              onResultClick={handleResultClick}
              isSearching={isSearching}
            />
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
