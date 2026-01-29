'use client';

import { File, Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import AppLayout from '@/components/common/layout/AppLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DeletedDocument {
  id: string;
  title: string;
  excerpt: string;
  deletedAt: string;
  tags: string[];
}

export default function TrashPage() {
  const [documents, setDocuments] = useState<DeletedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeletedDocument | null>(null);

  const fetchDeletedDocuments = useCallback(async () => {
    try {
      const response = await fetch('/api/documents/trash');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to fetch deleted documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeletedDocuments();
  }, [fetchDeletedDocuments]);

  const handleRestore = async (doc: DeletedDocument) => {
    setIsProcessing(doc.id);
    try {
      const response = await fetch(`/api/documents/${doc.id}/restore`, {
        method: 'POST',
      });
      if (response.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      }
    } catch (error) {
      console.error('Failed to restore document:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handlePermanentDelete = async (doc: DeletedDocument) => {
    setIsProcessing(doc.id);
    setDeleteConfirm(null);
    try {
      const response = await fetch(`/api/documents/${doc.id}/permanent`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      }
    } catch (error) {
      console.error('Failed to permanently delete document:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const formatDeletedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今日';
    }
    if (diffDays === 1) {
      return '昨日';
    }
    if (diffDays < 7) {
      return `${diffDays}日前`;
    }
    return date.toLocaleDateString('ja-JP');
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100dvh-3rem)] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Trash2 className="size-6" />
              ゴミ箱
            </h1>
            <p className="text-muted-foreground text-pretty">
              削除したドキュメントは30日後に自動的に完全削除されます
            </p>
          </div>

          <Card>
            {isLoading ? (
              <div className="space-y-4 p-4">
                {['skeleton-1', 'skeleton-2', 'skeleton-3'].map((key) => (
                  <div key={key} className="flex gap-3">
                    <Skeleton className="size-5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Trash2 className="size-12 mx-auto mb-4 opacity-50" />
                <p className="text-pretty">ゴミ箱は空です</p>
              </div>
            ) : (
              <div className="divide-y">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors"
                  >
                    <File className="size-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.title}</h3>
                      {doc.excerpt && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {doc.excerpt}
                        </p>
                      )}
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        削除日: {formatDeletedDate(doc.deletedAt)}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(doc)}
                        disabled={isProcessing === doc.id}
                      >
                        {isProcessing === doc.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <>
                            <RotateCcw className="size-4 mr-1" />
                            復元
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm(doc)}
                        disabled={isProcessing === doc.id}
                      >
                        <Trash2 className="size-4 mr-1" />
                        完全削除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>完全に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteConfirm?.title}」を完全に削除します。 この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handlePermanentDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              完全に削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
