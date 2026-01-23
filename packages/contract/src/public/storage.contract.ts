import { oc } from '@orpc/contract';
import { ApiResponseSchema } from '../schema/common.schema.js';
import {
  UploadUrlInputSchema,
  UploadUrlResponseSchema,
} from '../schema/storage.schema.js';

// ============================================
// Contract
// ============================================

export const storageContract = {
  getUploadUrl: oc
    .route({
      method: 'POST',
      path: '/storage/upload-url',
      summary: 'Get Presigned Upload URL',
      tags: ['Storage'],
    })
    .input(UploadUrlInputSchema)
    .output(ApiResponseSchema(UploadUrlResponseSchema))
    .errors({
      BAD_REQUEST: {
        status: 400,
        message: 'Invalid file type or size',
      },
    }),
};
