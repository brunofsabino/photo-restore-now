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

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
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
    console.error('Stripe payment intent creation error:', error);
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
    console.error('Error retrieving payment intent:', error);
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
      paymentIntent.status === 'canceled' ||
      paymentIntent.status === 'payment_failed'
    ) {
      return 'failed';
    } else {
      return 'pending';
    }
  } catch (error) {
    console.error('Error confirming payment status:', error);
    return 'failed';
  }
}

/**
 * Create a checkout session (alternative approach)
 */
export async function createCheckoutSession(
  amount: number,
  email: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
): Promise<{ sessionId: string; url: string }> {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Photo Restoration Service',
              description: 'AI-powered photo restoration',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata,
    });

    return {
      sessionId: session.id,
      url: session.url || '',
    };
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
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
    console.error('Webhook signature verification failed:', error);
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
  console.log('Payment succeeded:', paymentIntent.id);
  console.log('Metadata:', paymentIntent.metadata);
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
    console.error('Refund error:', error);
    return false;
  }
}

export { stripe };
