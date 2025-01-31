import React, { useCallback } from "react";
import { Bold, Italic, List, ListOrdered, Link, Image, Code } from 'lucide-react';

interface TextEditorProps {
  content: string;
  setContent: (value: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ content, setContent }) => {
  const insertMarkdown = useCallback((markdownSyntax: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    switch (markdownSyntax) {
      case 'bold':
        newText = `**${selectedText || 'テキスト'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'テキスト'}*`;
        break;
      case 'ul':
        newText = `\n- ${selectedText || 'リストアイテム'}`;
        break;
      case 'ol':
        newText = `\n1. ${selectedText || 'リストアイテム'}`;
        break;
      case 'link':
        newText = `[${selectedText || 'リンクテキスト'}](URL)`;
        break;
      case 'image':
        newText = `![${selectedText || '画像の説明'}](画像URL)`;
        break;
      case 'code':
        newText = selectedText.includes('\n') 
          ? `\n\`\`\`\n${selectedText || 'コード'}\n\`\`\`\n`
          : `\`${selectedText || 'コード'}\``;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);

    // カーソル位置の調整
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, setContent]);

  return (
    <div className="flex flex-col h-full">
      {/* マークダウンツールバー */}
      <div className="flex items-center p-2 border-b border-white/10 gap-2 bg-[#2A2B32]">
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