'use client';

import { User } from 'lucide-react';
import AppLayout from '@/components/common/layout/AppLayout';
import { useProfile } from '@/libs/hooks/useProfile';
import { useAuthContext } from '@/contexts/AuthContext';
import { Camera } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuthContext();
    const {
        isEditing,
        setIsEditing,
        formData,
        setFormData,
        error,
        isLoading,
        handleUpdate,
        handleAvatarChange,
    } = useProfile();

    return (
        <AppLayout>
            <div className="min-h-[calc(100vh-3rem)] bg-[#13141f] text-white p-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold mb-8">プロフィール</h1>

                    <div className="bg-[#1a1b23] rounded-xl border border-white/10">
                        <div className="p-6">
              <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-[#232429] flex items-center justify-center overflow-hidden group">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={40} className="text-gray-400" />
                                    )}
                                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center 
      opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleAvatarChange(file);
                                            }}
                                        />
                                        <Camera size={20} className="text-white" />
                                    </label>
                                </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
                                {error}
                            </div>
                        )}

                        {isEditing ? (
                            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        名前
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#232429] border border-white/10 rounded-lg px-4 py-2 text-white 
                        focus:outline-none focus:ring-2 focus:ring-[#7B8CDE]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        メールアドレス
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-[#232429] border border-white/10 rounded-lg px-4 py-2 text-white 
                        focus:outline-none focus:ring-2 focus:ring-[#7B8CDE]"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                        disabled={isLoading}
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#7B8CDE] text-white rounded-lg hover:bg-[#8E9DE5] 
                        transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? '更新中...' : '変更を保存'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        名前
                                    </label>
                                    <div className="text-white">{user?.name}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        メールアドレス
                                    </label>
                                    <div className="text-white">{user?.email}</div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 text-[#7B8CDE] hover:text-[#8E9DE5] transition-colors"
                                    >
                                        プロフィールを編集
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </AppLayout >
  );
}