import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { updateProfile, updateAvatar } from '@/libs/api/profile';

export const useProfile = () => {
  const { user, login } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });

  const handleUpdate = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await updateProfile(user.id, formData);
      if (response.token) {
        await login({
          email: formData.email,
          password: formData.password
        });
      }
      setIsEditing(false);
      setError('');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'プロフィールの更新に失敗しました';
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await updateAvatar(user.id, file);
      if (response.token) {
        await login({
          email: user?.email || '',
          password: formData.password
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'アバターの更新に失敗しました';
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    error,
    isLoading,
    handleUpdate,
    handleAvatarChange
  };
};