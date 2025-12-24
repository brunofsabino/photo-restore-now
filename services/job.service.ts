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

// In-memory job store (replace with database in production)
const jobs = new Map<string, RestorationJob>();

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
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const imageFiles: ImageFile[] = await Promise.all(
    images.map(async (file, index) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadOriginalImage(buffer, file.name);

      return {
        id: `img_${index}_${Date.now()}`,
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
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  try {
    // Update status to processing
    job.status = 'processing';
    job.updatedAt = new Date();
    jobs.set(jobId, job);

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

    // Update job with restored images
    job.images = restoredImages;
    job.status = 'completed';
    job.completedAt = new Date();
    job.updatedAt = new Date();
    jobs.set(jobId, job);

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

    job.status = 'failed';
    job.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    job.updatedAt = new Date();
    jobs.set(jobId, job);

    // Send failure email
    await sendRestorationFailed(job.email, jobId, job.errorMessage);
  }
}

/**
 * Get job status
 */
export function getJob(jobId: string): RestorationJob | undefined {
  return jobs.get(jobId);
}

/**
 * Get all jobs for an email
 */
export function getJobsByEmail(email: string): RestorationJob[] {
  return Array.from(jobs.values()).filter(job => job.email === email);
}

/**
 * Get job status
 */
export function getJobStatus(jobId: string): ImageStatus | null {
  const job = jobs.get(jobId);
  return job ? job.status : null;
}
