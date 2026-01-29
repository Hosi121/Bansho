'use client';

import { useState } from 'react';
import { File, Tag } from 'lucide-react';
import { Document } from '@/types/document';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResultsProps {
  searchQuery: string;
  results: Document[];
  onResultClick: (doc: Document) => void;
  isSearching: boolean;
}

export default function SearchResults({
  results,
  onResultClick,
  isSearching
}: SearchResultsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = Array.from(new Set(results.flatMap(doc => doc.tags)));
  const filteredResults = selectedTags.length > 0
    ? results.filter(doc => selectedTags.every(tag => doc.tags.includes(tag)))
    : results;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (isSearching) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredResults.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-pretty">検索結果が見つかりませんでした</p>
        <Button variant="link" className="mt-2" onClick={() => setSelectedTags([])}>
          フィルターをクリア
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full">
      {allTags.length > 0 && (
        <div className="p-4 border-b">
          <div className="text-sm text-muted-foreground mb-2">タグでフィルター：</div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                <Tag className="mr-1 size-3" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="divide-y">
        {filteredResults.map((doc) => (
          <Button
            key={doc.id}
            variant="ghost"
            onClick={() => onResultClick(doc)}
            className="w-full h-auto p-4 justify-start rounded-none"
          >
            <div className="flex items-start gap-3 w-full">
              <File className="size-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-medium truncate text-balance">{doc.title}</h3>
                {doc.excerpt && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 text-pretty">
                    {doc.excerpt}
                  </p>
                )}
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  最終更新: {new Date(doc.updatedAt).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
