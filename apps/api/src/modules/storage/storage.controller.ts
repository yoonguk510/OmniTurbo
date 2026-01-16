import { Controller } from '@nestjs/common';
import { Implement, implement, ORPCError } from '@orpc/nest';
import { contract } from '@repo/contract';
import { StorageService } from './storage.service';

@Controller()
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Implement(contract.public.storage)
  storage() {
    return {
      getUploadUrl: implement(contract.public.storage.getUploadUrl).handler(async ({ input }) => {
           // 1. Strict Content-Type Validation
           const allowedTypes = ['image/apng', 'image/avif', 'image/jpeg', 'image/png', 'image/webp'];
           if (!allowedTypes.includes(input.contentType)) {
               throw new ORPCError('BAD_REQUEST', {
                   message: 'Only images (apng, avif, jpeg, png, webp) are allowed',
               });
           }

           // 2. Max Size Validation (1MB)
           const MAX_SIZE = 1 * 1024 * 1024; // 1MB
           if (input.size > MAX_SIZE) {
               throw new ORPCError('BAD_REQUEST', {
                   message: 'File size must be less than 1MB',
               });
           }

           const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}-${input.filename}`;
           const { url, key: finalKey } = await this.storageService.getPresignedUploadUrl(key, input.contentType, input.size);
           
           return {
               status: 'success',
               data: {
                   url,
                   key: finalKey
               }
           }
      }),
    };
  }
}
