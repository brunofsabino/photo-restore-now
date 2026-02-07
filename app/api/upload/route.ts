/**
 * API Route: Upload Images
 * POST /api/upload
 * 
 * Uploads images to storage before payment
 * Returns URLs that will be stored in payment intent metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/services/storage.service';
import { validateImageFile, sanitizeFileName } from '@/lib/file-validation';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    logger.info('Uploading files', { count: files.length });

    const uploadedFiles = [];

    for (const file of files) {
      // Validate file
      const validation = await validateImageFile(file);
      
      if (!validation.valid) {
        return NextResponse.json(
          { error: `Invalid file ${file.name}: ${validation.error}` },
          { status: 400 }
        );
      }

      // Convert to buffer and upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Sanitize filename
      const sanitizedName = sanitizeFileName(file.name);

      const result = await uploadFile(
        buffer,
        sanitizedName,
        'ORIGINAL_IMAGES',
        file.type
      );

      uploadedFiles.push({
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        url: result.url,
        key: result.key,
      });

      logger.info('File uploaded', { 
        fileName: file.name, 
        url: result.url 
      });
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    logger.error('Upload error', error as Error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
