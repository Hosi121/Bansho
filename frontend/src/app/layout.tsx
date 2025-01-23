import { Metadata } from 'next';
import { AuthProvider } from '@/components/providers/AuthProvider';
import "@/app/globals.css";

export const metadata: Metadata = {
  title: 'Bansho',
  description: 'Knowledge Graph Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}