/**
 * API Route: Create Mock Order (Test Mode - Phase 2)
 * POST /api/payment/create-test-order
 * 
 * Bypasses Stripe payment and creates an approved order for testing
 * Only works when TEST_MODE=true
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '@/services/storage.service';
import { emailService } from '@/services/email.service';
import { AIProviderFactory } from '@/services/ai-provider.factory';

const requestSchema = z.object({
  email: z.string().email(),
  packageId: z.string(),
  imageFiles: z.array(z.string()), // Base64 encoded images
});

export async function POST(request: NextRequest) {
  // Check if test mode is enabled
  const testMode = process.env.TEST_MODE === 'true';
  
  if (!testMode) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TEST_MODE_DISABLED',
          message: 'Test mode is disabled. Set TEST_MODE=true to use this endpoint.',
        },
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email, packageId, imageFiles } = requestSchema.parse(body);

    console.log(`[TEST-ORDER] Creating test order for ${email}, package: ${packageId}`);
    console.log(`[TEST-ORDER] Images to process: ${imageFiles.length}`);

    const orderId = `test_${uuidv4()}`;
    const results = [];

    // Process each image
    for (let i = 0; i < imageFiles.length; i++) {
      const imageData = imageFiles[i];
      const imageId = `${orderId}_img_${i + 1}`;
      
      console.log(`[TEST-ORDER] Processing image ${i + 1}/${imageFiles.length}`);

      try {
        // Decode base64
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Save original
        const originalResult = await storageService.uploadFile(buffer, `${imageId}.jpg`, 'ORIGINAL_IMAGES', 'image/jpeg');
        console.log(`[TEST-ORDER] Original saved: ${originalResult.key}`);

        // Restore with AI
        const aiProvider = AIProviderFactory.getProvider();
        const restoredBuffer = await aiProvider.restorePhoto(buffer);
        console.log(`[TEST-ORDER] Image ${i + 1} restored successfully`);

        // Save restored
        const restoredResult = await storageService.uploadFile(restoredBuffer, `${imageId}.jpg`, 'RESTORED_IMAGES', 'image/jpeg');
        console.log(`[TEST-ORDER] Restored saved: ${restoredResult.key}`);

        results.push({
          imageId,
          originalPath: originalResult.key,
          restoredPath: restoredResult.key,
          restoredUrl: restoredResult.url,
          status: 'success',
        });

      } catch (error: any) {
        console.error(`[TEST-ORDER] Failed to process image ${i + 1}:`, error);
        results.push({
          imageId,
          status: 'failed',
          error: error.message,
        });
      }
    }

    // Send email with results
    const successfulRestores = results.filter(r => r.status === 'success');
    
    if (successfulRestores.length > 0) {
      console.log(`[TEST-ORDER] Sending email to ${email} with ${successfulRestores.length} restored photos`);
      
      try {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await emailService.sendRestorationComplete({
          customerEmail: email,
          jobId: orderId,
          downloadLinks: successfulRestores.map(r => r.restoredUrl!),
          expiresAt,
        });
        console.log(`[TEST-ORDER] Email sent successfully`);
      } catch (emailError: any) {
        console.error(`[TEST-ORDER] Failed to send email:`, emailError);
      }
    }

    // Return results
    return NextResponse.json({
      success: true,
      testMode: true,
      orderId,
      email,
      packageId,
      processedImages: imageFiles.length,
      successfulRestores: successfulRestores.length,
      failedRestores: results.filter(r => r.status === 'failed').length,
      results,
      message: `Test order completed. ${successfulRestores.length}/${imageFiles.length} photos restored successfully.`,
    });

  } catch (error: any) {
    console.error('[TEST-ORDER] Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for documentation
 */
export async function GET() {
  const testMode = process.env.TEST_MODE === 'true';
  
  return NextResponse.json({
    endpoint: '/api/payment/create-test-order',
    testMode,
    status: testMode ? 'enabled' : 'disabled',
    description: 'Create test order without payment (Phase 2 testing)',
    usage: {
      method: 'POST',
      body: {
        email: 'string (customer email)',
        packageId: 'string (1-photo, 3-photos, 5-photos, 10-photos)',
        imageFiles: 'array of base64 encoded images',
      },
    },
    note: testMode 
      ? 'Test mode is ENABLED. This endpoint will process orders without payment.'
      : 'Test mode is DISABLED. Set TEST_MODE=true in .env to enable.',
  });
}
