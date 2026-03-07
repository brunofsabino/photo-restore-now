/**
 * API Route: Stripe Webhook Handler
 * POST /api/webhooks/stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhook } from '@/lib/webhook-verification';
import { logger } from '@/lib/logger';
import { Analytics } from '@/lib/analytics';
import { ErrorTracker } from '@/lib/error-tracking';
import { sendOrderConfirmation } from '@/services/email.service';
import { inngest } from '@/lib/inngest';
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

          // Track payment success
          Analytics.paymentSucceeded(
            email,
            paymentIntent.amount,
            order.packageId,
            paymentIntent.id
          );

          // Send confirmation email with individual parameters
          await sendOrderConfirmation(
            email,
            order.id,
            order.packageId,
            order.photoCount,
            order.amount
          );

          logger.info('Confirmation email sent', { orderId: order.id, email });

          // Trigger background job processing via Inngest if fileKeys are present
          if (paymentIntent.metadata.fileKeys) {
            try {
              const fileKeys = paymentIntent.metadata.fileKeys.split(',');
              const packageId = paymentIntent.metadata.packageId || '1-photo';
              const serviceType = paymentIntent.metadata.serviceType || 'restoration';
              
              logger.info('Queuing restoration job via Inngest', {
                orderId: order.id,
                fileCount: fileKeys.length,
                packageId,
                serviceType,
              });

              // Create job record first
              const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
              
              const job = await prisma.job.create({
                data: {
                  id: jobId,
                  orderId: order.id,
                  userId: user?.id,
                  email,
                  packageId,
                  serviceType,
                  status: 'pending',
                  paymentIntentId: paymentIntent.id,
                  totalAmount: paymentIntent.amount,
                  images: {
                    create: fileKeys.map((key, index) => ({
                      originalName: `image_${index + 1}.jpg`,
                      size: 0, // Will be updated during processing
                      mimeType: 'image/jpeg',
                      originalUrl: '', // Will be updated by Inngest
                    })),
                  },
                },
              });

              // Send event to Inngest for background processing
              await inngest.send({
                name: 'photo/restoration.requested',
                data: {
                  jobId: job.id,
                  orderId: order.id,
                  email,
                  fileKeys,
                  packageId,
                  serviceType,
                },
              });

              logger.info('Restoration job queued successfully', {
                orderId: order.id,
                jobId: job.id,
              });
            } catch (jobError) {
              logger.error('Error queuing job via Inngest', {
                orderId: order.id,
                error: jobError instanceof Error ? jobError.message : String(jobError),
                stack: jobError instanceof Error ? jobError.stack : undefined,
              });
              // Don't fail the webhook - order was created successfully
            }
          } else {
            logger.warn('No fileKeys in payment intent metadata', {
              orderId: order.id,
              metadata: paymentIntent.metadata,
            });
          }
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
    await ErrorTracker.payment(error as Error, 'webhook', 'unknown');
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
