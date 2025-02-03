'use client';

import { createContext, useContext, ReactNode } from 'react';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';
import { useAuth } from '@/libs/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();

  // ローディング画面は、認証の初期化時のみ表示
  if (auth.loading && !auth.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A1B23]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7B8CDE]" />
      </div>
    );
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};