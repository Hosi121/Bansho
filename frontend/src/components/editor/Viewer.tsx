import React from "react";
import ReactMarkdown from 'react-markdown';

interface ViewerProps {
  content: string;
}

const Viewer: React.FC<ViewerProps> = ({ content }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-[#1A1B23] border-l border-white/10">
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Viewer;