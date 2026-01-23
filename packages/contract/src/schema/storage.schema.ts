import { z } from 'zod';

// ============================================
// Storage Schemas
// ============================================

export const UploadUrlInputSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
  size: z.number().int().positive(),
});

export const UploadUrlResponseSchema = z.object({
  url: z.string(),
  key: z.string(),
});

// ============================================
// Types
// ============================================

export type UploadUrlInput = z.infer<typeof UploadUrlInputSchema>;
export type UploadUrlResponse = z.infer<typeof UploadUrlResponseSchema>;
