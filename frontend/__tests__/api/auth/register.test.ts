import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/register/route';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}));

import { prisma } from '@/lib/prisma';

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: object) => {
    return new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  it('should register a new user successfully', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('User created successfully');
    expect(data.user).toHaveProperty('id');
    expect(data.user).toHaveProperty('email', 'test@example.com');
  });

  it('should return 400 for invalid email', async () => {
    const request = createRequest({
      email: 'invalid-email',
      password: 'password123',
      name: 'Test User',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should return 400 for short password', async () => {
    const request = createRequest({
      email: 'test@example.com',
      password: 'short',
      name: 'Test User',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should return 400 for empty name', async () => {
    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
      name: '',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should return 409 if user already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      name: 'Existing User',
      passwordHash: 'existing_hash',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('User with this email already exists');
  });

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database error'));

    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should hash password before storing', async () => {
    const bcrypt = await import('bcrypt');
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password',
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const request = createRequest({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    await POST(request);

    expect(bcrypt.default.hash).toHaveBeenCalledWith('password123', 10);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: 'hashed_password',
        }),
      })
    );
  });
});
