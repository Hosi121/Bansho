'use client';

import React, { useState } from "react";
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ToolbarProps {
  title: string;
  setTitle: (value: string) => void;
  tags: string[];
  setTags: (value: string[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ tags, setTags }) => {
  const [newTag, setNewTag] = useState("");

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.repeat && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {tag}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveTag(tag)}
            aria-label={`${tag}を削除`}
            className="size-4 p-0 hover:bg-transparent"
          >
            <X className="size-3" />
          </Button>
        </Badge>
      ))}
      <div className="relative">
        <Input
          type="text"
          placeholder="タグを追加"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-7 w-32 pr-8 text-sm rounded-full"
        />
        {newTag && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddTag}
            aria-label="タグを追加"
            className="absolute right-1 top-1/2 -translate-y-1/2 size-5"
          >
            <Plus className="size-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
