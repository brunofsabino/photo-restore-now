/**
 * API Route: Stripe Webhook Handler
 * POST /api/webhooks/stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhook } from '@/lib/webhook-verification';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const verification = await verifyStripeWebhook(request);
    
    if (!verification.valid) {
      logger.security('Stripe webhook verification failed', {
        error: verification.error,
        ip: request.ip || 'unknown',
      });
      
      return NextResponse.json(
        { error: 'Webhook verification failed' },
        { status: 401 }
      );
    }

    const event = verification.event;

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        logger.info('Payment succeeded', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          email: paymentIntent.receipt_email,
        });

        // TODO: Trigger job processing
        // This is where you'd create a restoration job
        // Example:
        // await createJob(
        //   paymentIntent.receipt_email!,
        //   paymentIntent.metadata.packageId,
        //   images, // You'd need to retrieve these
        //   paymentIntent.id,
        //   paymentIntent.amount
        // );
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        logger.warn('Payment failed', {
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message,
        });
        
        // Handle failed payment
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout completed:', session.id);
        // Handle completed checkout
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
