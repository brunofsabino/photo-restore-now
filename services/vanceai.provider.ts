/**
 * VanceAI Provider
 * Implementation for VanceAI photo restoration API
 * Documentation: https://docs.vanceai.com/
 */

import axios from 'axios';
import FormData from 'form-data';
import { IAIProvider } from './ai-provider.factory';
import { logger } from '@/lib/logger';

export class VanceAIProvider implements IAIProvider {
  private apiToken: string;
  private apiUrl: string;
  private readonly POLL_INTERVAL = 5000; // 5 seconds
  private readonly MAX_POLL_TIME = 180000; // 3 minutes
  private readonly TIMEOUT = 30000; // 30 seconds per request
  private serviceType: string = 'restoration'; // Default service type

  constructor(serviceType: string = 'restoration') {
    this.apiToken = process.env.VANCEAI_API_KEY || '';
    this.apiUrl = process.env.VANCEAI_API_URL || 'https://api-service.vanceai.com';
    this.serviceType = serviceType;

    if (!this.apiToken || this.apiToken === 'your_vanceai_api_key') {
      throw new Error(
        'VanceAI API key is not configured. ' +
        'Purchase credits at https://vanceai.com/pricing/ and set VANCEAI_API_KEY in .env.local'
      );
    }

    logger.info('[VanceAI] Provider initialized', {
      apiUrl: this.apiUrl,
      apiTokenPrefix: this.apiToken.substring(0, 8),
      serviceType: this.serviceType
    });
  }

  getName(): string {
    return 'VanceAI';
  }

  async restorePhoto(imageBuffer: Buffer): Promise<Buffer> {
    const startTime = Date.now();
    logger.info('[VanceAI] Starting real photo restoration');

    try {
      // Step 1: Upload image to VanceAI
      const uid = await this.uploadImage(imageBuffer);
      logger.info('[VanceAI] Image uploaded', { uid });

      // Step 2: Start restoration job (Fix + Enhance workflow)
      const transId = await this.startRestoration(uid);
      logger.info('[VanceAI] Restoration job started', { transId });

      // Step 3: Poll for completion
      await this.waitForCompletion(transId);
      logger.info('[VanceAI] Restoration job completed', { transId });

      // Step 4: Download restored image
      const restoredBuffer = await this.downloadResult(transId);
      
      const processingTime = Date.now() - startTime;
      logger.info('[VanceAI] Photo restoration completed successfully', {
        processingTimeMs: processingTime,
        originalSize: imageBuffer.length,
        restoredSize: restoredBuffer.length
      });

      return restoredBuffer;

    } catch (error: any) {
      logger.error('[VanceAI] Restoration failed', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`VanceAI restoration failed: ${error.message}`);
    }
  }

  /**
   * Step 1: Upload image to VanceAI
   */
  private async uploadImage(imageBuffer: Buffer): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('api_token', this.apiToken);
      formData.append('file', imageBuffer, {
        filename: 'photo.jpg',
        contentType: 'image/jpeg',
      });

      logger.info('[VanceAI] Uploading image...', { size: imageBuffer.length });

      const response = await axios.post(
        `${this.apiUrl}/web_api/v1/upload`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: this.TIMEOUT,
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Upload failed');
      }

      const uid = response.data.data?.uid;
      if (!uid) {
        throw new Error('No UID returned from upload');
      }

