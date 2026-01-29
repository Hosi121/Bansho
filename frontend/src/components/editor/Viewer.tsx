'use client';

import React from "react";
import ReactMarkdown from 'react-markdown';

interface ViewerProps {
  content: string;
}

const Viewer: React.FC<ViewerProps> = ({ content }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-background border-l">
      <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Viewer;
