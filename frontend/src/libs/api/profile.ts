import { AuthResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const updateProfile = async (userId: string, data: { 
 name: string; 
 email: string; 
}): Promise<AuthResponse> => {
 const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
   method: 'PUT',
   headers: { 'Content-Type': 'application/json' },
   credentials: 'include',
   body: JSON.stringify(data),
 });

 if (!response.ok) throw new Error('プロフィールの更新に失敗しました');
 return response.json();
};

export const updateAvatar = async (userId: string, file: File): Promise<AuthResponse> => {
 const formData = new FormData();
 formData.append('avatar', file);

 const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/avatar`, {
   method: 'PUT',
   credentials: 'include',
   body: formData,
 });

 if (!response.ok) throw new Error('アバターの更新に失敗しました');
 return response.json();
};