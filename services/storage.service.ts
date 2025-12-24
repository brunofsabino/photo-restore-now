/**
 * Storage Service
 * 
 * Simplified storage for local development
 * For production, integrate with S3/R2 or use a file upload service
 */

import fs from 'fs';
import path from 'path';
import { UploadResult } from '@/types';
import { STORAGE_PATHS } from '@/lib/constants';
import { sanitizeFilename } from '@/lib/utils';

// Local storage directory (for development)
const STORAGE_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directories exist
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

Object.values(STORAGE_PATHS).forEach(folder => {
  const dir = path.join(STORAGE_DIR, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Upload a file to local storage
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  folder: keyof typeof STORAGE_PATHS = 'ORIGINAL_IMAGES',
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  try {
    const sanitizedFilename = sanitizeFilename(filename);
    const key = `${STORAGE_PATHS[folder]}/${Date.now()}-${sanitizedFilename}`;
    const filePath = path.join(STORAGE_DIR, key);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, buffer);

    // Generate local URL
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/uploads/${key}`;

    return {
      url,
      key,
      bucket: 'local',
    };
  } catch (error) {
    console.error('Storage upload error:', error);
    throw new Error('Failed to upload file to storage');
  }
}

/**
 * Get a signed URL for temporary access
 * For local storage, just return the file URL
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/uploads/${key}`;
    return url;
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

/**
 * Download a file from storage
 */
export async function downloadFile(key: string): Promise<Buffer> {
  try {
    const filePath = path.join(STORAGE_DIR, key);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    return fs.readFileSync(filePath);
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Failed to download file');
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const filePath = path.join(STORAGE_DIR, key);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Delete multiple files
 */
export async function deleteFiles(keys: string[]): Promise<boolean> {
  try {
    await Promise.all(keys.map(key => deleteFile(key)));
    return true;
  } catch (error) {
    console.error('Bulk delete error:', error);
    return false;
  }
}

/**
 * Upload original image
 */
export async function uploadOriginalImage(
  buffer: Buffer,
  filename: string
): Promise<UploadResult> {
  return uploadFile(buffer, filename, 'ORIGINAL_IMAGES');
}

/**
 * Upload restored image
 */
export async function uploadRestoredImage(
  buffer: Buffer,
  filename: string
): Promise<UploadResult> {
  return uploadFile(buffer, filename, 'RESTORED_IMAGES');
}
