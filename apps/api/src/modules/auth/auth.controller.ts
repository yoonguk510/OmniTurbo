import { Controller } from '@nestjs/common';
import { Implement, implement, ORPCError } from '@orpc/nest';
import { contract } from '@repo/contract';
import { AuthService } from './auth.service';
import { Prisma } from '@repo/database';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  private setAuthCookies(res: any, accessToken: string, refreshToken: string) {
      res.cookie('access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/auth/',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      // Public cookie for client-side expiry check (not HttpOnly)
      res.cookie('access_token_expires_at', new Date(Date.now() + 15 * 60 * 1000).toISOString(), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000, // 15 minutes
      });
  }

  @Implement(contract.public.auth)
  auth() {
    return {
      login: implement(contract.public.auth.login).handler(async ({ input, context }) => {
        const user = await this.authService.validateUser(input.email, input.password);
        if (!user) {
          throw new ORPCError('UNAUTHORIZED', {
            message: 'Invalid email or password',
          });
        }
        const result = await this.authService.login(user);
        this.setAuthCookies(context.res, result.accessToken, result.refreshToken);
        
        return {
          status: 'success',
          data: result,
        };
      }),

      register: implement(contract.public.auth.register).handler(async ({ input }) => {
        try {
          const user = await this.authService.register(input);
          return {
            status: 'success',
            data: user,
          };
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
             if (error.code === 'P2002') { // Prisma unique constraint violation
                throw new ORPCError('CONFLICT', {
                    message: 'Email already exists',
                });
             }
          }
          throw error;
        }
      }),

      google: implement(contract.public.auth.google).handler(async ({ input, context }) => {
          const googleData = await this.authService.verifyGoogleToken(input.idToken);
          const user = await this.authService.handleGoogleLogin({
              email: googleData.email,
              sub: googleData.sub,
              name: googleData.name,
              picture: googleData.picture,
              email_verified: googleData.email_verified
          });
          
          const result = await this.authService.login(user);
          this.setAuthCookies(context.res, result.accessToken, result.refreshToken);

          return {
              status: 'success',
              data: result
          };
      }),

      forgotPassword: implement(contract.public.auth.forgotPassword).handler(async ({ input }) => {
          await this.authService.forgotPassword(input.email);
          return { status: 'success', data: undefined };
      }),

      resetPassword: implement(contract.public.auth.resetPassword).handler(async ({ input }) => {
          await this.authService.resetPassword(input.token, input.password);
          return { status: 'success', data: undefined };
      }),

      verifyEmail: implement(contract.public.auth.verifyEmail).handler(async ({ input }) => {
          await this.authService.verifyEmail(input.token);
          return { status: 'success', data: undefined };
      }),

      logout: implement(contract.public.auth.logout).handler(async ({ context }) => {
          const refreshToken = context.req.cookies['refresh_token'];
          if (refreshToken) {
              await this.authService.logout(refreshToken);
          }
          context.res.clearCookie('access_token');
          context.res.clearCookie('refresh_token', { path: '/auth/refresh' });
          context.res.clearCookie('access_token_expires_at');
          return { status: 'success', data: undefined };
      }),
      
      refresh: implement(contract.public.auth.refresh).handler(async ({ input, context }) => {
         const refreshToken = input.refreshToken ?? context.req.cookies['refresh_token'];
         
         if (!refreshToken) {
             throw new ORPCError('UNAUTHORIZED', {
                 message: 'Missing refresh token',
             });
         }

         const result = await this.authService.refresh(refreshToken);
         this.setAuthCookies(context.res, result.accessToken, result.refreshToken);
         
         return { status: 'success', data: result };
      }),
    };
  }
}
