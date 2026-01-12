import { Controller, UseGuards } from '@nestjs/common';
import { Implement, implement, ORPCError } from '@orpc/nest';
import { contract } from '@repo/contract';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Implement(contract.user.profile)
  profile() {
    return {
      me: implement(contract.user.profile.me).handler(async ({ context }) => {
        // context.request is now typed via orpc.d.ts
        const userId = context.request?.user?.id;
        
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
        const userId = context.request?.user?.id;
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
    };
  }
}
