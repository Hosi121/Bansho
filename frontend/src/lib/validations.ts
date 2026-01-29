import { z } from "zod";

// Auth validations
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Document validations
export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().default(""),
  tags: z.array(z.string()).optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const searchDocumentSchema = z.object({
  q: z.string().min(1, "Search query is required").max(200, "Query must be less than 200 characters"),
});

// Profile validations
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
  avatar: z.string().url("Invalid URL").optional().nullable(),
});

// Relations validations
export const relationsSchema = z.object({
  documentIds: z.array(z.number().int().positive()).min(2, "At least 2 documents required"),
});

// Ask validations
export const askSchema = z.object({
  question: z.string().min(1, "Question is required").max(1000, "Question must be less than 1000 characters"),
  documentIds: z.array(z.number().int().positive()).optional(),
});

// Password reset validations
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
});

// Password change validations
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type SearchDocumentInput = z.infer<typeof searchDocumentSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RelationsInput = z.infer<typeof relationsSchema>;
export type AskInput = z.infer<typeof askSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
