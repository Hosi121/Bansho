import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  createDocumentSchema,
  updateDocumentSchema,
  searchDocumentSchema,
  updateProfileSchema,
  relationsSchema,
  askSchema,
} from '@/lib/validations';

describe('registerSchema', () => {
  it('should validate correct registration data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
      name: 'Test User',
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject short password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'short',
      name: 'Test User',
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'password123',
      name: '',
    };
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: '',
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('createDocumentSchema', () => {
  it('should validate correct document data', () => {
    const validData = {
      title: 'Test Document',
      content: 'This is the content',
      tags: ['tag1', 'tag2'],
    };
    const result = createDocumentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept document without content', () => {
    const validData = {
      title: 'Test Document',
    };
    const result = createDocumentSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('');
    }
  });

  it('should reject empty title', () => {
    const invalidData = {
      title: '',
      content: 'Content',
    };
    const result = createDocumentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject title that is too long', () => {
    const invalidData = {
      title: 'a'.repeat(201),
      content: 'Content',
    };
    const result = createDocumentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('updateDocumentSchema', () => {
  it('should validate partial update data', () => {
    const validData = {
      title: 'Updated Title',
    };
    const result = updateDocumentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate content-only update', () => {
    const validData = {
      content: 'Updated content',
    };
    const result = updateDocumentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate tags-only update', () => {
    const validData = {
      tags: ['newTag'],
    };
    const result = updateDocumentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('searchDocumentSchema', () => {
  it('should validate correct search query', () => {
    const validData = {
      q: 'search term',
    };
    const result = searchDocumentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty query', () => {
    const invalidData = {
      q: '',
    };
    const result = searchDocumentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject query that is too long', () => {
    const invalidData = {
      q: 'a'.repeat(201),
    };
    const result = searchDocumentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('should validate correct profile data', () => {
    const validData = {
      name: 'New Name',
      avatar: 'https://example.com/avatar.jpg',
    };
    const result = updateProfileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept name-only update', () => {
    const validData = {
      name: 'New Name',
    };
    const result = updateProfileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid avatar URL', () => {
    const invalidData = {
      avatar: 'not-a-url',
    };
    const result = updateProfileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should accept null avatar', () => {
    const validData = {
      avatar: null,
    };
    const result = updateProfileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('relationsSchema', () => {
  it('should validate correct relations data', () => {
    const validData = {
      documentIds: [1, 2],
    };
    const result = relationsSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject single document', () => {
    const invalidData = {
      documentIds: [1],
    };
    const result = relationsSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject negative IDs', () => {
    const invalidData = {
      documentIds: [-1, 2],
    };
    const result = relationsSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('askSchema', () => {
  it('should validate correct ask data', () => {
    const validData = {
      question: 'What is this about?',
      documentIds: [1, 2, 3],
    };
    const result = askSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept question without document IDs', () => {
    const validData = {
      question: 'What is this about?',
    };
    const result = askSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty question', () => {
    const invalidData = {
      question: '',
    };
    const result = askSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject question that is too long', () => {
    const invalidData = {
      question: 'a'.repeat(1001),
    };
    const result = askSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
