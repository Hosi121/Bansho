'use client';

import { useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { redirect } from 'next/navigation';  // useRouterの代わりにredirectを使用
import { User, LoginCredentials, RegisterCredentials, JWTPayload } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // トークンの検証
  const validateToken = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  // 初期化時にローカルストレージのトークンをチェック
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && validateToken(token)) {
      const decoded = jwtDecode<JWTPayload>(token);
      setUser({
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name
      });
    } else {
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, [validateToken]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      // 実際のAPI呼び出しに置き換える必要がある
      const mockResponse = {
        token: 'mock_jwt_token',
        user: {
          id: '1',
          email: credentials.email,
          name: 'Test User'
        }
      };

      localStorage.setItem('token', mockResponse.token);
      setUser(mockResponse.user);
      redirect('/workspace');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'ログインに失敗しました' };
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      // 実際のAPI呼び出しに置き換える必要がある
      const mockResponse = {
        token: 'mock_jwt_token',
        user: {
          id: '1',
          email: credentials.email,
          name: credentials.name
        }
      };

      localStorage.setItem('token', mockResponse.token);
      setUser(mockResponse.user);
      redirect('/workspace');
      return { success: true };
    } catch (error) {
      return { success: false, error: '登録に失敗しました' };
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