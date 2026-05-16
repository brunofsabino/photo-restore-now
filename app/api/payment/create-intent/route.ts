/**
 * API Route: Create Payment Intent
 * POST /api/payment/create-intent
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/services/payment.service';
import { Analytics } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const requestSchema = z.object({
  amount: z.number().positive(),
  email: z.string().email(),
  packageId: z.string(),
  imageCount: z.number().positive(),
  fileKeys: z.array(z.string()).optional(),
  serviceType: z.enum(['restoration', 'colorization', 'restoration-colorization', 'deep-restoration']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, email, packageId, imageCount, fileKeys, serviceType } = requestSchema.parse(body);

    // Log metadata size for debugging
    const metadataStr = fileKeys ? fileKeys.join(',') : '';
    logger.info('[Payment] Metadata size check', {
      length: metadataStr.length,
      count: fileKeys?.length || 0,
      sample: metadataStr.substring(0, 100),
    });
    
    if (metadataStr.length > 500) {
      logger.error('[Payment] Metadata exceeds limit', new Error('Metadata too large'), {
        length: metadataStr.length,
      });
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
      ...(metadataStr ? { fileKeys: metadataStr } : {}),
      serviceType: serviceType ?? 'restoration',
    });

    // Track payment intent creation
    Analytics.paymentIntentCreated(email, amount, packageId, imageCount);

    return NextResponse.json({
      success: true,
      data: paymentIntent,
    });
  } catch (error) {
    logger.error('[Payment] Intent creation error', error as Error);
    
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
