import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

/**
 * Verify Stripe Webhook Signature
 * Ensures webhooks are actually from Stripe
 */
export async function verifyStripeWebhook(
  request: NextRequest
): Promise<{ valid: boolean; event?: any; error?: string }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    logger.error('Stripe webhook secret not configured');
    return { valid: false, error: 'Webhook secret not configured' };
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      logger.security('Stripe webhook received without signature');
      return { valid: false, error: 'No signature provided' };
    }

    // Parse signature header
    const elements = signature.split(',');
    const sigData: Record<string, string> = {};
    
    elements.forEach(element => {
      const [key, value] = element.split('=');
      sigData[key] = value;
    });
    
    const timestamp = sigData.t;
    const signatures = [sigData.v1];
    
    if (!timestamp || !signatures[0]) {
      logger.security('Invalid Stripe signature format');
      return { valid: false, error: 'Invalid signature format' };
    }

    // Check timestamp (prevent replay attacks)
    const timestampNum = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const tolerance = 300; // 5 minutes
    
    if (Math.abs(currentTime - timestampNum) > tolerance) {
      logger.security('Stripe webhook timestamp outside tolerance', {
        timestamp: timestampNum,
        currentTime,
        diff: Math.abs(currentTime - timestampNum),
      });
      return { valid: false, error: 'Timestamp outside tolerance' };
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    // Compare signatures (constant-time comparison to prevent timing attacks)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signatures[0])
    );

    if (!isValid) {
      logger.security('Stripe webhook signature verification failed');
      return { valid: false, error: 'Invalid signature' };
    }

    // Parse event
    const event = JSON.parse(body);
    
    logger.info('Stripe webhook verified successfully', {
      type: event.type,
      id: event.id,
    });

    return { valid: true, event };
  } catch (error) {
    logger.error('Error verifying Stripe webhook', error as Error);
    return { valid: false, error: 'Verification error' };
  }
}

/**
 * Generic HMAC webhook verification
 * Can be used for other webhook providers
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha1' = 'sha256'
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  } catch (error) {
    logger.error('Error verifying webhook signature', error as Error);
    return false;
  }
}
