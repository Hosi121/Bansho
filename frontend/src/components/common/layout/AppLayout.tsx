import React, { ReactNode } from 'react';
import Header from './Header';

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <div className="min-h-screen bg-[#13141f]">
            {/* ヘッダー */}
            <Header />

            {/* メインコンテンツ */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
};

export default AppLayout;