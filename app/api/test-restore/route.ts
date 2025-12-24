import { NextRequest, NextResponse } from 'next/server';
import { AIProviderFactory } from '@/services/ai-provider.factory';
import { storageService } from '@/services/storage.service';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Test endpoint for AI restoration - Phase 1 Testing
 * Upload an image and test restoration without payment flow
 * 
 * Usage:
 * POST /api/test-restore
 * Content-Type: multipart/form-data
 * Body: { image: File, provider?: 'vanceai' | 'hotpot' }
 * 
 * Returns: { success, originalUrl, restoredUrl, provider, processingTime }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const provider = (formData.get('provider') as string) || 'vanceai';

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate provider
    if (provider !== 'vanceai' && provider !== 'hotpot') {
      return NextResponse.json(
        { error: 'Invalid provider. Use "vanceai" or "hotpot"' },
        { status: 400 }
      );
    }

    console.log(`[TEST-RESTORE] Starting test with ${provider} provider`);
    console.log(`[TEST-RESTORE] Image: ${image.name}, Size: ${image.size} bytes`);

    const startTime = Date.now();
    const testId = uuidv4();

    // Convert File to Buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save original image
    const originalPath = `test/${testId}-original-${image.name}`;
    await storageService.uploadFile(originalPath, buffer, image.type);
    console.log(`[TEST-RESTORE] Original image saved to: ${originalPath}`);

    // Get AI provider and restore
    console.log(`[TEST-RESTORE] Initializing ${provider} provider...`);
    const aiProvider = AIProviderFactory.getProvider(provider);
    
    console.log(`[TEST-RESTORE] Starting restoration...`);
    const restoredBuffer = await aiProvider.restorePhoto(buffer);
    
    console.log(`[TEST-RESTORE] Restoration complete. Size: ${restoredBuffer.length} bytes`);

    // Save restored image
    const restoredPath = `test/${testId}-restored-${image.name}`;
    await storageService.uploadFile(restoredPath, restoredBuffer, 'image/jpeg');
    console.log(`[TEST-RESTORE] Restored image saved to: ${restoredPath}`);

    const processingTime = Date.now() - startTime;

    // Get download URLs
    const originalUrl = await storageService.getSignedDownloadUrl(originalPath);
    const restoredUrl = await storageService.getSignedDownloadUrl(restoredPath);

    return NextResponse.json({
      success: true,
      testId,
      provider,
      originalImage: {
        path: originalPath,
        url: originalUrl,
        size: buffer.length,
        filename: image.name,
      },
      restoredImage: {
        path: restoredPath,
        url: restoredUrl,
        size: restoredBuffer.length,
      },
      processingTime: `${(processingTime / 1000).toFixed(2)}s`,
      message: 'Test restoration completed successfully',
    });

  } catch (error: any) {
    console.error('[TEST-RESTORE] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Restoration failed',
        message: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Get information about test endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/test-restore',
    method: 'POST',
    description: 'Test AI photo restoration without payment flow',
    usage: {
      contentType: 'multipart/form-data',
      fields: {
        image: 'File (required) - Image to restore',
        provider: 'string (optional) - "vanceai" or "hotpot" (default: vanceai)',
      },
    },
    example: {
      curl: `curl -X POST http://localhost:3000/api/test-restore \\
  -F "image=@/path/to/photo.jpg" \\
  -F "provider=vanceai"`,
    },
    response: {
      success: true,
      testId: 'uuid',
      provider: 'vanceai',
      originalImage: {
        path: 'string',
        url: 'string',
        size: 'number',
        filename: 'string',
      },
      restoredImage: {
        path: 'string',
        url: 'string',
        size: 'number',
      },
      processingTime: 'string (seconds)',
    },
  });
}
