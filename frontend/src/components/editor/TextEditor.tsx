import React, { useCallback } from "react";
import { Bold, Italic, List, ListOrdered, Link, Image, Code, Brain } from 'lucide-react';

interface TextEditorProps {
  content: string;
  setContent: (value: string) => void;
}

const getMarkdownText = (markdownSyntax: string, selectedText: string): string => {
  switch (markdownSyntax) {
    case 'bold':
      return `**${selectedText || 'テキスト'}**`;
    case 'italic':
      return `*${selectedText || 'テキスト'}*`;
    case 'ul':
      return `\n- ${selectedText || 'リストアイテム'}`;
    case 'ol':
      return `\n1. ${selectedText || 'リストアイテム'}`;
    case 'link':
      return `[${selectedText || 'リンクテキスト'}](URL)`;
    case 'image':
      return `![${selectedText || '画像の説明'}](画像URL)`;
    case 'code':
      return selectedText.includes('\n')
        ? `\n\`\`\`\n${selectedText || 'コード'}\n\`\`\`\n`
        : `\`${selectedText || 'コード'}\``;
    default:
      return '';
  }
};

const TextEditor: React.FC<TextEditorProps> = ({ content, setContent }) => {
  const insertMarkdown = useCallback((markdownSyntax: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = getMarkdownText(markdownSyntax, selectedText);
    if (!newText) return;
    
    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, setContent]);

  const callAi = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: content }),
      });
      if (!response.ok) {
        throw new Error('AI リクエストに失敗しました');
      }
      const data = await response.json();
      setContent(content + "\n" + data.answer);
    } catch (error) {
      console.error("AI 呼び出しエラー:", error);
    }
  }, [content, setContent]);

  return (
    <div className="flex flex-col h-full">
      {/* ツールバー */}
      <div className="flex items-center p-2 border-b border-white/10 gap-2 bg-[#2A2B32]">
        {/* マークダウンボタン群 */}
        <button
          onClick={() => insertMarkdown('bold')}
          className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="太字"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => insertMarkdown('italic')}
          className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="斜体"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => insertMarkdown('ul')}
          className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="箇条書きリスト"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => insertMarkdown('ol')}
          className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="番号付きリスト"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => insertMarkdown('link')}
          className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="リンク"
        >
          <Link size={16} />
        </button>
        <button
          onClick={() => insertMarkdown('image')}
          className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="画像"
        >
          <Image size={16} />
        </button>
        <button
          onClick={() => insertMarkdown('code')}
          className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="コード"
        >
          <Code size={16} />
        </button>

        {/* 仕切り（ディバイダー） */}
        <div className="w-px h-6 bg-white/10 mx-2" />

        {/* AI ボタン */}
        <button
          onClick={callAi}
          className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="AI"
        >
          <Brain size={16} />
        </button>
      </div>

      {/* エディタ部分 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 p-4 bg-[#232429] text-white placeholder-gray-400 
          border-r border-white/10 resize-none focus:outline-none font-mono"
        placeholder="Markdown形式で記述できます..."
      />
    </div>
  );
};

export default TextEditor;