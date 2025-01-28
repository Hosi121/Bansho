import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { loginAPI, registerAPI } from '@/libs/api/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // localStorage からトークンを復元
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await loginAPI(credentials);
      setUser(response.user);
      setToken(response.token);
      console.log('Saving token:', response.token);
      // localStorageに保存
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      router.push('/workspace');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '予期せぬエラーが発生しました'
      };
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await registerAPI(credentials);
      setUser(response.user);
      setToken(response.token);
      
      // localStorageに保存
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      router.push('/workspace');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '予期せぬエラーが発生しました'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return {
    user,
    token,
    loading,
    login,
    register,
    logout
  };
}