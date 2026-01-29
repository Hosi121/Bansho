'use client';

import {
  Bold,
  Brain,
  ChevronDown,
  Code,
  FileText,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Loader2,
  Upload,
} from 'lucide-react';
import React, { type DragEvent, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { validateImageFile } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { getWikiLinkInputState, insertWikiLink } from '@/lib/wikilinks';

interface TitleSuggestion {
  id: string;
  title: string;
}

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
  const [wikiLinkState, setWikiLinkState] = useState<{
    isActive: boolean;
    query: string;
    startPosition: number;
  }>({ isActive: false, query: '', startPosition: -1 });
  const [suggestions, setSuggestions] = useState<TitleSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const suggestionListRef = useRef<HTMLDivElement>(null);

  const getMarkdownText = useCallback((markdownSyntax: string, selectedText: string): string => {
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
  }, []);

  const insertMarkdown = useCallback(
    (markdownSyntax: string) => {
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
    },
    [content, setContent, getMarkdownText]
  );

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
      setContent(`${content}\n${data.answer}`);
    } catch (error) {
      console.error('AI 呼び出しエラー:', error);
    }
  }, [content, setContent]);

  // Fetch title suggestions for wiki link autocomplete
  const fetchSuggestions = useCallback(async (query: string) => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/documents/search/titles?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setSelectedSuggestionIndex(0);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Debounced fetch for suggestions
  useEffect(() => {
    if (!wikiLinkState.isActive) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchSuggestions(wikiLinkState.query);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [wikiLinkState.isActive, wikiLinkState.query, fetchSuggestions]);

  // Handle wiki link selection
  const selectWikiLink = useCallback(
    (title: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorPosition = textarea.selectionStart;
      const result = insertWikiLink(content, cursorPosition, title);
      setContent(result.content);

      // Reset wiki link state
      setWikiLinkState({ isActive: false, query: '', startPosition: -1 });
      setSuggestions([]);

      // Set cursor position after the inserted link
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(result.cursorPosition, result.cursorPosition);
      });
    },
    [content, setContent]
  );

  // Handle textarea input change for wiki link detection
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      const cursorPosition = e.target.selectionStart;
      setContent(newContent);

      // Check for wiki link input
      const state = getWikiLinkInputState(newContent, cursorPosition);
      setWikiLinkState(state);
    },
    [setContent]
  );

  // Handle keyboard navigation in suggestions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!wikiLinkState.isActive || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          selectWikiLink(suggestions[selectedSuggestionIndex].title);
          break;
        case 'Escape':
          e.preventDefault();
          setWikiLinkState({ isActive: false, query: '', startPosition: -1 });
          setSuggestions([]);
          break;
        case 'Tab':
          if (suggestions.length > 0) {
            e.preventDefault();
            selectWikiLink(suggestions[selectedSuggestionIndex].title);
          }
          break;
      }
    },
    [wikiLinkState.isActive, suggestions, selectedSuggestionIndex, selectWikiLink]
  );

  // Scroll selected suggestion into view
  useEffect(() => {
    if (suggestionListRef.current && suggestions.length > 0) {
      const selectedItem = suggestionListRef.current.children[
        selectedSuggestionIndex
      ] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedSuggestionIndex, suggestions.length]);

  const uploadImage = useCallback(
    async (file: File) => {
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
    },
    [documentId, content, setContent]
  );

  const handleImageButtonClick = useCallback(() => {
    if (documentId) {
      fileInputRef.current?.click();
    } else {
      insertMarkdown('image');
    }
  }, [documentId, insertMarkdown]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadImage(file);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [uploadImage]
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (documentId) {
        setIsDragOver(true);
      }
    },
    [documentId]
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (!documentId) {
        toast.error('画像をアップロードするには、まずドキュメントを保存してください');
        return;
      }

      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith('image/')) {
        uploadImage(file);
      }
    },
    [documentId, uploadImage]
  );

  const toolbarButtons = [
    { icon: <Bold className="size-4" />, label: '太字', action: () => insertMarkdown('bold') },
    { icon: <Italic className="size-4" />, label: '斜体', action: () => insertMarkdown('italic') },
    {
      icon: <List className="size-4" />,
      label: '箇条書きリスト',
      action: () => insertMarkdown('ul'),
    },
    {
      icon: <ListOrdered className="size-4" />,
      label: '番号付きリスト',
      action: () => insertMarkdown('ol'),
    },
    { icon: <Link className="size-4" />, label: 'リンク', action: () => insertMarkdown('link') },
    {
      icon: isUploading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Image className="size-4" />
      ),
      label: documentId ? '画像をアップロード' : '画像',
      action: handleImageButtonClick,
      disabled: isUploading,
    },
    {
      icon: <Code className="size-4" />,
      label: 'コードブロック',
      action: () => insertMarkdown('code'),
    },
    { icon: <Brain className="size-4" />, label: 'AI補助', action: callAi },
  ];

  return (
    <section
      className={cn(
        'flex flex-col h-full relative',
        isDragOver && 'ring-2 ring-primary ring-inset'
      )}
      aria-label="テキストエディタ"
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
              className={cn('size-4 transition-transform', isToolbarExpanded && 'rotate-180')}
            />
          </Button>
        )}

        <div className={cn('p-2 flex flex-wrap gap-1', !isToolbarExpanded && isMobile && 'hidden')}>
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
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          className="h-full resize-none rounded-none border-0 font-mono focus-visible:ring-0"
          placeholder="Markdown形式で記述できます..."
        />

        {/* Wiki link autocomplete dropdown */}
        {wikiLinkState.isActive && (suggestions.length > 0 || isLoadingSuggestions) && (
          <div
            className="absolute left-4 right-4 z-50 mt-1 max-h-48 overflow-auto rounded-md border bg-popover shadow-lg"
            style={{ top: '2rem' }}
          >
            {isLoadingSuggestions && suggestions.length === 0 ? (
              <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" />
                検索中...
              </div>
            ) : (
              <div ref={suggestionListRef} className="py-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-left',
                      index === selectedSuggestionIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    )}
                    onClick={() => selectWikiLink(suggestion.title)}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  >
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="truncate">{suggestion.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TextEditor;
