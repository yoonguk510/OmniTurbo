import { Module } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { onError, ORPCModule } from '@orpc/nest';
import { Request } from 'express';
import { SmartCoercionPlugin } from '@orpc/json-schema'
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ORPCModule.forRootAsync({
      useFactory: (request: Request) => ({
        context: { request },
        plugins: [
            new SmartCoercionPlugin(),
        ],
        interceptors: [
          onError((error) => {
            console.error('ORPC Error:', error);
          }),
        ],
      }),
      inject: [REQUEST],
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
