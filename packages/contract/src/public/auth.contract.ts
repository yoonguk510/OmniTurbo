import { oc } from '@orpc/contract';
import { z } from 'zod';
import { ApiResponseSchema } from '../common/api-response.schema.js';
import { UserModelSchema, UserCreateInputObjectZodSchema } from '@repo/database/schemas';

const LoginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const UserResponseSchema = UserModelSchema.omit({
  password: true,
  accounts: true,
  sessions: true,
});

const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserResponseSchema,
});

const RegisterInputSchema = UserCreateInputObjectZodSchema.pick({
  email: true,
  password: true,
  name: true,
}).extend({
  password: z.string().min(6), // Enforce password requirement
});

export const authContract = {
  login: oc
    .route({
      method: 'POST',
      path: '/auth/login',
      summary: 'User Login',
      tags: ['Auth'],
    })
    .input(LoginInputSchema)
    .output(ApiResponseSchema(LoginResponseSchema))
    .errors({
      UNAUTHORIZED: {
        status: 401,
        message: 'Invalid email or password',
      },
    }),

  register: oc
    .route({
      method: 'POST',
      path: '/auth/register',
      summary: 'User Registration',
      tags: ['Auth'],
    })
    .input(RegisterInputSchema)
    .output(ApiResponseSchema(UserResponseSchema))
    .errors({
      CONFLICT: {
        status: 409,
        message: 'Email already exists',
      },
    }),
};
