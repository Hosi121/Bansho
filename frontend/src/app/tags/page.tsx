'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Pencil, Trash2, Loader2, File } from 'lucide-react';
import AppLayout from '@/components/common/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { getTags, updateTag, deleteTag, TagWithCount } from '@/libs/api/tags';

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [tagToDelete, setTagToDelete] = useState<TagWithCount | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const data = await getTags();
      setTags(data);
    } catch (err) {
      toast.error('タグの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (tag: TagWithCount) => {
    setEditingTagId(tag.id);
    setEditingName(tag.name);
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditingName('');
  };

  const handleSaveEdit = async () => {
    if (!editingTagId || !editingName.trim()) return;

    setIsSaving(true);
    try {
      const updated = await updateTag(editingTagId, editingName.trim());
      setTags((prev) =>
        prev.map((tag) =>
          tag.id === editingTagId ? { ...tag, name: updated.name } : tag
        )
      );
      toast.success('タグを更新しました');
      handleCancelEdit();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'タグの更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!tagToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTag(tagToDelete.id);
      setTags((prev) => prev.filter((tag) => tag.id !== tagToDelete.id));
      toast.success('タグを削除しました');
      setTagToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'タグの削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTagClick = (tagId: string) => {
    router.push(`/search?tags=${tagId}`);
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100dvh-3rem)] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Tag className="size-8 text-primary" />
            <h1 className="text-2xl font-bold">タグ管理</h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : tags.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Tag className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">タグがありません</p>
                <p className="text-sm text-muted-foreground mt-2">
                  ドキュメントにタグを追加すると、ここに表示されます
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tags.map((tag) => (
                <Card key={tag.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      {editingTagId === tag.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="h-8"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                          >
                            {isSaving ? <Loader2 className="size-4 animate-spin" /> : '保存'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                          >
                            キャンセル
                          </Button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleTagClick(tag.id)}
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            <Tag className="size-4" />
                            {tag.name}
                          </button>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8"
                              onClick={() => handleStartEdit(tag)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive hover:text-destructive"
                              onClick={() => setTagToDelete(tag)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <File className="size-4" />
                      <span>{tag.documentCount} 件のドキュメント</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タグを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{tagToDelete?.name}」を削除します。このタグが付いているドキュメントからタグが削除されます。
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
