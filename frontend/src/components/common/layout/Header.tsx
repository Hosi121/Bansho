'use client';

import React from 'react';
import { Search, User, Settings, LogOut } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSearch } from '@/libs/hooks/useSearch';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const Header = () => {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    handleSearch
  } = useSearch();

  return (
    <header className="h-12 bg-card border-b">
      <div className="h-full px-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/workspace')}
          className="text-lg font-medium hover:text-primary"
        >
          BANSHO
        </Button>

        <div className="flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="文書を検索..."
              className="pl-9 h-8"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute left-0 top-0 h-8 w-8"
              aria-label="検索"
            >
              <Search
                className={cn('size-4', isSearching && 'animate-spin')}
              />
            </Button>
          </form>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="size-7">
                <AvatarImage src={user?.avatar} alt={user?.name ?? 'User'} />
                <AvatarFallback>
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 size-4" />
              マイページ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 size-4" />
              設定
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
