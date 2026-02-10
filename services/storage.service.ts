/**
 * Storage Service
 * 
 * Automatically uses R2 in production or local storage in development
 * Checks for R2 configuration and falls back to local if not available
 */

import fs from 'fs';
import path from 'path';
import { UploadResult } from '@/types';
import { STORAGE_PATHS } from '@/lib/constants';
import { sanitizeFilename } from '@/lib/utils';
import * as R2Storage from './r2-storage.service';

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
 * Upload a file - automatically uses R2 if configured, otherwise local storage
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  folder: keyof typeof STORAGE_PATHS = 'ORIGINAL_IMAGES',
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  // Check if R2 is configured
  const isR2Available = process.env.R2_ACCOUNT_ID && 
                         process.env.R2_ACCESS_KEY_ID && 
                         process.env.R2_BUCKET_NAME;

  // Use R2 in production, or in development if USE_R2=true
  const useR2 = isR2Available && (process.env.NODE_ENV === 'production' || process.env.USE_R2 === 'true');
  
  if (useR2) {
    console.log('[STORAGE] Using R2 cloud storage');
    return R2Storage.uploadFile(buffer, filename, folder, contentType);
  }

  // Local storage fallback (development)
  try {
    // Generate short unique ID (8 chars) instead of timestamp + long filename
    const randomId = Math.random().toString(36).substring(2, 10);
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const shortKey = `${STORAGE_PATHS[folder]}/${randomId}.${ext}`;
    const filePath = path.join(STORAGE_DIR, shortKey);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, buffer);

    // Generate URL using the API route
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/files/${shortKey}`;

    return {
      url,
      key: shortKey,
      bucket: 'local',
    };
  } catch (error) {
    console.error('Storage upload error:', error);
    throw new Error('Failed to upload file to storage');
  }
}

/**
 * Get a signed URL for temporary access
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  // Check if R2 is configured
  const isR2Available = process.env.R2_ACCOUNT_ID && 
                         process.env.R2_ACCESS_KEY_ID && 
                         process.env.R2_BUCKET_NAME;

  // Use R2 in production, or in development if USE_R2=true
  const useR2 = isR2Available && (process.env.NODE_ENV === 'production' || process.env.USE_R2 === 'true');
  
  if (useR2) {
    return R2Storage.getSignedDownloadUrl(key, expiresIn);
  }

  // Local storage fallback
  try {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/files/${key}`;
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
  // Check if R2 is configured
  const isR2Available = process.env.R2_ACCOUNT_ID && 
                         process.env.R2_ACCESS_KEY_ID && 
                         process.env.R2_BUCKET_NAME;

  // Use R2 in production, or in development if USE_R2=true
  const useR2 = isR2Available && (process.env.NODE_ENV === 'production' || process.env.USE_R2 === 'true');
  
  if (useR2) {
    return R2Storage.downloadFile(key);
  }

  // Local storage fallback
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

/**
 * Storage service object for convenient imports
 */
export const storageService = {
  uploadFile,
  getSignedDownloadUrl,
  downloadFile,
  deleteFile,
  deleteFiles,
  uploadOriginalImage,
  uploadRestoredImage,
};
