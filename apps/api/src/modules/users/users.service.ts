import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@repo/database';
import { Prisma } from '@repo/database';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }


  async findUserAccounts(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
    });
  }
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }


}
