import { AuthResponse } from '@/types/auth';

export const updateProfile = async (userId: string, data: {
  name?: string;
}): Promise<AuthResponse> => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('認証が必要です');
    }
    if (response.status === 403) {
      throw new Error('この操作は許可されていません');
    }
    throw new Error('プロフィールの更新に失敗しました');
  }
  return response.json();
};

export const updateAvatar = async (userId: string, file: File): Promise<AuthResponse> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`/api/users/${userId}/avatar`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('認証が必要です');
    }
    if (response.status === 403) {
      throw new Error('この操作は許可されていません');
    }
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.error || 'アバターの形式が不正です');
    }
    throw new Error('アバターの更新に失敗しました');
  }
  return response.json();
};

export const getProfile = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('認証が必要です');
    }
    if (response.status === 404) {
      throw new Error('ユーザーが見つかりません');
    }
    throw new Error('プロフィールの取得に失敗しました');
  }
  return response.json();
};
