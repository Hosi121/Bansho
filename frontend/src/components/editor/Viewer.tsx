import React from "react";

interface ViewerProps {
  content: string;
}

const Viewer: React.FC<ViewerProps> = ({ content }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-[#1A1B23] border-l border-white/10">
      <pre className="whitespace-pre-wrap text-white font-sans">{content}</pre>
    </div>
  );
};

export default Viewer;