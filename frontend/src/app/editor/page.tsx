'use client';

import React, { useState } from "react";
import { Eye, Edit2, Save, PanelRightOpen } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Toolbar from "@/components/editor/Toolbar";
import TextEditor from "@/components/editor/TextEditor";
import Viewer from "@/components/editor/Viewer";
import { Document } from "@/types/document";
import AppLayout from "@/components/common/layout/AppLayout";
import * as documentAPI from '@/libs/api/document';
import { useAuth } from '@/libs/hooks/useAuth';

type UpdateableDocumentField = {
  title: string;
  tags: string[];
  content: string;
};

const EditorPage: React.FC = () => {
  const router = useRouter();
  const { logout } = useAuth();
  
  const [document, setDocument] = useState<Document>({
    id: "",
    title: "",
    tags: [],
    content: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isSaving, setIsSaving] = useState(false);

  const updateDocumentField = <K extends keyof UpdateableDocumentField>(
    field: K,
    value: UpdateableDocumentField[K]
  ) => {
    setDocument((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date(),
    }));
  };

  const handleSave = async () => {
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
        // 更新の場合
        savedDoc = await documentAPI.updateDocument(document.id, documentData, logout);
      } else {
        // 新規作成の場合
        savedDoc = await documentAPI.createDocument(documentData, logout);
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
  };

  // キーボードショートカットの処理
  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (!isSaving) {
        handleSave();
      }
    }
  }, [isSaving]);

  // キーボードショートカットのイベントリスナーを設定
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3rem)] bg-[#1A1B23] text-white">
        <div className="flex flex-col border-b border-white/10">
          <div className="flex items-center justify-between p-4 bg-[#232429]">
            <input
              type="text"
              placeholder="タイトルを入力"
              value={document.title}
              onChange={(e) => updateDocumentField("title", e.target.value)}
              className="flex-1 p-2 mr-4 bg-[#2A2B32] text-white placeholder-gray-400 
                border border-white/10 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#7B8CDE]/50"
            />
            <div className="flex items-center gap-2">
              <div className="flex rounded bg-[#2A2B32] p-0.5">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`p-1.5 rounded ${
                    viewMode === 'edit' 
                      ? 'bg-[#7B8CDE] text-white' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  } transition-colors`}
                  title="エディタのみ"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`p-1.5 rounded ${
                    viewMode === 'split'
                      ? 'bg-[#7B8CDE] text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  } transition-colors`}
                  title="分割表示"
                >
                  <PanelRightOpen size={18} />
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`p-1.5 rounded ${
                    viewMode === 'preview'
                      ? 'bg-[#7B8CDE] text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  } transition-colors`}
                  title="プレビューのみ"
                >
                  <Eye size={18} />
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-[#7B8CDE] text-white rounded-lg
                  hover:bg-[#8E9DE5] active:bg-[#6B7BD0] transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#7B8CDE]/50
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} className={`mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>

          <div className="px-4 py-2 bg-[#232429]">
            <Toolbar
              title={document.title}
              setTitle={(value) => updateDocumentField("title", value)}
              tags={document.tags}
              setTags={(value) => updateDocumentField("tags", value)}
              onSave={handleSave}
              isSaving={isSaving}
            />
          </div>
        </div>

        <div className="flex flex-1">
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={viewMode === 'split' ? 'w-1/2' : 'w-full'}>
              <TextEditor
                content={document.content}
                setContent={(value) => updateDocumentField("content", value)}
              />
            </div>
          )}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={viewMode === 'split' ? 'w-1/2' : 'w-full'}>
              <Viewer content={document.content} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default EditorPage;