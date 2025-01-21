'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login({ email, password });
    if (result.success) {
      router.push('/workspace');
    } else {
      setError(result.error || 'ログインに失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1B23] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-[#232429] rounded-2xl p-8 shadow-xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">BANSHO</h1>
          <p className="text-gray-400">知識を、立体的に。</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm text-gray-300 ml-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-[#2A2B32] rounded-lg border border-white/10 text-white 
                focus:outline-none focus:ring-2 focus:ring-[#7B8CDE]/50 focus:border-transparent
                transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300 ml-1">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-[#2A2B32] rounded-lg border border-white/10 text-white 
                focus:outline-none focus:ring-2 focus:ring-[#7B8CDE]/50 focus:border-transparent
                transition-all duration-200"
            />
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-[#7B8CDE] hover:text-[#8E9DE5] transition-colors"
            >
              パスワードをお忘れの方
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 bg-[#7B8CDE] text-white rounded-lg font-medium
          hover:bg-[#8E9DE5] active:bg-[#6B7BD0]
          transition-all duration-200 transform hover:scale-[1.02]
          focus:outline-none focus:ring-2 focus:ring-[#7B8CDE]/50
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            アカウントをお持ちでない方は{' '}
            <Link
              href="/register"
              className="text-[#7B8CDE] hover:text-[#8E9DE5] font-medium transition-colors"
            >
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}