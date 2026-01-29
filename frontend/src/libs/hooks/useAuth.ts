'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === 'loading';

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        avatar: session.user.image ?? undefined,
      }
    : null;

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        return {
          success: false,
          error: 'メールアドレスまたはパスワードが正しくありません',
        };
      }

      return { success: true };
    } catch {
      return {
        success: false,
        error: 'ログインに失敗しました',
      };
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || '登録に失敗しました',
        };
      }

      // 登録成功後、自動的にログイン
      const loginResult = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (loginResult?.error) {
        return {
          success: true,
          needsEmailVerification: false,
        };
      }

      return { success: true };
    } catch {
      return {
        success: false,
        error: '登録に失敗しました',
      };
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/login');
  }, [router]);

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
};

export type UseAuthReturn = ReturnType<typeof useAuth>;
