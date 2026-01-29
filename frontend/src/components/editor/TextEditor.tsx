'use client';

import React, { useCallback, useState, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Link, Image, Code, Brain, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TextEditorProps {
  content: string;
  setContent: (value: string) => void;
  isMobile: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, label, icon }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        aria-label={label}
        className="size-8"
      >
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);

const TextEditor: React.FC<TextEditorProps> = ({ content, setContent, isMobile }) => {
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(!isMobile);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const newText = getMarkdownText(markdownSyntax, selectedText);
    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);

    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      textarea.focus();
      if (markdownSyntax === 'link') {
        const urlStart = start + newText.indexOf('](') + 2;
        textarea.setSelectionRange(urlStart, urlStart + 3);
      } else {
        const newCursorPos = start + newText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  }, [content, setContent]);

  const callAi = useCallback(async () => {
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: content }),
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
    { icon: <Bold className="size-4" />, label: "太字", action: () => insertMarkdown('bold') },
    { icon: <Italic className="size-4" />, label: "斜体", action: () => insertMarkdown('italic') },
    { icon: <List className="size-4" />, label: "箇条書きリスト", action: () => insertMarkdown('ul') },
    { icon: <ListOrdered className="size-4" />, label: "番号付きリスト", action: () => insertMarkdown('ol') },
    { icon: <Link className="size-4" />, label: "リンク", action: () => insertMarkdown('link') },
    { icon: <Image className="size-4" />, label: "画像", action: () => insertMarkdown('image') },
    { icon: <Code className="size-4" />, label: "コードブロック", action: () => insertMarkdown('code') },
    { icon: <Brain className="size-4" />, label: "AI補助", action: callAi }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* ツールバー */}
      <div className="bg-secondary border-b">
        {isMobile && (
          <Button
            variant="ghost"
            onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
            className="w-full justify-between"
          >
            書式設定
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                isToolbarExpanded && "rotate-180"
              )}
            />
          </Button>
        )}

        <div className={cn(
          "p-2 flex flex-wrap gap-1",
          !isToolbarExpanded && isMobile && "hidden"
        )}>
          {toolbarButtons.map((button, index) => (
            <React.Fragment key={button.label}>
              <ToolbarButton
                onClick={button.action}
                label={button.label}
                icon={button.icon}
              />
              {index === toolbarButtons.length - 2 && (
                <div className="w-px h-6 bg-border mx-2 self-center" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* エディタ */}
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 resize-none rounded-none border-0 font-mono focus-visible:ring-0"
        placeholder="Markdown形式で記述できます..."
      />
    </div>
  );
};

export default TextEditor;
