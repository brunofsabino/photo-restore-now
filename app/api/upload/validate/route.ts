import { NextRequest, NextResponse } from 'next/server';
import { validateImageFile, validateBatchUpload } from '@/lib/file-validation';
import { sanitizeFileName } from '@/lib/file-validation';
import { logger } from '@/lib/logger';
import { createErrorResponse } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Secure File Upload API Route
 * POST /api/upload/validate
 * Validates files before allowing upload
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    const guestSession = request.cookies.get('guestCheckout');
    
    if (!session && !guestSession) {
      logger.security('Unauthorized file upload attempt', {
        ip: request.ip || 'unknown',
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate batch
    const batchValidation = validateBatchUpload(files);
    if (!batchValidation.valid) {
      logger.warn('Batch upload validation failed', {
        error: batchValidation.error,
        fileCount: files.length,
        userId: session?.user?.id || 'guest',
      });
      return NextResponse.json(
        { error: batchValidation.error },
        { status: 400 }
      );
    }

    // Validate each file
    const validationResults = await Promise.all(
      files.map(async (file, index) => {
        const result = await validateImageFile(file);
        return {
          index,
          fileName: file.name,
          valid: result.valid,
          error: result.error,
        };
      })
    );

    // Check if any files failed validation
    const failures = validationResults.filter(r => !r.valid);
    
    if (failures.length > 0) {
      logger.warn('File validation failed', {
        failures: failures.map(f => ({ fileName: f.fileName, error: f.error })),
        userId: session?.user?.id || 'guest',
      });
      
      return NextResponse.json(
        {
          error: 'Some files failed validation',
          failures: failures.map(f => ({
            fileName: f.fileName,
            error: f.error,
          })),
        },
        { status: 400 }
      );
    }

    // All files valid
    logger.info('Files validated successfully', {
      fileCount: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      userId: session?.user?.id || 'guest',
    });

    // Return sanitized file names
    const sanitizedFiles = files.map(file => ({
      originalName: file.name,
      sanitizedName: sanitizeFileName(file.name),
      size: file.size,
      type: file.type,
    }));

    return NextResponse.json({
      success: true,
      files: sanitizedFiles,
      message: 'Files validated successfully',
    });
  } catch (error) {
    const errorResponse = createErrorResponse(
      'File validation error',
      500,
      error as Error
    );
    
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
}
