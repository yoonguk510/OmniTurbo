import { z } from 'zod';
import { UserSchema } from '@repo/database/schemas';

// ============================================
// User Schemas
// ============================================

export const UserResponseSchema = UserSchema.omit({
  password: true,
});

// ============================================
// Types
// ============================================

export type UserResponse = z.infer<typeof UserResponseSchema>;
