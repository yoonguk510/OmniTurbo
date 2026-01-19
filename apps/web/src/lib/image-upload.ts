import imageCompression from 'browser-image-compression';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { orpc } from './orpc';

export interface UseImageUploadOptions {
    onSuccess?: (url: string) => void;
    onError?: (error: Error) => void;
}

export function useImageUpload(options?: UseImageUploadOptions) {
    const [isPending, setIsPending] = useState(false);
    const { mutateAsync: getUploadUrl } = useMutation(orpc.public.storage.getUploadUrl.mutationOptions());

    const upload = async (file: File) => {
        setIsPending(true);
        try {
            console.log(`Original File Size: ${file.size / 1024 / 1024} MB`);

            const compressionOptions = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: "image/jpeg" 
            }
            
            // Only compress if image
            let uploadFile = file;
            if (file.type.startsWith('image/')) {
                 try {
                    uploadFile = await imageCompression(file, compressionOptions);
                    console.log(`Compressed File Size: ${uploadFile.size / 1024 / 1024} MB`);
                 } catch (e) {
                    console.warn("Compression failed, using original file", e);
                 }
            }

            // 1. Get Presigned URL
            const result = await getUploadUrl({
                filename: file.name,
                contentType: uploadFile.type,
                size: uploadFile.size
            });
            
            const { url, key } = result.data;

            if (!url) {
                throw new Error("Failed to get upload URL");
            }

            // 2. Upload to R2/S3
            const uploadRes = await fetch(url, {
                method: 'PUT',
                body: uploadFile,
                headers: {
                    'Content-Type': uploadFile.type
                }
            });

            if (!uploadRes.ok) {
                throw new Error('Upload failed');
            }

            // 3. Construct Public URL
            const pubUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
            if (!pubUrl) {
                throw new Error("R2 public URL not found in environment");
            }
            
            const publicUrl = `${pubUrl}/${key}`;
            
            if (options?.onSuccess) {
                options.onSuccess(publicUrl);
            }
            return publicUrl;

        } catch (error: any) {
            console.error("Upload error:", error);
            if (options?.onError) {
                options.onError(error);
            } else {
                throw error;
            }
        } finally {
            setIsPending(false);
        }
    };

    return { upload, isPending };
}
