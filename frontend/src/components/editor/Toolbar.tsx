import React, { useState, useEffect } from "react";
import { X, Plus, Save } from 'lucide-react';

interface ToolbarProps {
  title: string;
  setTitle: (value: string) => void;
  tags: string[];  // 配列として受け取るように変更
  setTags: (value: string[]) => void;  // 配列として設定するように変更
}

const Toolbar: React.FC<ToolbarProps> = ({ title, setTitle, tags, setTags }) => {
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    setIsSaving(true);
    // ここで保存処理を実装
    setTimeout(() => setIsSaving(false), 1000);
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
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-[#7B8CDE] text-white rounded-lg
            hover:bg-[#8E9DE5] active:bg-[#6B7BD0] transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#7B8CDE]/50"
        >
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
              onKeyPress={handleAddTag}
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