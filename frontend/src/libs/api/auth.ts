import { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function loginAPI(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'ログインに失敗しました');
    }
  
    const data = await response.json();
    console.log('Login response:', data);  // デバッグ用ログは残す
    
    // トークンが正しく返却されていることを確認
    if (!data.token) {
      throw new Error('トークンが見つかりません');
    }
  
    return {
      token: data.token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar
      }
    };
  }

export async function registerAPI(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'アカウント登録に失敗しました');
  }

  return response.json();
}