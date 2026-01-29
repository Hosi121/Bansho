import { useCallback, useEffect } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isEditable =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      for (const shortcut of shortcuts) {
        const modifierMatch = isMac()
          ? (shortcut.meta ?? shortcut.ctrl) === event.metaKey &&
            (shortcut.alt ?? false) === event.altKey
          : (shortcut.ctrl ?? shortcut.meta) === event.ctrlKey &&
            (shortcut.alt ?? false) === event.altKey;

        const shiftMatch = (shortcut.shift ?? false) === event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (modifierMatch && shiftMatch && keyMatch) {
          // Allow Ctrl+K (search) even in editable elements
          if (isEditable && shortcut.key.toLowerCase() !== 'k') {
            continue;
          }

          event.preventDefault();
          shortcut.handler();
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

export const SHORTCUT_LABELS = {
  mod: isMac() ? '⌘' : 'Ctrl',
  alt: isMac() ? '⌥' : 'Alt',
  shift: '⇧',
  enter: '↵',
  escape: 'Esc',
};

export function formatShortcut(shortcut: ShortcutConfig): string {
  const parts: string[] = [];

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(SHORTCUT_LABELS.mod);
  }
  if (shortcut.alt) {
    parts.push(SHORTCUT_LABELS.alt);
  }
  if (shortcut.shift) {
    parts.push(SHORTCUT_LABELS.shift);
  }

  const keyLabel = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(keyLabel);

  return parts.join(' + ');
}
