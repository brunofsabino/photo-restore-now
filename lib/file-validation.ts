import { NextResponse } from 'next/server';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 20;

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileType(file: File): ValidationResult {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: JPG, PNG, WEBP`
    };
  }
  return { valid: true };
}

export function validateFileSize(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 10MB`
    };
  }
  return { valid: true };
}

export function validateFileName(fileName: string): ValidationResult {
  // Prevent path traversal attacks
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return {
      valid: false,
      error: 'Invalid file name'
    };
  }
  
  // Check for dangerous extensions
  const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.php', '.js', '.html'];
  if (dangerousExtensions.some(ext => fileName.toLowerCase().endsWith(ext))) {
    return {
      valid: false,
      error: 'File type not allowed'
    };
  }
  
  return { valid: true };
}

export function sanitizeFileName(fileName: string): string {
  // Remove special characters and spaces
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255); // Limit length
}

export async function validateImageFile(file: File): Promise<ValidationResult> {
  // Validate type
  const typeCheck = validateFileType(file);
  if (!typeCheck.valid) return typeCheck;
  
  // Validate size
  const sizeCheck = validateFileSize(file);
  if (!sizeCheck.valid) return sizeCheck;
  
  // Validate file name
  const nameCheck = validateFileName(file.name);
  if (!nameCheck.valid) return nameCheck;
  
  // Additional check: verify file signature (magic numbers)
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer).slice(0, 4);
    
    // Check magic numbers for common image formats
    const signatures = {
      jpeg: [0xFF, 0xD8, 0xFF],
      png: [0x89, 0x50, 0x4E, 0x47],
      webp: [0x52, 0x49, 0x46, 0x46],
    };
    
    const isValidImage = 
      // JPEG
      (bytes[0] === signatures.jpeg[0] && bytes[1] === signatures.jpeg[1] && bytes[2] === signatures.jpeg[2]) ||
      // PNG
      (bytes[0] === signatures.png[0] && bytes[1] === signatures.png[1] && bytes[2] === signatures.png[2] && bytes[3] === signatures.png[3]) ||
      // WebP (checks RIFF)
      (bytes[0] === signatures.webp[0] && bytes[1] === signatures.webp[1] && bytes[2] === signatures.webp[2] && bytes[3] === signatures.webp[3]);
    
    if (!isValidImage) {
      return {
        valid: false,
        error: 'File content does not match file extension'
      };
    }
  } catch (e) {
    return {
      valid: false,
      error: 'Failed to validate file content'
    };
  }
  
  return { valid: true };
}

export function validateBatchUpload(files: File[]): ValidationResult {
  if (files.length === 0) {
    return {
      valid: false,
      error: 'No files provided'
    };
  }
  
  if (files.length > MAX_FILES) {
    return {
      valid: false,
      error: `Too many files. Maximum: ${MAX_FILES}`
    };
  }
  
  return { valid: true };
}
