import { z } from 'zod';

// ============================================
// API Response Schema
// ============================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.enum(['success', 'error']),
    data: dataSchema,
    message: z.string().optional(),
  });

// ============================================
// Pagination Schema
// ============================================

export const PaginationSchema = z.object({
  cursor: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(10),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// ============================================
// Success Response Schema
// ============================================

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
