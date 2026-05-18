import { NextRequest, NextResponse } from 'next/server';
import { createEmbeddedCheckoutSession } from '@/services/payment.service';
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

    const metadataStr = fileKeys ? fileKeys.join(',') : '';

    if (metadataStr.length > 500) {
      return NextResponse.json(
        { success: false, error: { code: 'METADATA_TOO_LARGE', message: 'File keys metadata is too large' } },
        { status: 400 }
      );
    }

    const session = await createEmbeddedCheckoutSession(amount, email, {
      packageId,
      imageCount: imageCount.toString(),
      ...(metadataStr ? { fileKeys: metadataStr } : {}),
      serviceType: serviceType ?? 'restoration',
    });

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    logger.error('[Payment] Checkout session creation error', error as Error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'PAYMENT_ERROR', message: 'Failed to create checkout session' } },
      { status: 500 }
    );
  }
}
