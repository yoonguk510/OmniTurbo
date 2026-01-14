import { Controller } from '@nestjs/common';
import { Implement, implement, ORPCError } from '@orpc/nest';
import { contract } from '@repo/contract';
import { AuthService } from './auth.service';
import { Prisma } from '@repo/database';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Implement(contract.public.auth)
  auth() {
    return {
      login: implement(contract.public.auth.login).handler(async ({ input }) => {
        const user = await this.authService.validateUser(input.email, input.password);
        if (!user) {
          throw new ORPCError('UNAUTHORIZED', {
            message: 'Invalid email or password',
          });
        }
        return {
          status: 'success',
          data: await this.authService.login(user),
        };
      }),

      register: implement(contract.public.auth.register).handler(async ({ input }) => {
        try {
          const user = await this.authService.register(input);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...result } = user;
          return {
            status: 'success',
            data: result,
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

      google: implement(contract.public.auth.google).handler(async ({ input }) => {
          const googleData = await this.authService.verifyGoogleToken(input.idToken);
          const user = await this.authService.findOrCreateGoogleUser({
              email: googleData.email,
              sub: googleData.sub,
              name: googleData.name,
              picture: googleData.picture
          });
          
          return {
              status: 'success',
              data: await this.authService.login(user)
          };
      }),

      forgotPassword: implement(contract.public.auth.forgotPassword).handler(async ({ input }) => {
          await this.authService.forgotPassword(input.email);
          return { status: 'success', data: undefined };
      }),

      resetPassword: implement(contract.public.auth.resetPassword).handler(async () => {
          // Implement reset password logic
          return { status: 'success', data: undefined };
      }),

      verifyEmail: implement(contract.public.auth.verifyEmail).handler(async ({ input }) => {
          await this.authService.verifyEmail(input.token);
          return { status: 'success', data: undefined };
      }),

      logout: implement(contract.public.auth.logout).handler(async () => {
          return { status: 'success', data: undefined };
      }),
      
      refresh: implement(contract.public.auth.refresh).handler(async ({ input }) => {
         const result = await this.authService.refresh(input.refreshToken);
         return { status: 'success', data: result };
      }),
    };
  }
}
