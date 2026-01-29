"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Eye, Edit2, Save, PanelRightOpen, ChevronDown } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Toolbar from "@/components/editor/Toolbar";
import TextEditor from "@/components/editor/TextEditor";
import Viewer from "@/components/editor/Viewer";
import { Document } from "@/types/document";
import AppLayout from "@/components/common/layout/AppLayout";
import * as documentAPI from '@/libs/api/document';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/libs/hooks/useDebounce';

type ViewMode = 'split' | 'edit' | 'preview';

const EditorPage: React.FC = () => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

  const [document, setDocument] = useState<Document>({
    id: "",
    title: "",
    tags: [],
    content: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isSaving, setIsSaving] = useState(false);

  // Debounce content for preview rendering (300ms delay)
  const debouncedContent = useDebounce(document.content, 300);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setViewMode('edit');
    }
  }, [isMobile]);

  // Separate setters for each field to avoid closure issues and improve performance
  const setTitle = useCallback((value: string) => {
    setDocument((prev) => ({ ...prev, title: value }));
  }, []);

  const setTags = useCallback((value: string[]) => {
    setDocument((prev) => ({ ...prev, tags: value }));
  }, []);

  const setContent = useCallback((value: string) => {
    setDocument((prev) => ({ ...prev, content: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!document.title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }

    setIsSaving(true);
    try {
      const documentData = {
        title: document.title,
        content: document.content,
        tags: document.tags,
      };

      let savedDoc: Document;
      if (document.id) {
        savedDoc = await documentAPI.updateDocument(document.id, documentData);
      } else {
        savedDoc = await documentAPI.createDocument(documentData);
      }

      setDocument(savedDoc);
      toast.success('保存しました');
      router.refresh();
    } catch (error) {
      console.error('Failed to save:', error);
      const errorMessage = error instanceof Error ? error.message : '保存に失敗しました';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [document, router]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (!isSaving) {
        handleSave();
      }
    }
  }, [isSaving, handleSave]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100dvh-3rem)]">
        {/* ヘッダー部分 */}
        <div className="flex flex-col border-b">
          {/* タイトル入力と保存ボタン */}
          <div className="p-4 bg-card flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-4">
              <Input
                type="text"
                placeholder="タイトルを入力"
                value={document.title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1"
              />

              <div className="flex rounded-md bg-secondary p-0.5">
                <Button
                  variant={viewMode === 'edit' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('edit')}
                  aria-label="エディタのみ"
                  className="size-8"
                >
                  <Edit2 className="size-4" />
                </Button>
                {!isMobile && (
                  <Button
                    variant={viewMode === 'split' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('split')}
                    aria-label="分割表示"
                    className="size-8"
                  >
                    <PanelRightOpen className="size-4" />
                  </Button>
                )}
                <Button
                  variant={viewMode === 'preview' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('preview')}
                  aria-label="プレビューのみ"
                  className="size-8"
                >
                  <Eye className="size-4" />
                </Button>
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                <Save className={cn("mr-2 size-4", isSaving && "animate-spin")} />
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>

          {/* タグと書式設定 */}
          <div className="bg-card border-t">
            {isMobile && (
              <Button
                variant="ghost"
                onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                className="w-full justify-between"
              >
                タグと書式
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    isHeaderExpanded && "rotate-180"
                  )}
                />
              </Button>
            )}
            <div className={cn(
              "px-4 py-2",
              !isHeaderExpanded && isMobile && "hidden"
            )}>
              <Toolbar
                title={document.title}
                setTitle={setTitle}
                tags={document.tags}
                setTags={setTags}
                onSave={handleSave}
                isSaving={isSaving}
              />
            </div>
          </div>
        </div>

        {/* エディタ/プレビュー部分 */}
        <div className="flex-1 flex">
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={cn(viewMode === 'split' ? 'w-1/2' : 'w-full')}>
              <TextEditor
                content={document.content}
                setContent={setContent}
                isMobile={isMobile}
              />
            </div>
          )}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={cn(viewMode === 'split' ? 'w-1/2' : 'w-full')}>
              <Viewer content={debouncedContent} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default EditorPage;
