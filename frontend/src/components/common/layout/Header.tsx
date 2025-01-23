'use client';

import React, { useState } from 'react';
import { Search, User, Settings, LogOut } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import Image from 'next/image';

const Header = () => {
  const { user, logout } = useAuthContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="h-12 bg-[#1a1b23] border-b border-white/10">
      <div className="h-full px-4 flex items-center justify-between">
        <h1 className="text-lg text-white font-medium">Bansho</h1>
        
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full h-8 pl-8 pr-4 rounded-md bg-[#232429] border border-white/10 text-gray-200 
                     placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7B8CDE]"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Profile Button */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#7B8CDE] flex items-center justify-center">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Profile"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <User size={16} className="text-white" />
              )}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 py-1 bg-[#232429] rounded-lg shadow-xl border border-white/10 z-50">
              <div className="px-4 py-2 border-b border-white/10">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              
              <div className="py-1">
                <button 
                  className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/5 flex items-center gap-2"
                  onClick={() => {/* マイページに遷移 */}}
                >
                  <User size={16} className="text-gray-400" />
                  マイページ
                </button>
                <button 
                  className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/5 flex items-center gap-2"
                  onClick={() => {/* 設定ページに遷移 */}}
                >
                  <Settings size={16} className="text-gray-400" />
                  設定
                </button>
              </div>

              <div className="border-t border-white/10 py-1">
                <button 
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                  onClick={logout}
                >
                  <LogOut size={16} />
                  ログアウト
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;