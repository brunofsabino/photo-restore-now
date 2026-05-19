/**
 * TEST ENDPOINT - Process Payment Manually
 * POST /api/test-process-payment
 * 
 * Use this in development to manually process payments
 * bypassing Stripe webhook signature verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { inngest } from '@/lib/inngest';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'paymentIntentId is required' },
        { status: 400 }
      );
    }

    logger.info('[TEST] Fetching payment intent', { paymentIntentId });

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { 
          error: 'Payment not succeeded', 
          status: paymentIntent.status 
        },
        { status: 400 }
      );
    }

    logger.info('[TEST] Processing payment', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      email: paymentIntent.receipt_email,
    });

    // Create order in database
    const email = paymentIntent.receipt_email || paymentIntent.metadata.email;
    const fileKeys = paymentIntent.metadata.fileKeys?.split(',') || [];
    const packageId = paymentIntent.metadata.packageId || '1-photo';
    const imageCount = parseInt(paymentIntent.metadata.imageCount || '0', 10);

    if (!email || fileKeys.length === 0) {
      logger.error('[TEST] Missing required metadata', new Error('Invalid metadata'), {
        metadata: paymentIntent.metadata,
      });
      return NextResponse.json(
        { error: 'Invalid payment metadata' },
        { status: 400 }
      );
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
        packageId,
        amount: paymentIntent.amount,
        paymentIntentId: paymentIntent.id,
        status: 'processing',
        photoCount: imageCount,
        originalFiles: [],
        restoredFiles: [],
      },
    });

    logger.info('[TEST] Order created', {
      orderId: order.id,
      email,
      amount: paymentIntent.amount,
    });

    // Create job record
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const serviceType = paymentIntent.metadata.serviceType || 'restoration';
    
    const job = await prisma.job.create({
      data: {
        id: jobId,
        orderId: order.id,
        userId: user?.id,
        email,
        packageId,
        serviceType,
        status: 'paid',
        paymentIntentId: paymentIntent.id,
        totalAmount: paymentIntent.amount,
        images: {
          create: fileKeys.map((key: string, index: number) => {
            const originalUrl = key.startsWith('http') 
              ? key 
              : `https://pub-8527f95b897942739888ddf9861f2e8a.r2.dev/${key}`;
            
            return {
              originalName: `photo-${index + 1}.jpg`,
              originalUrl,
              size: 0,
              mimeType: 'image/jpeg',
            };
          }),
        },
      },
      include: {
        images: true,
      },
    });

    logger.info('[TEST] Job created', {
      jobId: job.id,
      orderId: order.id,
      imageCount: job.images.length,
    });

    // Trigger background job via Inngest
    try {
      await inngest.send({
        name: 'photo/restoration.requested',
        data: {
          jobId: job.id,
          orderId: order.id,
          email,
          fileKeys: job.images.map(img => img.originalUrl || ''),
          packageId,
          serviceType,
        },
      });
      
      logger.info('[TEST] Inngest job triggered', {
        orderId: order.id,
        jobId: job.id,
      });
    } catch (inngestError) {
      // Inngest not available in dev - process directly
      logger.info('[TEST] Processing directly without Inngest');
      
      // Import AI provider and process
      const { AIProviderFactory } = await import('@/services/ai-provider.factory');
      const { uploadFile } = await import('@/services/storage.service');
      
      let successCount = 0;
      let failCount = 0;
      
      // Process each image
      for (const image of job.images) {
        try {
          if (!image.originalUrl) {
            logger.error('[TEST] No original URL', undefined, { imageId: image.id });
            failCount++;
            continue;
          }
          
          // Restore with AI — pass original URL directly
          const provider = AIProviderFactory.getProvider(undefined, serviceType as any);
          const restoredBuffer = await provider.restorePhoto(image.originalUrl);
          
          // Upload restored
          const restoredResult = await uploadFile(
            restoredBuffer,
            `restored-${image.id}.jpg`,
            'RESTORED_IMAGES'
          );
          
          // Update image
          await prisma.jobImage.update({
            where: { id: image.id },
            data: { restoredUrl: restoredResult.url },
          });
          
          logger.info('[TEST] Image restored', {
            imageId: image.id,
            restoredUrl: restoredResult.url,
          });
          
          successCount++;
          
        } catch (err) {
          logger.error('[TEST] Image restoration failed', err as Error, {
            imageId: image.id,
          });
          failCount++;
        }
      }
      
      // Determine final job status based on results
      const finalStatus = successCount > 0 ? 'completed' : 'failed';
      
      // Update job status
      await prisma.job.update({
        where: { id: job.id },
        data: { 
          status: finalStatus,
          completedAt: finalStatus === 'completed' ? new Date() : null,
          errorMessage: failCount > 0 ? `${failCount} of ${job.images.length} images failed to restore` : null,
        },
      });
      
      // Update order status (only completed if all images succeeded)
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: failCount === 0 ? 'completed' : 'failed',
        },
      });
      
      // Send completion email (only if restoration succeeded)
      if (successCount > 0) {
        try {
          const { sendRestorationComplete } = await import('@/services/email.service');
          const restoredUrls = job.images
            .map(img => img.restoredUrl)
            .filter(Boolean) as string[];
          
          if (restoredUrls.length > 0) {
            await sendRestorationComplete({
              customerEmail: email,
              jobId: job.id,
              downloadLinks: restoredUrls,
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            });
            logger.info('[TEST] Completion email sent', { email, orderId: order.id });
          }
        } catch (emailError) {
          logger.error('[TEST] Failed to send email', emailError as Error);
        }
      }
      
      logger.info('[TEST] Job processing completed', {
        jobId: job.id,
        finalStatus,
        successCount,
        failCount,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        jobId: job.id,
        imageCount: job.images.length,
        message: 'Payment processed and jobs triggered',
      },
    });

  } catch (error) {
    logger.error('[TEST] Payment processing failed', error as Error);
    return NextResponse.json(
      { 
        error: 'Failed to process payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
