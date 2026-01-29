'use client';

import type React from 'react';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { transformWikiLinksToMarkdown } from '@/lib/wikilinks';

interface ViewerProps {
  content: string;
  titleToId?: Map<string, string>;
}

const Viewer: React.FC<ViewerProps> = memo(({ content, titleToId }) => {
  // Transform wiki links to markdown links if titleToId is provided
  const transformedContent = useMemo(() => {
    if (!titleToId || titleToId.size === 0) {
      return content;
    }
    return transformWikiLinksToMarkdown(content, titleToId);
  }, [content, titleToId]);

  // Memoize the rendered markdown to prevent unnecessary re-parsing
  const renderedContent = useMemo(
    () => <ReactMarkdown>{transformedContent}</ReactMarkdown>,
    [transformedContent]
  );

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-background border-l">
      <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary">
        {renderedContent}
      </div>
    </div>
  );
});

Viewer.displayName = 'Viewer';

export default Viewer;
