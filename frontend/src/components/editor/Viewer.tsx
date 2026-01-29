'use client';

import 'katex/dist/katex.min.css';

import type React from 'react';
import { memo, useMemo } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import MermaidDiagram from '@/components/editor/MermaidDiagram';
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

  // Custom components for markdown rendering
  const components: Components = useMemo(
    () => ({
      // Custom code block renderer for mermaid diagrams
      code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        const language = match?.[1];

        // Handle mermaid diagrams
        if (language === 'mermaid') {
          const chart = String(children).replace(/\n$/, '');
          return <MermaidDiagram chart={chart} />;
        }

        // Regular code block
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }),
    []
  );

  // Memoize the rendered markdown to prevent unnecessary re-parsing
  const renderedContent = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {transformedContent}
      </ReactMarkdown>
    ),
    [transformedContent, components]
  );

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-background border-l">
      <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-code:text-foreground prose-pre:bg-muted">
        {renderedContent}
      </div>
    </div>
  );
});

Viewer.displayName = 'Viewer';

export default Viewer;
