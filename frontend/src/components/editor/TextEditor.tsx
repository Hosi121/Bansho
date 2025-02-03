import React, { useCallback, useState } from "react";
import { Bold, Italic, List, ListOrdered, Link, Image, Code, Brain, ChevronDown } from 'lucide-react';

interface TextEditorProps {
  content: string;
  setContent: (value: string) => void;
  isMobile: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, title, icon }) => (
  <button
    onClick={onClick}
    className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
    title={title}
  >
    {icon}
  </button>
);

const TextEditor: React.FC<TextEditorProps> = ({ content, setContent, isMobile }) => {
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(!isMobile);

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
        return `\`\`\`\n${selectedText || 'コード'}\n\`\`\``;
      default:
        return selectedText;
    }
  };

  const insertMarkdown = useCallback((markdownSyntax: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = getMarkdownText(markdownSyntax, selectedText);
    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    
    // カーソル位置を調整
    setTimeout(() => {
      textarea.focus();
      if (markdownSyntax === 'link') {
        // リンクの場合、URLの位置にカーソルを移動
        const urlStart = start + newText.indexOf('](') + 2;
        textarea.setSelectionRange(urlStart, urlStart + 3);
      } else {
        const newCursorPos = start + newText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
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

  const toolbarButtons = [
    { icon: <Bold size={16} />, title: "太字", action: () => insertMarkdown('bold') },
    { icon: <Italic size={16} />, title: "斜体", action: () => insertMarkdown('italic') },
    { icon: <List size={16} />, title: "箇条書きリスト", action: () => insertMarkdown('ul') },
    { icon: <ListOrdered size={16} />, title: "番号付きリスト", action: () => insertMarkdown('ol') },
    { icon: <Link size={16} />, title: "リンク", action: () => insertMarkdown('link') },
    { icon: <Image size={16} />, title: "画像", action: () => insertMarkdown('image') },
    { icon: <Code size={16} />, title: "コードブロック", action: () => insertMarkdown('code') },
    { icon: <Brain size={16} />, title: "AI補助", action: callAi }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* ツールバー */}
      <div className="bg-[#2A2B32] border-b border-white/10">
        {isMobile ? (
          <button
            onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
            className="w-full p-2 flex items-center justify-between text-gray-400 hover:text-white"
          >
            書式設定
            <ChevronDown
              size={20}
              className={`transform transition-transform ${
                isToolbarExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        ) : null}
        
        <div className={`${isToolbarExpanded ? 'block' : isMobile ? 'hidden' : 'block'}`}>
          <div className="p-2 flex flex-wrap gap-1">
            {toolbarButtons.map((button, index) => (
              <React.Fragment key={button.title}>
                <ToolbarButton
                  onClick={button.action}
                  title={button.title}
                  icon={button.icon}
                />
                {/* AIボタンの前にセパレータを追加 */}
                {index === toolbarButtons.length - 2 && (
                  <div className="w-px h-6 bg-white/10 mx-2 self-center" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* エディタ */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 w-full p-4 bg-[#232429] text-white placeholder-gray-400 
          resize-none focus:outline-none font-mono
          scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        placeholder="Markdown形式で記述できます..."
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4A5568 transparent'
        }}
      />
    </div>
  );
};

export default TextEditor;