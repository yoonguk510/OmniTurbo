import { Controller, UseGuards } from '@nestjs/common';
import { Implement, implement, ORPCError } from '@orpc/nest';
import { contract } from '@repo/contract';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Implement(contract.user.profile)
  profile() {
    return {
      me: implement(contract.user.profile.me).handler(async ({ context }) => {
        const userId = context.req?.user?.id;
        
        if (!userId) {
             throw new ORPCError('UNAUTHORIZED', { message: 'User not found in context' });
        }

        const user = await this.usersService.findById(userId);
        if (!user) {
          throw new ORPCError('NOT_FOUND', { message: 'User not found' });
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return {
          status: 'success',
          data: result,
        };
      }),

      update: implement(contract.user.profile.update).handler(async ({ input, context }) => {
        const userId = context.req?.user?.id;
        if (!userId) {
             throw new ORPCError('UNAUTHORIZED', { message: 'User not found in context' });
        }

        const user = await this.usersService.update(userId, input);
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return {
          status: 'success',
          data: result,
        };
      }),

      linkAccount: implement(contract.user.profile.linkAccount).handler(async ({ input, context }) => {
        const userId = context.req?.user?.id;
        if (!userId) {
             throw new ORPCError('UNAUTHORIZED', { message: 'User not found in context' });
        }

        await this.authService.linkAccount(userId, {
            provider: input.provider,
            idToken: input.idToken
        });

        return {
            status: 'success',
            data: undefined
        };
      }),

      updatePassword: implement(contract.user.profile.updatePassword).handler(async ({ input, context }) => {
          const userId = context.req?.user?.id;
          if (!userId) {
               throw new ORPCError('UNAUTHORIZED', { message: 'User not found in context' });
          }
          await this.authService.updatePassword(userId, input.currentPassword, input.newPassword);
          return { status: 'success', data: undefined };
      }),

      updateImage: implement(contract.user.profile.updateImage).handler(async ({ input, context }) => {
          const userId = context.req?.user?.id;
           if (!userId) {
               throw new ORPCError('UNAUTHORIZED', { message: 'User not found in context' });
          }
           await this.usersService.update(userId, { image: input.imageUrl });
           return { status: 'success', data: undefined };
      }),

      unlinkAccount: implement(contract.user.profile.unlinkAccount).handler(async ({ input, context }) => {
          const userId = context.req?.user?.id;
          if (!userId) {
               throw new ORPCError('UNAUTHORIZED', { message: 'User not found in context' });
          }
          await this.authService.unlinkAccount(userId, input.provider);
          return { status: 'success', data: undefined };
      }),

      getProviders: implement(contract.user.profile.getProviders).handler(async ({ context }) => {
          const userId = context.req?.user?.id;
           if (!userId) {
               throw new ORPCError('UNAUTHORIZED', { message: 'User not found in context' });
          }
          const accounts = await this.usersService.findUserAccounts(userId);
          return {
              status: 'success',
              data: accounts.map(acc => ({ provider: acc.provider }))
          };
      }),

      hasPassword: implement(contract.user.profile.hasPassword).handler(async ({ context }) => {
          const userId = context.req?.user?.id;
           if (!userId) {
               throw new ORPCError('UNAUTHORIZED', { message: 'User not found in context' });
          }
          const user = await this.usersService.findById(userId);
           if (!user) {
               throw new ORPCError('NOT_FOUND', { message: 'User not found' });
          }
           return {
              status: 'success',
              data: { hasPassword: !!user.password }
          };
      }),
    };
  }
}
