import { z } from 'zod';
import { UserCreateInputObjectZodSchema } from '@repo/database/schemas';
import { UserResponseSchema } from './user.schema.js';

// ============================================
// Auth Input Schemas
// ============================================

export const LoginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const RegisterInputSchema = UserCreateInputObjectZodSchema.pick({
  email: true,
  password: true,
  name: true,
}).extend({
  password: z.string().min(6),
});

export const SSOInputSchema = z.object({
  idToken: z.string(),
});

export const ForgotPasswordInputSchema = z.object({
  email: z.email(),
});

export const ResetPasswordInputSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export const VerifyEmailInputSchema = z.object({
  token: z.string(),
});

export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string().optional(),
});

// ============================================
// Auth Response Schemas
// ============================================

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserResponseSchema,
});

// ============================================
// Types
// ============================================

export type LoginInput = z.infer<typeof LoginInputSchema>;
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type SSOInput = z.infer<typeof SSOInputSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailInputSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Re-export UserResponseSchema for convenience
export { UserResponseSchema };
