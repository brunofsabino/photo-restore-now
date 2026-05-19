/**
 * API Route: Upload Images
 * POST /api/upload
 * 
 * Uploads images to storage before payment
 * Returns URLs that will be stored in payment intent metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { uploadFile } from '@/services/storage.service';
import { validateImageFile, sanitizeFileName } from '@/lib/file-validation';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { Analytics } from '@/lib/analytics';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

function verifyGuestToken(rawToken: string): boolean {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret || !rawToken) return false;
    const { payload, sig } = JSON.parse(
      Buffer.from(rawToken, 'base64').toString('utf8')
    );
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    if (typeof sig !== 'string' || sig.length !== expected.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return false;
    const { exp } = JSON.parse(payload);
    return typeof exp === 'number' && Date.now() < exp;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Require either a valid NextAuth session or a signed guest token
  const session = await getServerSession(authOptions);
  const guestToken = request.cookies.get('guestCheckout')?.value ?? '';
  if (!session && !verifyGuestToken(guestToken)) {
    logger.security('Upload rejected — unauthenticated request', {
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    });
    return NextResponse.json(
      { error: 'Authentication required to upload files.' },
      { status: 401 }
    );
  }

  if (!rateLimit(request)) {
    logger.security('Upload rate limit exceeded', {
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    });
    return NextResponse.json(
      { error: 'Too many upload requests. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

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

    // Get email from form data (if available)
    const email = formData.get('email') as string | null;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    // Track upload start
    if (email) {
      Analytics.uploadStarted(email, files.length, totalSize);
    }

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

      // Convert to buffer and upload at original resolution
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

    // Track upload completion
    if (email) {
      const storageType = process.env.USE_R2 === 'true' ? 'R2' : 'local';
      Analytics.uploadCompleted(email, uploadedFiles.length, storageType);
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
