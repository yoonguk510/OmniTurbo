import { oc } from '@orpc/contract';
import { z } from 'zod';
import { ApiResponseSchema } from '../schema/common.schema.js';
import {
  LoginInputSchema,
  RegisterInputSchema,
  SSOInputSchema,
  ForgotPasswordInputSchema,
  ResetPasswordInputSchema,
  VerifyEmailInputSchema,
  RefreshTokenInputSchema,
  AuthResponseSchema,
  UserResponseSchema,
} from '../schema/auth.schema.js';

// ============================================
// Contract
// ============================================

export const authContract = {
  login: oc
    .route({
      method: 'POST',
      path: '/auth/login',
      summary: 'User Login',
      tags: ['Auth'],
    })
    .input(LoginInputSchema)
    .output(ApiResponseSchema(AuthResponseSchema))
    .errors({
      UNAUTHORIZED: {
        status: 401,
        message: 'Invalid email or password',
      },
      FORBIDDEN: {
        status: 403,
        message: 'Email not verified',
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
    .input(z.void().or(z.object({})))
    .output(ApiResponseSchema(z.void())),

  refresh: oc
    .route({
      method: 'POST',
      path: '/auth/refresh',
      summary: 'Refresh Access Token',
      tags: ['Auth'],
    })
    .input(RefreshTokenInputSchema)
    .output(ApiResponseSchema(AuthResponseSchema))
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
    .output(ApiResponseSchema(AuthResponseSchema)),

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
