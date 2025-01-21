import { useState, useCallback, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { loginAPI, registerAPI } from '@/libs/api/auth';
import type { User, LoginCredentials, RegisterCredentials } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const validateToken = useCallback((token: string) => {
    try {
      const decoded = jwtDecode(token) as { exp: number };
      if (decoded.exp * 1000 < Date.now()) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && validateToken(token)) {
      // トークンが有効な場合、ユーザー情報を設定
      try {
        const decoded = jwtDecode(token) as any;
        setUser({
          id: decoded.id,
          name: decoded.name,
          email: decoded.email
        });
      } catch {
        localStorage.removeItem('token');
      }
    } else {
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, [validateToken]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await loginAPI(credentials);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ログインに失敗しました'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      const response = await registerAPI(credentials);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '登録に失敗しました'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    redirect('/login');
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
    validateToken
  };
};

export type UseAuthReturn = ReturnType<typeof useAuth>;