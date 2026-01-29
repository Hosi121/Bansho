'use client';

import { CheckCircle2, FileText, Loader2, Upload, XCircle } from 'lucide-react';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ImportResult } from '@/libs/api/document';

interface ImportMarkdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (files: File[]) => Promise<ImportResult>;
}

const ImportMarkdownDialog: React.FC<ImportMarkdownDialogProps> = ({
  open,
  onOpenChange,
  onImport,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const mdFiles = Array.from(files).filter((file) => file.name.toLowerCase().endsWith('.md'));
    setSelectedFiles(mdFiles);
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleImport = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsImporting(true);
    try {
      const importResult = await onImport(selectedFiles);
      setResult(importResult);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Import failed:', error);
      setResult({
        success: [],
        failed: selectedFiles.map((f) => ({
          filename: f.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        })),
      });
    } finally {
      setIsImporting(false);
    }
  }, [selectedFiles, onImport]);

  const handleClose = useCallback(() => {
    setSelectedFiles([]);
    setResult(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        handleClose();
      } else {
        onOpenChange(true);
      }
    },
    [handleClose, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Markdownをインポート</DialogTitle>
          <DialogDescription>
            .mdファイルをドラッグ&ドロップするか、選択してください
          </DialogDescription>
        </DialogHeader>

        {/* Drop zone */}
        <label
          className={cn(
            'relative block cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            isDragOver
              ? 'border-primary bg-primary/10'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".md"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="sr-only"
          />
          <Upload className="mx-auto mb-4 size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">ファイルをドロップまたはクリックして選択</p>
        </label>

        {/* Selected files */}
        {selectedFiles.length > 0 && !result && (
          <div className="max-h-40 overflow-y-auto rounded-md border">
            <div className="p-2 text-sm text-muted-foreground">
              {selectedFiles.length}個のファイルを選択
            </div>
            <ul className="divide-y">
              {selectedFiles.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center gap-2 px-3 py-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="truncate text-sm">{file.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            {result.success.length > 0 && (
              <div className="rounded-md border border-green-500/50 bg-green-500/10 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-green-500">
                  <CheckCircle2 className="size-4" />
                  {result.success.length}件のインポートに成功
                </div>
                <ul className="mt-2 max-h-24 overflow-y-auto">
                  {result.success.map((doc) => (
                    <li key={doc.id} className="text-xs text-muted-foreground">
                      {doc.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.failed.length > 0 && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <XCircle className="size-4" />
                  {result.failed.length}件のインポートに失敗
                </div>
                <ul className="mt-2 max-h-24 overflow-y-auto">
                  {result.failed.map((item, index) => (
                    <li key={`${item.filename}-${index}`} className="text-xs text-muted-foreground">
                      {item.filename}: {item.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            閉じる
          </Button>
          {!result && (
            <Button onClick={handleImport} disabled={selectedFiles.length === 0 || isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  インポート中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  インポート
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportMarkdownDialog;
