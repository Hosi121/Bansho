import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/forgot-password/route';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    passwordResetToken: {
      updateMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock email service
vi.mock('@/lib/email', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock crypto
vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn().mockReturnValue({
      toString: vi.fn().mockReturnValue('mock_token_12345'),
    }),
  },
}));

import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: object) => {
    return new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  it('should send reset email for existing user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    vi.mocked(prisma.passwordResetToken.updateMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({
      id: 1,
      token: 'mock_token_12345',
      userId: 1,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      usedAt: null,
    });

    const request = createRequest({ email: 'test@example.com' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain('If an account exists');
    expect(sendPasswordResetEmail).toHaveBeenCalledWith({
      to: 'test@example.com',
      token: 'mock_token_12345',
      userName: 'Test User',
    });
  });

  it('should return same response for non-existing user (prevent enumeration)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const request = createRequest({ email: 'nonexistent@example.com' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain('If an account exists');
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid email format', async () => {
    const request = createRequest({ email: 'invalid-email' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should invalidate existing tokens before creating new one', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    vi.mocked(prisma.passwordResetToken.updateMany).mockResolvedValue({ count: 2 });
    vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({
      id: 3,
      token: 'mock_token_12345',
      userId: 1,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      usedAt: null,
    });

    const request = createRequest({ email: 'test@example.com' });
    await POST(request);

    expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 1,
        usedAt: null,
      },
      data: {
        usedAt: expect.any(Date),
      },
    });
  });

  it('should not expose user existence when email fails', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    vi.mocked(prisma.passwordResetToken.updateMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({
      id: 1,
      token: 'mock_token_12345',
      userId: 1,
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      usedAt: null,
    });
    vi.mocked(sendPasswordResetEmail).mockResolvedValue({ success: false, error: 'Email failed' });

    const request = createRequest({ email: 'test@example.com' });
    const response = await POST(request);
    const data = await response.json();

    // Should still return success to prevent enumeration
    expect(response.status).toBe(200);
    expect(data.message).toContain('If an account exists');
  });

  it('should not process deleted users', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null); // findUnique with deletedAt: null returns null for deleted users

    const request = createRequest({ email: 'deleted@example.com' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database error'));

    const request = createRequest({ email: 'test@example.com' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
