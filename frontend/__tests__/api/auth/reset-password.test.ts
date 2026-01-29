import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/reset-password/route';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    passwordResetToken: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    $transaction: vi.fn((promises: Promise<unknown>[]) => Promise.all(promises)),
  },
}));

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('new_hashed_password'),
  },
}));

import { prisma } from '@/lib/prisma';

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: object) => {
    return new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  const mockValidToken = {
    id: 1,
    token: 'valid_token',
    userId: 1,
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    createdAt: new Date(),
    usedAt: null,
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'old_hash',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  };

  it('should reset password successfully with valid token', async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockValidToken);
    vi.mocked(prisma.user.update).mockResolvedValue(mockValidToken.user);
    vi.mocked(prisma.passwordResetToken.update).mockResolvedValue({
      ...mockValidToken,
      usedAt: new Date(),
    });

    const request = createRequest({
      token: 'valid_token',
      password: 'newpassword123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Password has been reset successfully');
  });

  it('should return 400 for invalid token', async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(null);

    const request = createRequest({
      token: 'invalid_token',
      password: 'newpassword123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid or expired reset token');
  });

  it('should return 400 for expired token', async () => {
    const expiredToken = {
      ...mockValidToken,
      expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
    };
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(expiredToken);

    const request = createRequest({
      token: 'expired_token',
      password: 'newpassword123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Reset token has expired');
  });

  it('should return 400 for already used token', async () => {
    const usedToken = {
      ...mockValidToken,
      usedAt: new Date(),
    };
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(usedToken);

    const request = createRequest({
      token: 'used_token',
      password: 'newpassword123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Reset token has already been used');
  });

  it('should return 400 if user is deleted', async () => {
    const tokenWithDeletedUser = {
      ...mockValidToken,
      user: {
        ...mockValidToken.user,
        deletedAt: new Date(),
      },
    };
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(tokenWithDeletedUser);

    const request = createRequest({
      token: 'valid_token',
      password: 'newpassword123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User not found');
  });

  it('should return 400 for short password', async () => {
    const request = createRequest({
      token: 'valid_token',
      password: 'short',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 for empty token', async () => {
    const request = createRequest({
      token: '',
      password: 'newpassword123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should hash new password before storing', async () => {
    const bcrypt = await import('bcrypt');
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockValidToken);
    vi.mocked(prisma.user.update).mockResolvedValue(mockValidToken.user);
    vi.mocked(prisma.passwordResetToken.update).mockResolvedValue({
      ...mockValidToken,
      usedAt: new Date(),
    });

    const request = createRequest({
      token: 'valid_token',
      password: 'newpassword123',
    });

    await POST(request);

    expect(bcrypt.default.hash).toHaveBeenCalledWith('newpassword123', 10);
  });

  it('should update password and mark token as used in transaction', async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(mockValidToken);
    vi.mocked(prisma.user.update).mockResolvedValue(mockValidToken.user);
    vi.mocked(prisma.passwordResetToken.update).mockResolvedValue({
      ...mockValidToken,
      usedAt: new Date(),
    });

    const request = createRequest({
      token: 'valid_token',
      password: 'newpassword123',
    });

    await POST(request);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: mockValidToken.userId },
      data: { passwordHash: 'new_hashed_password' },
    });
    expect(prisma.passwordResetToken.update).toHaveBeenCalledWith({
      where: { id: mockValidToken.id },
      data: { usedAt: expect.any(Date) },
    });
  });

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockRejectedValue(new Error('Database error'));

    const request = createRequest({
      token: 'valid_token',
      password: 'newpassword123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
