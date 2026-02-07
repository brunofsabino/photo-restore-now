/**
 * Fake AI Provider for Testing
 * Simulates async job processing without calling real APIs
 */

import { ImageRestorationProvider, RestorationRequest, RestorationResult } from '@/types';

export class FakeProvider implements ImageRestorationProvider {
  name = 'Fake AI Provider (Testing)';
  
  private jobs = new Map<string, {
    imageBuffer: Buffer;
    fileName: string;
    status: 'processing' | 'completed' | 'failed';
    completedAt?: Date;
  }>();

  /**
   * Simulates uploading image to AI service
   */
  async uploadImage(request: RestorationRequest): Promise<{ jobId: string }> {
    const jobId = `fake_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    this.jobs.set(jobId, {
      imageBuffer: request.imageBuffer,
      fileName: request.fileName,
      status: 'processing',
    });

    console.log(`[FAKE-AI] Image uploaded | jobId: ${jobId}`);
    return { jobId };
  }

  /**
   * Simulates starting restoration process
   * Completes immediately for testing
   */
  async restoreImage(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    console.log(`[FAKE-AI] Starting restoration | jobId: ${jobId}`);
    
    // Simulate instant completion (no actual processing)
    job.status = 'completed';
    job.completedAt = new Date();
    this.jobs.set(jobId, job);
  }

  /**
   * Checks job status
   */
  async checkStatus(jobId: string): Promise<{ status: 'processing' | 'completed' | 'failed' }> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    return { status: job.status };
  }

  /**
   * Gets restoration result (returns original image unchanged)
   */
  async getResult(jobId: string): Promise<RestorationResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status !== 'completed') {
      return {
        success: false,
        errorMessage: 'Job not completed yet',
      };
    }

    console.log(`[FAKE-AI] Returning result | jobId: ${jobId} | fileName: ${job.fileName}`);

    // Return original image unchanged
    return {
      success: true,
      restoredImageBuffer: job.imageBuffer,
      jobId,
      processingTime: 0,
    };
  }
}