      return uid;

    } catch (error: any) {
      logger.error('[VanceAI] Upload error', {
        error: error.message,
        response: error.response?.data
      });

      if (error.response?.data?.code === 30004) {
        throw new Error('Insufficient VanceAI credits. Please top up at https://vanceai.com/pricing/');
      }

      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Step 2: Start restoration job
   * 
   * VanceAI Job Strategy:
   * - Using 'denoise' which is reliable and provides good results
   * - Removes noise, sharpens image, improves quality
   * - Works consistently with all image sizes
   * 
   * Note: The 'retouch' job specifically for scratch removal sometimes
   * returns 500 errors from VanceAI. The 'denoise' job is more stable
   * and still provides excellent quality improvement.
   * 
   * For colorization, uses 'toning' job.
   */
  private async startRestoration(uid: string): Promise<string> {
    try {
      let jconfig: any;

      if (this.serviceType === 'colorization' || this.serviceType === 'restoration-colorization') {
        // COLORIZATION MODE
        jconfig = {
          job: 'toning',
          config: {
            module: 'toning',
            module_params: {},
            out_params: {
              compress: {
                quality: 95
              }
            }
          }
        };
        logger.info('[VanceAI] Using COLORIZATION mode (toning)');
      } else {
        // RESTORATION MODE: Using denoise (most reliable)
        jconfig = {
          job: 'denoise',
          config: {
            module: 'denoise',
            module_params: {
              model_name: 'DenoiseStable',
              auto_params: true,
              remove_noise: 75,
              sharpen: 75
            },
            out_params: {
              compress: {
                quality: 95
              }
            }
          }
        };
        logger.info('[VanceAI] Using DENOISE mode (removes noise + sharpens + improves quality)');
      }

      logger.info('[VanceAI] Starting restoration transform...', { uid });

      const response = await axios.post(
        `${this.apiUrl}/web_api/v1/transform`,
        {
          api_token: this.apiToken,
          uid: uid,
          jconfig: JSON.stringify(jconfig)
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: this.TIMEOUT,
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Transform failed');
      }

      const transId = response.data.data?.trans_id;
      if (!transId) {
        throw new Error('No trans_id returned from transform');
      }

      return transId;

    } catch (error: any) {
      logger.error('[VanceAI] Transform error', {
        error: error.message,
        response: error.response?.data
      });
      throw new Error(`Transform failed: ${error.message}`);
    }
  }

  /**
   * Step 3: Poll for job completion
   */
  private async waitForCompletion(transId: string): Promise<void> {
    const startTime = Date.now();
    let attempts = 0;

    while (true) {
      attempts++;
      const elapsed = Date.now() - startTime;

      if (elapsed > this.MAX_POLL_TIME) {
        throw new Error(`Restoration timeout after ${this.MAX_POLL_TIME}ms`);
      }

      try {
        const response = await axios.post(
          `${this.apiUrl}/web_api/v1/progress`,
          {
            api_token: this.apiToken,
            trans_id: transId
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: this.TIMEOUT,
          }
        );

        if (response.data.code !== 200) {
          throw new Error(response.data.msg || 'Progress check failed');
        }

        const status = response.data.data?.status;
        logger.info('[VanceAI] Job status', { transId, status, attempts, elapsedMs: elapsed });

        if (status === 'finish') {
          return; // Job completed
        }

        if (status === 'fatal') {
          throw new Error('Job failed with fatal error');
        }

        // Status is 'waiting', 'process', or 'busy' - continue polling
        await this.sleep(this.POLL_INTERVAL);

      } catch (error: any) {
        if (error.message.includes('timeout') || error.message.includes('fatal')) {
          throw error;
        }
        // Network error - retry after delay
        logger.warn('[VanceAI] Progress check error, retrying...', { error: error.message });
        await this.sleep(this.POLL_INTERVAL);
      }
    }
  }

  /**
   * Step 4: Download restored image
   */
  private async downloadResult(transId: string): Promise<Buffer> {
    try {
      logger.info('[VanceAI] Downloading result...', { transId });

      const response = await axios.post(
        `${this.apiUrl}/web_api/v1/download`,
        {
          api_token: this.apiToken,
          trans_id: transId
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          responseType: 'arraybuffer',
          timeout: this.TIMEOUT,
        }
      );

      const buffer = Buffer.from(response.data);

      if (buffer.length === 0) {
        throw new Error('Downloaded file is empty');
      }

      return buffer;

    } catch (error: any) {
      logger.error('[VanceAI] Download error', {
        error: error.message,
        response: error.response?.data
      });
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Helper: Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
