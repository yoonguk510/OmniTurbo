import { oc } from '@orpc/contract';
import { z } from 'zod';
import { ApiResponseSchema } from '../common/api-response.schema.js';
import { UserModelSchema, UserUpdateInputObjectZodSchema } from '@repo/database/schemas';

export const profileContract = {
  me: oc
    .route({
      method: 'GET',
      path: '/user/me',
      summary: 'Get Current User Profile',
      tags: ['User'],
    })
    .input(z.void())
    .output(ApiResponseSchema(UserModelSchema)),

  update: oc
    .route({
      method: 'PATCH',
      path: '/user/me',
      summary: 'Update Current User Profile',
      tags: ['User'],
    })
    .input(UserUpdateInputObjectZodSchema)
    .output(ApiResponseSchema(UserModelSchema)),
};
