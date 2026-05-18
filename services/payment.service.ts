/**
 * Stripe Payment Service
 * 
 * Handles all payment operations including:
 * - Payment intent creation
 * - PayPal integration via Stripe
 * - Webhook handling
 */

import Stripe from 'stripe';
import { PaymentIntent } from '@/types';
import { logger } from '@/lib/logger';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * Create a payment intent for credit card or PayPal
 */
export async function createPaymentIntent(
  amount: number,
  email: string,
  metadata: Record<string, string> = {}
): Promise<PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always',
      },
      receipt_email: email,
      metadata: {
        ...metadata,
        email,
      },
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
      clientSecret: paymentIntent.client_secret || '',
    };
  } catch (error) {
    logger.error('[Payment] Stripe intent creation error', error as Error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    logger.error('[Payment] Error retrieving intent', error as Error, { paymentIntentId });
    return null;
  }
}

/**
 * Confirm payment intent status
 */
export async function confirmPaymentStatus(
  paymentIntentId: string
): Promise<'succeeded' | 'pending' | 'failed'> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      return 'succeeded';
    } else if (
      paymentIntent.status === 'canceled'
    ) {
      return 'failed';
    } else {
      return 'pending';
    }
  } catch (error) {
    logger.error('[Payment] Error confirming status', error as Error, { paymentIntentId });
    return 'failed';
  }
}

/**
 * Create an embedded checkout session with Adaptive Pricing (BRL → USD auto-conversion)
 */
export async function createEmbeddedCheckoutSession(
  usdCentsAmount: number,
  email: string,
  metadata: Record<string, string> = {}
): Promise<{ clientSecret: string }> {
  const rate = parseFloat(process.env.USD_TO_BRL_RATE || '5.80');
  const brlAmount = Math.round(usdCentsAmount * rate);
  const imageCount = metadata.imageCount || '1';
  const serviceType = metadata.serviceType || 'restoration';
  const count = parseInt(imageCount);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    ui_mode: 'embedded',
    currency: 'brl',
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Photo Restoration — PhotoRestoreNow',
            description: `${count} photo${count > 1 ? 's' : ''} · ${serviceType}`,
          },
          unit_amount: brlAmount,
        },
        quantity: 1,
      },
    ],
    customer_email: email,
    metadata: {
      ...metadata,
      email,
      usdAmount: usdCentsAmount.toString(),
    },
    return_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
  };

  // adaptive_pricing may not be in older SDK types — cast to any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (sessionParams as any).adaptive_pricing = { enabled: true };

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.client_secret) {
      throw new Error('No client secret returned from Stripe');
    }

    return { clientSecret: session.client_secret };
  } catch (error) {
    logger.error('[Payment] Embedded checkout session creation error', error as Error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    logger.error('[Payment] Webhook verification failed', error as Error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Handle successful payment
 */
export async function handleSuccessfulPayment(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  // This would typically update database, trigger job processing, etc.
  logger.info('[Payment] Payment succeeded', {
    paymentIntentId: paymentIntent.id,
    metadata: paymentIntent.metadata,
  });
}

/**
 * Refund a payment
 */
export async function refundPayment(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<boolean> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason,
    });

    return refund.status === 'succeeded';
  } catch (error) {
    logger.error('[Payment] Refund error', error as Error, { paymentIntentId });
    return false;
  }
}

export { stripe };
