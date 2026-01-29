import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/libs/hooks/useAuth';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock next-auth/react
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

// Mock fetch
global.fetch = vi.fn();

import { useSession } from 'next-auth/react';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('user state', () => {
    it('should return null user when not authenticated', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should return user data when authenticated', () => {
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            image: 'https://example.com/avatar.jpg',
          },
          expires: new Date().toISOString(),
        },
        status: 'authenticated',
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      });
      expect(result.current.loading).toBe(false);
    });

    it('should show loading state', () => {
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'loading',
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
    });
  });

  describe('login', () => {
    it('should call signIn with credentials', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null });
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      let loginResult: { success: boolean; error?: string };
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
      expect(loginResult!.success).toBe(true);
    });

    it('should return error on failed login', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' });
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      let loginResult: { success: boolean; error?: string };
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      });

      expect(loginResult!.success).toBe(false);
      expect(loginResult!.error).toBe('メールアドレスまたはパスワードが正しくありません');
    });

    it('should handle signIn exception', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'));
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      let loginResult: { success: boolean; error?: string };
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(loginResult!.success).toBe(false);
      expect(loginResult!.error).toBe('ログインに失敗しました');
    });
  });

  describe('register', () => {
    it('should register and auto-login on success', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          message: 'User created successfully',
          user: { id: 1, email: 'test@example.com', name: 'Test User' },
        }),
      } as Response);
      mockSignIn.mockResolvedValue({ ok: true, error: null });
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      let registerResult: { success: boolean; error?: string };
      await act(async () => {
        registerResult = await result.current.register({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          name: 'Test User',
        });
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      });
      expect(mockSignIn).toHaveBeenCalled();
      expect(registerResult!.success).toBe(true);
    });

    it('should return error on failed registration', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({
          error: 'User with this email already exists',
        }),
      } as Response);
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      let registerResult: { success: boolean; error?: string };
      await act(async () => {
        registerResult = await result.current.register({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          name: 'Test User',
        });
      });

      expect(registerResult!.success).toBe(false);
      expect(registerResult!.error).toBe('User with this email already exists');
    });

    it('should handle fetch exception', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      let registerResult: { success: boolean; error?: string };
      await act(async () => {
        registerResult = await result.current.register({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          name: 'Test User',
        });
      });

      expect(registerResult!.success).toBe(false);
      expect(registerResult!.error).toBe('登録に失敗しました');
    });

    it('should succeed even if auto-login fails', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          message: 'User created successfully',
          user: { id: 1, email: 'test@example.com', name: 'Test User' },
        }),
      } as Response);
      mockSignIn.mockResolvedValue({ ok: false, error: 'SignIn failed' });
      vi.mocked(useSession).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      let registerResult: { success: boolean; needsEmailVerification?: boolean };
      await act(async () => {
        registerResult = await result.current.register({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          name: 'Test User',
        });
      });

      expect(registerResult!.success).toBe(true);
    });
  });

  describe('logout', () => {
    it('should sign out and redirect to login', async () => {
      mockSignOut.mockResolvedValue(undefined);
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          expires: new Date().toISOString(),
        },
        status: 'authenticated',
        update: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});
