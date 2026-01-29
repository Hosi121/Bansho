'use client';

import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SHORTCUT_LABELS } from '@/libs/hooks/useKeyboardShortcuts';

interface ShortcutsHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

const shortcuts: ShortcutItem[] = [
  { keys: [SHORTCUT_LABELS.mod, 'N'], description: '新規ドキュメントを作成' },
  { keys: [SHORTCUT_LABELS.mod, 'K'], description: '検索バーにフォーカス' },
  { keys: [SHORTCUT_LABELS.mod, 'S'], description: 'ドキュメントを保存' },
  { keys: [SHORTCUT_LABELS.mod, '/'], description: 'ショートカット一覧を表示' },
  { keys: ['Esc'], description: 'ダイアログを閉じる' },
];

export function ShortcutsHelpDialog({ open, onOpenChange }: ShortcutsHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="size-5" />
            キーボードショートカット
          </DialogTitle>
          <DialogDescription>よく使う操作のショートカット一覧</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-4">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.description}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, index) => (
                  <span key={`${shortcut.description}-${key}`}>
                    <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
                      {key}
                    </kbd>
                    {index < shortcut.keys.length - 1 && (
                      <span className="mx-0.5 text-muted-foreground">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground pt-4">
          {SHORTCUT_LABELS.mod === '⌘' ? 'Mac: ⌘ = Command' : 'Windows/Linux: Ctrl = Control'}
        </div>
      </DialogContent>
    </Dialog>
  );
}
