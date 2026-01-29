'use client';

import React, { useCallback, useState, useRef, DragEvent } from "react";
import { Bold, Italic, List, ListOrdered, Link, Image, Code, Brain, ChevronDown, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { validateImageFile } from '@/lib/storage';

interface TextEditorProps {
  content: string;
  setContent: (value: string) => void;
  isMobile: boolean;
  documentId?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, label, icon, disabled }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        aria-label={label}
        className="size-8"
        disabled={disabled}
      >
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);

const TextEditor: React.FC<TextEditorProps> = ({ content, setContent, isMobile, documentId }) => {
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(!isMobile);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const uploadImage = useCallback(async (file: File) => {
    if (!documentId) {
      toast.error('画像をアップロードするには、まずドキュメントを保存してください');
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/documents/${documentId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'アップロードに失敗しました');
      }

      const data = await response.json();

      // Insert markdown at cursor position
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const imageMarkdown = `![${file.name}](${data.url})`;
        const newContent = content.substring(0, start) + imageMarkdown + content.substring(start);
        setContent(newContent);

        requestAnimationFrame(() => {
          textarea.focus();
          const newCursorPos = start + imageMarkdown.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        });
      }

      toast.success('画像をアップロードしました');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  }, [documentId, content, setContent]);

  const handleImageButtonClick = useCallback(() => {
    if (documentId) {
      fileInputRef.current?.click();
    } else {
      insertMarkdown('image');
    }
  }, [documentId, insertMarkdown]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadImage]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (documentId) {
      setIsDragOver(true);
    }
  }, [documentId]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!documentId) {
      toast.error('画像をアップロードするには、まずドキュメントを保存してください');
      return;
    }

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
    }
  }, [documentId, uploadImage]);

  const toolbarButtons = [
    { icon: <Bold className="size-4" />, label: "太字", action: () => insertMarkdown('bold') },
    { icon: <Italic className="size-4" />, label: "斜体", action: () => insertMarkdown('italic') },
    { icon: <List className="size-4" />, label: "箇条書きリスト", action: () => insertMarkdown('ul') },
    { icon: <ListOrdered className="size-4" />, label: "番号付きリスト", action: () => insertMarkdown('ol') },
    { icon: <Link className="size-4" />, label: "リンク", action: () => insertMarkdown('link') },
    { icon: isUploading ? <Loader2 className="size-4 animate-spin" /> : <Image className="size-4" />, label: documentId ? "画像をアップロード" : "画像", action: handleImageButtonClick, disabled: isUploading },
    { icon: <Code className="size-4" />, label: "コードブロック", action: () => insertMarkdown('code') },
    { icon: <Brain className="size-4" />, label: "AI補助", action: callAi }
  ];

  return (
    <div
      className={cn("flex flex-col h-full relative", isDragOver && "ring-2 ring-primary ring-inset")}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 pointer-events-none">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Upload className="size-6" />
            画像をドロップしてアップロード
          </div>
        </div>
      )}

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
                disabled={'disabled' in button ? button.disabled : false}
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
