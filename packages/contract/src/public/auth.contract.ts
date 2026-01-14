import { oc } from '@orpc/contract';
import { z } from 'zod';
import { ApiResponseSchema } from '../common/api-response.schema.js';
import { UserModelSchema, UserCreateInputObjectZodSchema } from '@repo/database/schemas';

const LoginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const RegisterInputSchema = UserCreateInputObjectZodSchema.pick({
  email: true,
  password: true,
  name: true,
}).extend({
  password: z.string().min(6),
});

const UserResponseSchema = UserModelSchema.omit({
  password: true,
  accounts: true,
  sessions: true,
});

const SSOInputSchema = z.object({
  idToken: z.string(),
});

const ForgotPasswordInputSchema = z.object({
  email: z.email(),
});

const ResetPasswordInputSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

const VerifyEmailInputSchema = z.object({
  token: z.string(),
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
    .output(ApiResponseSchema(z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
      user: UserResponseSchema,
    })))
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

  logout: oc
    .route({
      method: 'POST',
      path: '/auth/logout',
      summary: 'User Logout',
      tags: ['Auth'],
    })
    .input(z.void())
    .output(ApiResponseSchema(z.void())),

  refresh: oc
    .route({
      method: 'POST',
      path: '/auth/refresh',
      summary: 'Refresh Access Token',
      tags: ['Auth'],
    })
    .input(z.object({
        refreshToken: z.string().optional()
    }))
    .output(ApiResponseSchema(z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
      user: UserResponseSchema,
    }))) // Success implies cookies are updated
    .errors({
      UNAUTHORIZED: {
        status: 401,
        message: 'Invalid or missing refresh token',
      },
    }),

  google: oc
    .route({
      method: 'POST',
      path: '/auth/google',
      summary: 'Google SSO Login',
      tags: ['Auth'],
    })
    .input(SSOInputSchema)
    .output(ApiResponseSchema(z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
      user: UserResponseSchema,
    }))),

  forgotPassword: oc
    .route({
      method: 'POST',
      path: '/auth/forgot-password',
      summary: 'Request Password Reset',
      tags: ['Auth'],
    })
    .input(ForgotPasswordInputSchema)
    .output(ApiResponseSchema(z.void())),

  resetPassword: oc
    .route({
      method: 'POST',
      path: '/auth/reset-password',
      summary: 'Reset Password',
      tags: ['Auth'],
    })
    .input(ResetPasswordInputSchema)
    .output(ApiResponseSchema(z.void()))
    .errors({
      BAD_REQUEST: {
        status: 400,
        message: 'Invalid or expired token',
      },
    }),

  verifyEmail: oc
    .route({
      method: 'POST',
      path: '/auth/verify-email',
      summary: 'Verify Email',
      tags: ['Auth'],
    })
    .input(VerifyEmailInputSchema)
    .output(ApiResponseSchema(z.void()))
    .errors({
      BAD_REQUEST: {
        status: 400,
        message: 'Invalid or expired token',
      },
    }),
};
