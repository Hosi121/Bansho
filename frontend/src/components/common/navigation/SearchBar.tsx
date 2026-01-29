'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const SearchBar = ({
  placeholder = "Search documents...",
  onSearch
}: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-10"
        onChange={(e) => onSearch?.(e.target.value)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute left-0 top-0 h-full w-10 pointer-events-none"
        aria-label="検索"
      >
        <Search className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
};

export default SearchBar;
