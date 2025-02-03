// src/libs/hooks/useAuth.ts
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/libs/supabase';
import { useRouter } from 'next/navigation';
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ログイン処理
  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error || !data.session) {
        throw new Error(error?.message || 'ログインに失敗しました');
      }
      const supabaseUser = data.session.user;
      const newUser = {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata.full_name ?? supabaseUser.email,
        email: supabaseUser.email ?? '',
        avatar: supabaseUser.user_metadata.avatar_url,
      };
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'ログインに失敗しました',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ログアウト処理
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  }, [router]);

  // 登録処理
  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.name,
          },
        }
      });

      if (error) {
        throw new Error(error.message || '登録に失敗しました');
      }

      // メールアドレスが既に登録済みかチェック
      if (data.user && data.user.identities?.length === 0) {
        throw new Error('このメールアドレスは既に登録されています');
      }

      // メール確認が必要な場合
      if (data.user && !data.session) {
        return {
          success: true,
          needsEmailVerification: true
        };
      }

      return {
        success: true,
        needsEmailVerification: true
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : '登録に失敗しました',
      };
    }
  }, []);

  // セッション監視
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const supabaseUser = data.session.user;
        setUser({
          id: supabaseUser.id,
          name: supabaseUser.user_metadata.full_name ?? supabaseUser.email ?? '',
          email: supabaseUser.email ?? '',
          avatar: supabaseUser.user_metadata.avatar_url,
        });
      }
      setLoading(false);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const supabaseUser = session.user;
        setUser({
          id: supabaseUser.id,
          name: supabaseUser.user_metadata.full_name ?? supabaseUser.email,
          email: supabaseUser.email ?? '',
          avatar: supabaseUser.user_metadata.avatar_url,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
};

export type UseAuthReturn = ReturnType<typeof useAuth>;