/**
 * Job Processing Service
 * 
 * Handles the async processing of restoration jobs
 * Coordinates between AI providers, storage, and email services
 */

import { RestorationJob, ImageFile, ImageStatus } from '@/types';
import { getAIProvider } from '@/providers';
import { uploadOriginalImage, uploadRestoredImage } from './storage.service';
import {
  sendOrderConfirmation,
  sendRestorationComplete,
  sendRestorationFailed,
} from './email.service';
import { JOB_CONFIG } from '@/lib/constants';
import { sleep } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Generate unique job ID
 */
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique image ID
 */
function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new restoration job
 */
export async function createJob(
  email: string,
  packageId: RestorationJob['packageId'],
  images: File[],
  paymentIntentId: string,
  totalAmount: number
): Promise<string> {
  const jobId = generateJobId();

  const imageFiles: ImageFile[] = await Promise.all(
    images.map(async (file, index) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadOriginalImage(buffer, file.name);

      return {
        id: generateImageId(),
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
        originalUrl: uploadResult.url,
      };
    })
  );

  const job: RestorationJob = {
    id: jobId,
    email,
    packageId,
    images: imageFiles,
    status: 'paid',
    paymentIntentId,
    totalAmount,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  jobs.set(jobId, job);

  // Send confirmation email
  await sendOrderConfirmation(
    email,
    jobId,
    packageId,
    images.length,
    totalAmount
  );

  // Start processing (in background)
  processJob(jobId).catch(error => {
    console.error(`Job ${jobId} processing error:`, error);
  });

  return jobId;
}

/**
 * Process a restoration job
 */
