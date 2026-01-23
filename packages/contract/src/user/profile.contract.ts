import { oc } from '@orpc/contract';
import { z } from 'zod';
import { ApiResponseSchema } from '../schema/common.schema.js';
import { UserResponseSchema } from '../schema/user.schema.js';
import { UserUpdateInputObjectZodSchema } from '@repo/database/schemas';

// ============================================
// Contract
// ============================================

export const profileContract = {
  me: oc
    .route({
      method: 'GET',
      path: '/user/me',
      summary: 'Get Current User Profile',
      tags: ['User'],
    })
    .input(z.object({}))
    .output(ApiResponseSchema(UserResponseSchema)),

  update: oc
    .route({
      method: 'PATCH',
      path: '/user/me',
      summary: 'Update Current User Profile',
      tags: ['User'],
    })
    .input(UserUpdateInputObjectZodSchema)
    .output(ApiResponseSchema(UserResponseSchema)),

  linkAccount: oc
    .route({
      method: 'POST',
      path: '/user/me/link',
      summary: 'Link SSO Account to Current User',
      tags: ['User'],
    })
    .input(z.object({
      provider: z.enum(['google']),
      idToken: z.string(),
    }))
    .output(ApiResponseSchema(z.void())),

  updatePassword: oc
    .route({
      method: 'POST',
      path: '/user/me/password',
      summary: 'Update User Password',
      tags: ['User'],
    })
    .input(z.object({
      currentPassword: z.string().min(1).optional(),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
    }))
    .output(ApiResponseSchema(z.void())),

  updateImage: oc
    .route({
      method: 'PATCH',
      path: '/user/me/image',
      summary: 'Update Profile Image',
      tags: ['User'],
    })
    .input(z.object({
      imageUrl: z.string().url(),
    }))
    .output(ApiResponseSchema(z.void())),

  unlinkAccount: oc
    .route({
      method: 'POST',
      path: '/user/me/unlink',
      summary: 'Unlink SSO Account',
      tags: ['User'],
    })
    .input(z.object({
      provider: z.string(),
    }))
    .output(ApiResponseSchema(z.void())),

  getProviders: oc
    .route({
      method: 'GET',
      path: '/user/me/providers',
      summary: 'Get Linked Providers',
      tags: ['User'],
    })
    .input(z.object({}))
    .output(ApiResponseSchema(z.array(z.object({
        provider: z.string()
    })))),

  hasPassword: oc
    .route({
      method: 'GET',
      path: '/user/me/has-password',
      summary: 'Check if user has password set',
      tags: ['User'],
    })
    .input(z.object({}))
    .output(ApiResponseSchema(z.object({
        hasPassword: z.boolean()
    }))),
};
