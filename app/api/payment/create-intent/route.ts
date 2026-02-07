/**
 * API Route: Create Payment Intent
 * POST /api/payment/create-intent
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/services/payment.service';
import { z } from 'zod';

const requestSchema = z.object({
  amount: z.number().positive(),
  email: z.string().email(),
  packageId: z.string(),
  imageCount: z.number().positive(),
  fileKeys: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, email, packageId, imageCount, fileKeys } = requestSchema.parse(body);

    // Log metadata size for debugging
    const metadataStr = fileKeys ? fileKeys.join(',') : '';
    console.log('[DEBUG] fileKeys metadata length:', metadataStr.length, '(limit: 500)');
    console.log('[DEBUG] fileKeys count:', fileKeys?.length || 0);
    console.log('[DEBUG] fileKeys sample:', metadataStr.substring(0, 100));
    
    if (metadataStr.length > 500) {
      console.error('[ERROR] Metadata exceeds 500 chars:', metadataStr.length);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'METADATA_TOO_LARGE',
            message: `File keys metadata is too large (${metadataStr.length} chars, limit 500)`,
          },
        },
        { status: 400 }
      );
    }

    const paymentIntent = await createPaymentIntent(amount, email, {
      packageId,
      imageCount: imageCount.toString(),
      fileKeys: metadataStr || undefined,
    });

    return NextResponse.json({
      success: true,
      data: paymentIntent,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PAYMENT_ERROR',
          message: 'Failed to create payment intent',
        },
      },
      { status: 500 }
    );
  }
}
