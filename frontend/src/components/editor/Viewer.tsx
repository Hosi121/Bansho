'use client';

import React, { memo, useMemo } from "react";
import ReactMarkdown from 'react-markdown';

interface ViewerProps {
  content: string;
}

const Viewer: React.FC<ViewerProps> = memo(({ content }) => {
  // Memoize the rendered markdown to prevent unnecessary re-parsing
  const renderedContent = useMemo(() => (
    <ReactMarkdown>{content}</ReactMarkdown>
  ), [content]);

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
