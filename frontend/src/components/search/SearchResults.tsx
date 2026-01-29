'use client';

import { File, FileText, Tag, Tags } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Document } from '@/types/document';

interface SearchResultsProps {
  searchQuery: string;
  results: Document[];
  onResultClick: (doc: Document) => void;
  isSearching: boolean;
}

// Highlight text with match
function HighlightedText({
  text,
  matchStart,
  matchEnd,
}: {
  text: string;
  matchStart?: number;
  matchEnd?: number;
}) {
  if (matchStart === undefined || matchEnd === undefined) {
    return <span>{text}</span>;
  }

  const before = text.substring(0, matchStart);
  const match = text.substring(matchStart, matchEnd);
  const after = text.substring(matchEnd);

  return (
    <span>
      {before}
      <mark className="bg-yellow-200 dark:bg-yellow-800 text-inherit px-0.5 rounded">{match}</mark>
      {after}
    </span>
  );
}

// Highlight search query in title
function HighlightedTitle({
  title,
  query,
  matchType,
}: {
  title: string;
  query: string;
  matchType?: 'title' | 'content' | 'tag';
}) {
  if (matchType !== 'title') {
    return <span>{title}</span>;
  }

  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerTitle.indexOf(lowerQuery);

  if (index === -1) {
    return <span>{title}</span>;
  }

  const before = title.substring(0, index);
  const match = title.substring(index, index + query.length);
  const after = title.substring(index + query.length);

  return (
    <span>
      {before}
      <mark className="bg-yellow-200 dark:bg-yellow-800 text-inherit px-0.5 rounded">{match}</mark>
      {after}
    </span>
  );
}

// Get match type label
function MatchTypeBadge({ matchType }: { matchType?: 'title' | 'content' | 'tag' }) {
  if (!matchType) return null;

  const config = {
    title: { label: 'タイトル', icon: File },
    content: { label: '本文', icon: FileText },
    tag: { label: 'タグ', icon: Tags },
  };

  const { label, icon: Icon } = config[matchType];

  return (
    <Badge variant="outline" className="text-xs gap-1">
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}

export default function SearchResults({
  searchQuery,
  results,
  onResultClick,
  isSearching,
}: SearchResultsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = Array.from(new Set(results.flatMap((doc) => doc.tags)));
  const filteredResults =
    selectedTags.length > 0
      ? results.filter((doc) => selectedTags.every((tag) => doc.tags.includes(tag)))
      : results;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (isSearching) {
    return (
      <div className="space-y-4 p-4">
        {['skeleton-1', 'skeleton-2', 'skeleton-3'].map((key) => (
          <div key={key} className="flex gap-3">
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
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
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
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate text-balance">
                    <HighlightedTitle
                      title={doc.title}
                      query={searchQuery}
                      matchType={doc.matchType}
                    />
                  </h3>
                  <MatchTypeBadge matchType={doc.matchType} />
                </div>
                {doc.excerpt && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 text-pretty">
                    {doc.matchType === 'content' ? (
                      <HighlightedText
                        text={doc.excerpt}
                        matchStart={doc.matchStart}
                        matchEnd={doc.matchEnd}
                      />
                    ) : (
                      doc.excerpt
                    )}
                  </p>
                )}
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags.map((tag) => (
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
