import React, { useState } from "react";
import { X, Plus, Save } from 'lucide-react';

interface ToolbarProps {
  title: string;
  setTitle: (value: string) => void;
  tags: string[];
  setTags: (value: string[]) => void;
  
  // 追加: 親が渡してくれる「保存実行用の関数」と「保存中フラグ」
  onSave: () => void;
  isSaving: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  title,
  setTitle,
  tags,
  setTags,
  onSave,
  isSaving
}) => {
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
    <div className="border-b border-white/10 bg-[#232429]">
      {/* メインツールバー */}
      <div className="flex items-center justify-between p-4">
        <input
          type="text"
          placeholder="タイトルを入力"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 p-2 mr-4 bg-[#2A2B32] text-white placeholder-gray-400 
                     border border-white/10 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-[#7B8CDE]/50"
        />
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center px-4 py-2 bg-[#7B8CDE] text-white rounded-lg
                     hover:bg-[#8E9DE5] active:bg-[#6B7BD0] transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-[#7B8CDE]/50
                     disabled:opacity-60"
        >
          {/* 保存中はアイコンをくるくる回したり、文言を変えたり */}
          <Save size={18} className={`mr-2 ${isSaving ? 'animate-spin' : ''}`} />
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>

      {/* タグセクション */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2 mb-2">
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
              placeholder="新しいタグを追加 (Enter)"
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
      </div>
    </div>
  );
};

export default Toolbar;