export async function processJob(jobId: string): Promise<void> {
  // Fetch job from database
  const dbJob = await prisma.job.findUnique({
    where: { id: jobId },
    include: { images: true },
  });

  if (!dbJob) {
    throw new Error(`Job ${jobId} not found`);
  }

  // Convert to RestorationJob type
  const job: RestorationJob = {
    id: dbJob.id,
    orderId: dbJob.orderId || undefined,
    userId: dbJob.userId || undefined,
    email: dbJob.email,
    packageId: dbJob.packageId as any,
    serviceType: dbJob.serviceType as any,
    status: dbJob.status as ImageStatus,
    paymentIntentId: dbJob.paymentIntentId || undefined,
    totalAmount: dbJob.totalAmount,
    errorMessage: dbJob.errorMessage || undefined,
    images: dbJob.images.map(img => ({
      id: img.id,
      originalName: img.originalName,
      size: img.size,
      mimeType: img.mimeType,
      uploadedAt: img.uploadedAt,
      originalUrl: img.originalUrl || undefined,
      restoredUrl: img.restoredUrl || undefined,
    })),
    createdAt: dbJob.createdAt,
    updatedAt: dbJob.updatedAt,
    completedAt: dbJob.completedAt || undefined,
  };

  try {
    // Update status to processing
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'processing', updatedAt: new Date() },
    });

    const aiProvider = getAIProvider();
    console.log(`Processing job ${jobId} with ${aiProvider.name}`);

    // Process each image
    const restoredImages: ImageFile[] = [];

    for (const image of job.images) {
      let retries = 0;
      let success = false;

      while (retries < JOB_CONFIG.MAX_RETRIES && !success) {
        try {
          // Download original image
          const response = await fetch(image.originalUrl!);
          const buffer = Buffer.from(await response.arrayBuffer());

          // Upload to AI provider
          const { jobId: aiJobId } = await aiProvider.uploadImage({
            imageBuffer: buffer,
            fileName: image.originalName,
          });

          // Start restoration
          await aiProvider.restoreImage(aiJobId);

          // Poll for completion
          let isComplete = false;
          const startTime = Date.now();

          while (!isComplete) {
            if (Date.now() - startTime > JOB_CONFIG.TIMEOUT_MS) {
              throw new Error('Processing timeout');
            }

            const status = await aiProvider.checkStatus(aiJobId);

            if (status.status === 'completed') {
              isComplete = true;
            } else if (status.status === 'failed') {
              throw new Error('AI processing failed');
            } else {
              await sleep(JOB_CONFIG.POLLING_INTERVAL_MS);
            }
          }

          // Get result
          const result = await aiProvider.getResult(aiJobId);

          if (!result.success || !result.restoredImageBuffer) {
            throw new Error(result.errorMessage || 'Failed to get result');
          }

          // Upload restored image to storage
          const uploadResult = await uploadRestoredImage(
            result.restoredImageBuffer,
            `restored_${image.originalName}`
          );

          restoredImages.push({
            ...image,
            restoredUrl: uploadResult.url,
          });

          success = true;
        } catch (error) {
          retries++;
          console.error(
            `Error processing image ${image.id} (attempt ${retries}):`,
            error
          );

          if (retries < JOB_CONFIG.MAX_RETRIES) {
            await sleep(JOB_CONFIG.RETRY_DELAY_MS);
          }
        }
      }

      if (!success) {
        throw new Error(`Failed to process image ${image.originalName}`);
      }
    }

    // Update job and images with restored URLs
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Update each image with restored URL
    for (let i = 0; i < restoredImages.length; i++) {
      await prisma.jobImage.update({
        where: { id: restoredImages[i].id },
        data: { restoredUrl: restoredImages[i].restoredUrl },
      });
    }

    job.images = restoredImages;
    job.status = 'completed';
    job.completedAt = new Date();

    // Send completion email
    const downloadLinks = restoredImages.map(img => img.restoredUrl!);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await sendRestorationComplete({
      customerEmail: job.email,
      jobId,
      downloadLinks,
      expiresAt,
    });

    console.log(`Job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update job status to failed
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        errorMessage,
        updatedAt: new Date(),
      },
    });

    // Send failure email
    await sendRestorationFailed(job.email, jobId, errorMessage);
  }
}

/**
 * Get job by ID
 */
export async function getJob(jobId: string): Promise<RestorationJob | null> {
  const dbJob = await prisma.job.findUnique({
    where: { id: jobId },
    include: { images: true },
  });

  if (!dbJob) return null;

  return {
    id: dbJob.id,
    orderId: dbJob.orderId || undefined,
    userId: dbJob.userId || undefined,
    email: dbJob.email,
    packageId: dbJob.packageId as any,
    serviceType: dbJob.serviceType as any,
    status: dbJob.status as ImageStatus,
    paymentIntentId: dbJob.paymentIntentId || undefined,
    totalAmount: dbJob.totalAmount,
    errorMessage: dbJob.errorMessage || undefined,
    images: dbJob.images.map(img => ({
      id: img.id,
      originalName: img.originalName,
      size: img.size,
      mimeType: img.mimeType,
      uploadedAt: img.uploadedAt,
      originalUrl: img.originalUrl || undefined,
      restoredUrl: img.restoredUrl || undefined,
    })),
    createdAt: dbJob.createdAt,
    updatedAt: dbJob.updatedAt,
    completedAt: dbJob.completedAt || undefined,
  };
}

/**
 * Get all jobs for an email
 */
export async function getJobsByEmail(email: string): Promise<RestorationJob[]> {
  const dbJobs = await prisma.job.findMany({
    where: { email },
    include: { images: true },
    orderBy: { createdAt: 'desc' },
  });

  return dbJobs.map(dbJob => ({
    id: dbJob.id,
    orderId: dbJob.orderId || undefined,
    userId: dbJob.userId || undefined,
    email: dbJob.email,
    packageId: dbJob.packageId as any,
    serviceType: dbJob.serviceType as any,
    status: dbJob.status as ImageStatus,
    paymentIntentId: dbJob.paymentIntentId || undefined,
    totalAmount: dbJob.totalAmount,
    errorMessage: dbJob.errorMessage || undefined,
    images: dbJob.images.map(img => ({
      id: img.id,
      originalName: img.originalName,
      size: img.size,
      mimeType: img.mimeType,
      uploadedAt: img.uploadedAt,
      originalUrl: img.originalUrl || undefined,
      restoredUrl: img.restoredUrl || undefined,
    })),
    createdAt: dbJob.createdAt,
    updatedAt: dbJob.updatedAt,
    completedAt: dbJob.completedAt || undefined,
  }));
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<ImageStatus | null> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { status: true },
  });
  return job ? (job.status as ImageStatus) : null;
}

/**
 * Create job from webhook (after payment success)
 * Downloads images from file keys and processes them
 */
export async function createJobFromWebhook(
  orderId: string,
  email: string,
  fileKeys: string[],
  packageId: string,
  photoCount: number
): Promise<string> {
  const jobId = generateJobId();
  
  logger.info('Creating job from webhook', {
    jobId,
    orderId,
    email,
    fileCount: fileKeys.length,
    packageId,
  });

  // Validate file count
  if (fileKeys.length !== photoCount) {
    throw new Error(`File count mismatch: expected ${photoCount}, got ${fileKeys.length}`);
  }

  // Reconstruct full URLs from keys
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const fileUrls = fileKeys.map(key => `${baseUrl}/api/files/${key}`);

  // Download images from URLs
  const images: Array<{ buffer: Buffer; filename: string; mimeType: string }> = [];
  
  for (const url of fileUrls) {
    try {
      // Extract filename from URL (last part after /)
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      logger.info('Downloading image from URL', { url, filename });
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download ${filename}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      images.push({
        buffer,
        filename,
        mimeType: contentType,
      });
    } catch (error) {
      logger.error('Error downloading image', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  logger.info('All images downloaded successfully', { count: images.length });

  // Create job in database
  const dbJob = await prisma.job.create({
    data: {
      id: jobId,
      orderId,
      email,
      packageId,
      serviceType: 'restoration',
      status: 'pending',
      totalAmount: 0, // Will be updated if needed
      images: {
        create: images.map((img, index) => ({
          originalName: img.filename,
          size: img.buffer.length,
          mimeType: img.mimeType,
          originalUrl: fileUrls[index],
        })),
      },
    },
    include: { images: true },
  });

  logger.info('Job created from webhook', {
    jobId,
    orderId,
    email,
    imageCount: dbJob.images.length,
  });

  // Process job asynchronously
  processJob(jobId).catch(error => {
    logger.error('Error processing job from webhook', {
      jobId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  });

  return jobId;
}
