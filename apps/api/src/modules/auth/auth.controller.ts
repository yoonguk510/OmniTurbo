import { Controller } from '@nestjs/common';
import { Implement, implement, ORPCError } from '@orpc/nest';
import { contract } from '@repo/contract';
import { AuthService } from './auth.service';

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
        } catch (error: any) {
          if (error.code === 'P2002') { // Prisma unique constraint violation
            throw new ORPCError('CONFLICT', {
                message: 'Email already exists',
            });
          }
          throw error;
        }
      }),
    };
  }
}
