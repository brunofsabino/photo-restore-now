/**
 * Inngest Functions
 * Background job processors with automatic retries
 */

import { inngest } from '@/lib/inngest';
import { PrismaClient } from '@prisma/client';
import { AIProviderFactory } from '@/services/ai-provider.factory';
import { downloadFile, uploadFile, getPublicUrlFromKey } from '@/services/storage.service';
import { sendRestorationComplete, sendRestorationFailed } from '@/services/email.service';
import { logger } from '@/lib/logger';
import { Analytics } from '@/lib/analytics';
import { ErrorTracker } from '@/lib/error-tracking';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Main restoration job function
 * Processes photos with automatic retries on failure
 */
export const processRestorationJob = inngest.createFunction(
  {
    id: 'process-restoration-job',
    name: 'Process Photo Restoration Job',
    // Retry configuration
    retries: 3,
  },
  { event: 'photo/restoration.requested' },
  async ({ event, step }) => {
    const { jobId, orderId, email, fileKeys, packageId, serviceType } = event.data;

    logger.info('[Inngest] Starting restoration job', {
      jobId,
      orderId,
      imageCount: fileKeys.length,
    });

    const jobStartTime = Date.now();

    // Track job started
    Analytics.jobStarted(jobId, email, fileKeys.length, 'pending');

    // Step 1: Update job status to processing
    await step.run('update-job-status-processing', async () => {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'processing',
          updatedAt: new Date(),
        },
      });
      logger.info('[Inngest] Job status updated to processing', { jobId });
    });

    // Step 2: Get AI provider
    const provider = await step.run('get-ai-provider', async () => {
      const aiProvider = AIProviderFactory.getProvider();
      logger.info('[Inngest] Using AI provider', {
        provider: aiProvider.getName(),
        serviceType,
      });
      return aiProvider.getName();
    });

    // Step 3: Process each image
    const restoredImages: Array<{
      id: string;
      originalUrl: string;
      restoredUrl: string;
    }> = [];

    const images = await step.run('get-job-images', async () => {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { images: true },
      });
      return job?.images || [];
    });

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const imageNumber = i + 1;

      logger.info(`[Inngest] Processing image ${imageNumber}/${images.length}`, {
        jobId,
        imageId: image.id,
      });

      // Send progress event
      await step.sendEvent(`send-progress-${imageNumber}`, {
        name: 'photo/restoration.progress',
        data: {
          jobId,
          progress: Math.round((imageNumber / images.length) * 100),
          currentImage: imageNumber,
          totalImages: images.length,
          message: `Processing image ${imageNumber} of ${images.length}`,
        },
      });

      // Process this image (download, restore, upload) in one step to avoid Buffer serialization
      const restoredUrl = await step.run(
        `process-image-${imageNumber}`,
        async () => {
          if (!image.originalUrl) {
            throw new Error('Image original URL is null');
          }

          // Download original
          logger.info('[Inngest] Downloading original image', { url: image.originalUrl });
          const originalBuffer = await downloadFile(image.originalUrl);

          // Restore with AI (using serviceType from job)
          const aiProvider = AIProviderFactory.getProvider(undefined, serviceType as any);
          logger.info('[Inngest] Restoring image with AI', {
            provider: aiProvider.getName(),
            serviceType,
            originalSize: originalBuffer.length,
          });
          const restoredBuffer = await aiProvider.restorePhoto(originalBuffer);

          // Upload restored
          const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
          logger.info('[Inngest] Uploading restored image', { filename });
          const uploadResult = await uploadFile(restoredBuffer, filename, 'RESTORED_IMAGES');

          return uploadResult.url;
        }
      );

      // Update image record
      await step.run(`update-image-record-${imageNumber}`, async () => {
        await prisma.jobImage.update({
          where: { id: image.id },
          data: {
            restoredUrl,
          },
        });
        logger.info('[Inngest] Image record updated', {
          imageId: image.id,
          restoredUrl,
        });
      });

      restoredImages.push({
        id: image.id,
        originalUrl: image.originalUrl || '',
        restoredUrl,
      });
    }

    // Step 5: Update job to completed
    await step.run('update-job-completed', async () => {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });
      logger.info('[Inngest] Job completed', { jobId });
    });

    // Step 6: Update Order
    await step.run('update-order', async () => {
      const originalUrls = restoredImages.map(img => img.originalUrl);
      const restoredUrls = restoredImages.map(img => img.restoredUrl);

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'completed',
          originalFiles: originalUrls,
          restoredFiles: restoredUrls,
          updatedAt: new Date(),
        },
      });

      logger.info('[Inngest] Order updated', {
        orderId,
        restoredCount: restoredUrls.length,
      });
    });

    // Step 7: Send completion email
    await step.run('send-completion-email', async () => {
      const downloadLinks = restoredImages.map(img => img.restoredUrl);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await sendRestorationComplete({
        customerEmail: email,
        jobId,
        downloadLinks,
        expiresAt,
      });

      logger.info('[Inngest] Completion email sent', { email });
    });

    // Step 8: Send completion event
    await step.sendEvent('send-completion-event', {
      name: 'photo/restoration.completed',
      data: {
        jobId,
        orderId,
        restoredUrls: restoredImages.map(img => img.restoredUrl),
      },
    });

    const processingTime = Date.now() - jobStartTime;

    // Track job completion
    Analytics.jobCompleted(jobId, email, restoredImages.length, processingTime);

    logger.info('[Inngest] Restoration job completed successfully', {
      jobId,
      orderId,
      processedImages: restoredImages.length,
      processingTime,
    });

    return { jobId, orderId, processedImages: restoredImages.length };
  }
);

/**
 * Failure handler
 * Runs when restoration job fails after all retries
 */
export const handleRestorationFailure = inngest.createFunction(
  {
    id: 'handle-restoration-failure',
    name: 'Handle Restoration Failure',
  },
  { event: 'inngest/function.failed' },
  async ({ event }) => {
    // Only handle our restoration function failures
    if (event.data.function_id !== 'process-restoration-job') {
      return { skipped: true };
    }

    const originalEvent = event.data.event as any;
    const { jobId, orderId, email } = originalEvent.data;
    const errorData = event.data.error;

    const errorMessage = errorData?.message || 'Unknown error';

    logger.error('[Inngest] Restoration job failed after retries', undefined, {
      jobId,
      orderId,
      error: errorMessage,
    });

    // Track job failure
    Analytics.jobFailed(jobId, email, errorMessage);
    
    // Track critical error
    const error = new Error(errorMessage);
    await ErrorTracker.critical(error, {
      jobId,
      orderId,
      email,
      metadata: { retries: 'max_retries_exceeded' },
    });

    //Update job status
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        errorMessage: errorData?.message || 'Unknown error',
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'failed',
      },
    });

    // Send failure email
    await sendRestorationFailed(email, jobId, errorData?.message || 'Unknown error');

    logger.info('[Inngest] Failure handled', { jobId, orderId });

    return { handled: true };
  }
);
