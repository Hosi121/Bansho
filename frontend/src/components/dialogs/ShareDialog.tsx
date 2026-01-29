'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getDocumentShares,
  shareDocument,
  updateSharePermission,
  removeShare,
  DocumentShareInfo,
} from '@/libs/api/shares';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  documentId,
  documentTitle,
}: ShareDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingShares, setIsLoadingShares] = useState(true);
  const [shares, setShares] = useState<DocumentShareInfo[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && documentId) {
      loadShares();
    }
  }, [open, documentId]);

  const loadShares = async () => {
    try {
      setIsLoadingShares(true);
      const data = await getDocumentShares(documentId);
      setShares(data);
    } catch (err) {
      console.error('Failed to load shares:', err);
    } finally {
      setIsLoadingShares(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const newShare = await shareDocument(documentId, email.trim(), permission);
      setShares((prev) => [newShare, ...prev]);
      setEmail('');
      toast.success('共有しました');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      if (message.includes('not found')) {
        setError('このメールアドレスのユーザーが見つかりません');
      } else if (message.includes('already shared')) {
        setError('すでに共有されています');
      } else if (message.includes('yourself')) {
        setError('自分自身には共有できません');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermission = async (shareId: string, newPermission: 'view' | 'edit') => {
    try {
      const updated = await updateSharePermission(documentId, shareId, newPermission);
      setShares((prev) =>
        prev.map((share) => (share.id === shareId ? updated : share))
      );
      toast.success('権限を更新しました');
    } catch (err) {
      toast.error('権限の更新に失敗しました');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await removeShare(documentId, shareId);
      setShares((prev) => prev.filter((share) => share.id !== shareId));
      toast.success('共有を解除しました');
    } catch (err) {
      toast.error('共有の解除に失敗しました');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>ドキュメントを共有</DialogTitle>
          <DialogDescription className="truncate">
            「{documentTitle}」を他のユーザーと共有します
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleShare} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/50 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレスを入力"
              />
            </div>
            <Select value={permission} onValueChange={(v: 'view' | 'edit') => setPermission(v)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">閲覧</SelectItem>
                <SelectItem value="edit">編集</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : '共有'}
            </Button>
          </div>
        </form>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-3">共有中のユーザー</h4>
          {isLoadingShares ? (
            <div className="flex justify-center py-4">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : shares.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              まだ誰とも共有されていません
            </p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={share.user.avatar || undefined} />
                    <AvatarFallback>
                      <User className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {share.user.name || share.user.email}
                    </div>
                    {share.user.name && (
                      <div className="text-xs text-muted-foreground truncate">
                        {share.user.email}
                      </div>
                    )}
                  </div>
                  <Select
                    value={share.permission}
                    onValueChange={(v: 'view' | 'edit') =>
                      handleUpdatePermission(share.id, v)
                    }
                  >
                    <SelectTrigger className="w-[80px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">閲覧</SelectItem>
                      <SelectItem value="edit">編集</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveShare(share.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
