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
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, email, packageId, imageCount } = requestSchema.parse(body);

    const paymentIntent = await createPaymentIntent(amount, email, {
      packageId,
      imageCount: imageCount.toString(),
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
