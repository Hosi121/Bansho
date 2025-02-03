
import React, { useState } from "react";
import { X, Plus } from 'lucide-react';

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.repeat && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center px-3 py-1 rounded-full
            bg-[#2A2B32] text-sm text-white border border-white/10"
        >
          {tag}
          <button
            onClick={() => handleRemoveTag(tag)}
            className="ml-2 text-gray-400 hover:text-white 
              focus:outline-none transition-colors"
          >
            <X size={14} />
          </button>
        </span>
      ))}
      <div className="relative">
        <input
          type="text"
          placeholder="タグを追加"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          className="px-3 py-1 bg-[#2A2B32] text-white placeholder-gray-400 
            border border-white/10 rounded-full text-sm
            focus:outline-none focus:ring-2 focus:ring-[#7B8CDE]/50"
        />
        {newTag && (
          <button
            onClick={() => {
              if (newTag.trim() && !tags.includes(newTag.trim())) {
                setTags([...tags, newTag.trim()]);
                setNewTag("");
              }
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2
              text-gray-400 hover:text-white transition-colors"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
