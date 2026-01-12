import { Module } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { onError, ORPCModule } from '@orpc/nest';
import { Request } from 'express';
import { SmartCoercionPlugin } from '@orpc/json-schema'
import { DatabaseModule } from './database/database.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    DatabaseModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
