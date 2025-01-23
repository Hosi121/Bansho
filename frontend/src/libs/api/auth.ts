import { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const loginAPI = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',  // これは重要
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ログインに失敗しました');
    }

    const data = await response.json();
    
    // クッキーにトークンを設定
    document.cookie = `token=${data.token}; path=/; max-age=86400; secure; samesite=strict`;
    
    return data;
};



export const registerAPI = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
    }

    return response.json();
};