import React from "react";

interface TextEditorProps {
  content: string;
  setContent: (value: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ content, setContent }) => {
  return (
    <textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      className="flex-1 p-4 bg-[#232429] text-white placeholder-gray-400 
        border-r border-white/10 resize-none focus:outline-none"
      placeholder="ここにテキストを入力"
    />
  );
};

export default TextEditor;