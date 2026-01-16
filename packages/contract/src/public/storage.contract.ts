import { oc } from '@orpc/contract';
import { z } from 'zod';
import { ApiResponseSchema } from '../common/api-response.schema.js';

export const storageContract = {
  getUploadUrl: oc
    .route({
      method: 'POST',
      path: '/storage/upload-url',
      summary: 'Get Presigned Upload URL',
      tags: ['Storage'],
    })
    .input(z.object({
        filename: z.string(),
        contentType: z.string(),
    }))
    .output(ApiResponseSchema(z.object({
        url: z.string(),
        key: z.string(),
    }))),
};
