import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';
import { contract } from '@repo/contract';
import { StorageService } from './storage.service';

@Controller()
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Implement(contract.public.storage)
  storage() {
    return {
      getUploadUrl: implement(contract.public.storage.getUploadUrl).handler(async ({ input }) => {
           const key = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}-${input.filename}`;
           const { url, key: finalKey } = await this.storageService.getPresignedUploadUrl(key, input.contentType);
           
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
