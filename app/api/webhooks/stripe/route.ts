/**
 * API Route: Stripe Webhook Handler
 * POST /api/webhooks/stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhook } from '@/lib/webhook-verification';
import { logger } from '@/lib/logger';
import { sendOrderConfirmation } from '@/services/email.service';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

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

        try {
          // Create order in database
          const email = paymentIntent.receipt_email || paymentIntent.metadata.email;
          if (!email) {
            logger.error('No email found in payment intent', { paymentIntentId: paymentIntent.id });
            break;
          }

          // Find user by email (might be null for guest checkout)
          const user = await prisma.user.findUnique({
            where: { email },
          });

          // Create order
          const order = await prisma.order.create({
            data: {
              userId: user?.id,
              email,
              packageId: paymentIntent.metadata.packageId || '1-photo',
              amount: paymentIntent.amount,
              paymentIntentId: paymentIntent.id,
              status: 'processing',
              photoCount: parseInt(paymentIntent.metadata.imageCount || '1'),
              originalFiles: [],
              restoredFiles: [],
            },
          });

          logger.info('Order created from webhook', {
            orderId: order.id,
            email,
            amount: paymentIntent.amount,
          });

          // Send confirmation email with individual parameters
          await sendOrderConfirmation(
            email,
            order.id,
            order.packageId,
            order.photoCount,
            order.amount
          );

          logger.info('Confirmation email sent', { orderId: order.id, email });
        } catch (error) {
          logger.error('Error processing payment_intent.succeeded', error as Error);
        }
        
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
