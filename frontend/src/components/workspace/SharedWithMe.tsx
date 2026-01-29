'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { File, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getSharedDocuments, SharedDocument } from '@/libs/api/shares';

interface SharedWithMeProps {
  className?: string;
}

export function SharedWithMe({ className }: SharedWithMeProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadSharedDocuments();
  }, []);

  const loadSharedDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await getSharedDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load shared documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentClick = (documentId: string) => {
    router.push(`/editor/${documentId}`);
  };

  if (isLoading) {
    return (
      <div className={cn('px-3 py-4', className)}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return null;
  }

  const displayedDocuments = isExpanded ? documents : documents.slice(0, 3);

  return (
    <div className={cn('px-3 pt-6', className)}>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
        共有されたドキュメント
      </div>
      <div className="space-y-1">
        {displayedDocuments.map((doc) => (
          <Button
            key={doc.id}
            variant="ghost"
            onClick={() => handleDocumentClick(doc.id)}
            className="w-full justify-start h-auto py-2"
          >
            <File className="mr-2 size-4 flex-shrink-0 text-muted-foreground" />
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium truncate">{doc.title}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="size-4">
                  <AvatarImage src={doc.owner.avatar || undefined} />
                  <AvatarFallback>
                    <User className="size-2" />
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{doc.owner.name || doc.owner.email}</span>
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  {doc.permission === 'edit' ? '編集可' : '閲覧のみ'}
                </Badge>
              </div>
            </div>
          </Button>
        ))}
        {documents.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '折りたたむ' : `他 ${documents.length - 3} 件を表示`}
          </Button>
        )}
      </div>
    </div>
  );
}
