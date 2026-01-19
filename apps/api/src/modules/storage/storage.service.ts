import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService implements OnModuleInit {
  private s3Client!: S3Client;
  private bucketName!: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.bucketName = this.configService.getOrThrow<string>('AWS_BUCKET_NAME');
    
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'auto',
      endpoint: this.configService.get<string>('AWS_ENDPOINT'), // Critical for R2
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true, // Needed for some custom endpoints
    });
  }

  /**
   * Generates a presigned URL for uploading a file directly to S3/R2.
   * @param key The destination path in the bucket (e.g., 'avatars/123.jpg')
   * @param contentType The MIME type of the file (e.g., 'image/jpeg')
   * @param expiresInSeconds Duration until the URL expires (default: 3600)
   */
   async getPresignedUploadUrl(key: string, contentType: string, size: number, expiresInSeconds = 3600): Promise<{ url: string; key: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ContentLength: size, 
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    
    return { url, key };
  }
}
