'use client';

import React, { ReactNode } from 'react';
import Header from './Header';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
