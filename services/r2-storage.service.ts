/**
 * Cloudflare R2 Storage Service
 * 
 * Storage service using Cloudflare R2 (S3-compatible)
 * Free tier: 10 GB storage + unlimited egress bandwidth
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadResult } from '@/types';
import { STORAGE_PATHS } from '@/lib/constants';
import { sanitizeFilename } from '@/lib/utils';

// Check if R2 is configured
const isR2Configured = () => {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
};

// Initialize R2 client (S3-compatible)
let r2Client: S3Client | null = null;

const getR2Client = () => {
  if (!isR2Configured()) {
    throw new Error('R2 storage not configured. Set R2_* environment variables.');
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  return r2Client;
};

/**
 * Upload a file to R2 storage
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  folder: keyof typeof STORAGE_PATHS = 'ORIGINAL_IMAGES',
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  try {
    const client = getR2Client();
    const sanitizedFilename = sanitizeFilename(filename);
    const key = `${STORAGE_PATHS[folder]}/${Date.now()}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await client.send(command);

    // Generate public URL (if R2_PUBLIC_URL is set)
    const publicUrl = process.env.R2_PUBLIC_URL 
      ? `${process.env.R2_PUBLIC_URL}/${key}`
      : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${key}`;

    return {
      url: publicUrl,
      key,
      bucket: process.env.R2_BUCKET_NAME!,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error('Failed to upload file to R2 storage');
  }
}

/**
 * Get a signed URL for temporary access (valid for specified time)
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  try {
    const client = getR2Client();

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

/**
 * Download a file from R2 storage
 */
export async function downloadFile(key: string): Promise<Buffer> {
  try {
    const client = getR2Client();

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    const response = await client.send(command);
    
    if (!response.Body) {
      throw new Error('No file content received');
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('R2 download error:', error);
    throw new Error('Failed to download file from R2');
  }
}

/**
 * Delete a file from R2 storage
 */
export async function deleteFile(key: string): Promise<void> {
  try {
    const client = getR2Client();

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    await client.send(command);
  } catch (error) {
    console.error('R2 delete error:', error);
    throw new Error('Failed to delete file from R2');
  }
}

export { isR2Configured };
