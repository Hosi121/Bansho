import { useState } from 'react';
import { File, Tag } from 'lucide-react';
import { Document } from '@/types/document';

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7B8CDE]" />
      </div>
    );
  }

  if (filteredResults.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        検索結果が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="h-full">
      {allTags.length > 0 && (
        <div className="p-4 border-b border-white/10">
          <div className="text-sm text-gray-400 mb-2">タグでフィルター：</div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                  transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-[#7B8CDE] text-white'
                      : 'bg-[#232429] text-gray-300 hover:bg-[#2A2B32]'
                  }`}
              >
                <Tag size={14} />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="divide-y divide-white/10">
        {filteredResults.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onResultClick(doc)}
            className="w-full p-4 text-left hover:bg-[#232429] transition-colors"
          >
            <div className="flex items-start gap-3">
              <File className="w-5 h-5 mt-1 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{doc.title}</h3>
                {doc.excerpt && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {doc.excerpt}
                  </p>
                )}
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doc.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-[#232429] text-xs text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  最終更新: {new Date(doc.updatedAt).toLocaleDateString('ja-JP')}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}