'use client';

import { FileText, Link2 } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import type { Backlink } from '@/types/document';

interface BacklinksPanelProps {
  backlinks: Backlink[];
}

const BacklinksPanel: React.FC<BacklinksPanelProps> = ({ backlinks }) => {
  if (backlinks.length === 0) {
    return null;
  }

  return (
    <div className="border-t bg-card">
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link2 className="size-4" />
          <span>バックリンク ({backlinks.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {backlinks.map((backlink) => (
            <Link
              key={backlink.id}
              href={`/editor?id=${backlink.id}`}
              className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-sm hover:bg-secondary/80 transition-colors"
            >
              <FileText className="size-3.5 text-muted-foreground" />
              <span className="truncate max-w-[200px]">{backlink.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BacklinksPanel;
