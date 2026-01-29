'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { ShortcutsHelpDialog } from '@/components/dialogs/ShortcutsHelpDialog';
import { type ShortcutConfig, useKeyboardShortcuts } from '@/libs/hooks/useKeyboardShortcuts';
import Header, { type HeaderRef } from './Header';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const router = useRouter();
  const headerRef = useRef<HeaderRef>(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const handleNewDocument = useCallback(() => {
    router.push('/editor');
  }, [router]);

  const handleFocusSearch = useCallback(() => {
    headerRef.current?.focusSearch();
  }, []);

  const handleShowShortcutsHelp = useCallback(() => {
    setShowShortcutsHelp(true);
  }, []);

  const shortcuts: ShortcutConfig[] = useMemo(
    () => [
      {
        key: 'n',
        ctrl: true,
        handler: handleNewDocument,
        description: '新規ドキュメントを作成',
      },
      {
        key: 'k',
        ctrl: true,
        handler: handleFocusSearch,
        description: '検索バーにフォーカス',
      },
      {
        key: '/',
        ctrl: true,
        handler: handleShowShortcutsHelp,
        description: 'ショートカット一覧を表示',
      },
    ],
    [handleNewDocument, handleFocusSearch, handleShowShortcutsHelp]
  );

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="min-h-dvh bg-background">
      <Header ref={headerRef} />
      <main className="flex-1">{children}</main>
      <ShortcutsHelpDialog open={showShortcutsHelp} onOpenChange={setShowShortcutsHelp} />
    </div>
  );
};

export default AppLayout;
