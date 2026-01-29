'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Loader2, History, RotateCcw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  getVersions,
  getVersion,
  restoreVersion,
  DocumentVersion,
} from '@/libs/api/versions';
import { cn } from '@/lib/utils';

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  onRestore: (title: string, content: string) => void;
}

export function VersionHistoryDialog({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  onRestore,
}: VersionHistoryDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (open && documentId) {
      loadVersions();
    }
  }, [open, documentId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const data = await getVersions(documentId);
      setVersions(data);
      setSelectedVersion(null);
      setPreviewContent('');
    } catch (err) {
      console.error('Failed to load versions:', err);
      toast.error('履歴の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVersion = async (versionId: string) => {
    setSelectedVersion(versionId);
    setIsLoadingPreview(true);

    try {
      const version = await getVersion(documentId, versionId);
      setPreviewContent(version.content);
    } catch (err) {
      toast.error('バージョンの読み込みに失敗しました');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;

    setIsRestoring(true);

    try {
      const result = await restoreVersion(documentId, selectedVersion);
      toast.success('バージョンを復元しました');
      onRestore(result.title, result.content);
      onOpenChange(false);
    } catch (err) {
      toast.error('復元に失敗しました');
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5" />
            バージョン履歴
          </DialogTitle>
          <DialogDescription className="truncate">
            「{documentTitle}」の過去のバージョンを確認・復元できます
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="size-12 mx-auto mb-4 opacity-50" />
            <p>まだバージョン履歴がありません</p>
            <p className="text-sm">ドキュメントを保存すると履歴が作成されます</p>
          </div>
        ) : (
          <div className="flex gap-4 h-[400px]">
            {/* Version list */}
            <div className="w-1/3 border rounded-lg overflow-hidden">
              <div className="overflow-y-auto h-full">
                {versions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => handleSelectVersion(version.id)}
                    className={cn(
                      'w-full p-3 text-left border-b last:border-b-0 hover:bg-muted transition-colors',
                      selectedVersion === version.id && 'bg-primary/10'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        v{version.version}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(version.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarImage src={version.user.avatar || undefined} />
                        <AvatarFallback>
                          <User className="size-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate">
                        {version.user.name || version.user.email}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview panel */}
            <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-3 border-b bg-muted/50">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Eye className="size-4" />
                  プレビュー
                </span>
                {selectedVersion && (
                  <Button
                    size="sm"
                    onClick={handleRestore}
                    disabled={isRestoring}
                  >
                    {isRestoring ? (
                      <Loader2 className="size-4 animate-spin mr-2" />
                    ) : (
                      <RotateCcw className="size-4 mr-2" />
                    )}
                    このバージョンに復元
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingPreview ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : selectedVersion ? (
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {previewContent}
                  </pre>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>左のリストからバージョンを選択してください</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
