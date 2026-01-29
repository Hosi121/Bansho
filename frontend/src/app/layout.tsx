import { Metadata } from 'next';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
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
    <html lang="ja" className="dark">
      <body>
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
