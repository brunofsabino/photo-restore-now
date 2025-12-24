/**
 * Hotpot AI Provider Implementation
 * 
 * Hotpot AI offers various AI-powered image tools including restoration
 * API Documentation: https://hotpot.ai/api-docs
 */

import axios from 'axios';
import {
  ImageRestorationProvider,
  RestorationRequest,
  RestorationResult,
} from '@/types';
import { sleep } from '@/lib/utils';

export class HotpotAIProvider implements ImageRestorationProvider {
  name = 'Hotpot AI';
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.HOTPOT_API_KEY || '';
    this.apiUrl = process.env.HOTPOT_API_URL || 'https://api.hotpot.ai';

    if (!this.apiKey) {
      throw new Error('Hotpot AI API key is not configured');
    }
  }

  /**
   * Upload image to Hotpot AI
   */
  async uploadImage(request: RestorationRequest): Promise<{ jobId: string }> {
    try {
      const base64Image = request.imageBuffer.toString('base64');

      const response = await axios.post(
        `${this.apiUrl}/restore-picture`,
        {
          image: base64Image,
          renderFactor: 2, // 2x resolution enhancement
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // Hotpot can take longer
        }
      );

      if (!response.data.id) {
        throw new Error('No job ID returned from Hotpot AI');
      }

      return {
        jobId: response.data.id,
      };
    } catch (error) {
      console.error('Hotpot AI upload error:', error);
      throw new Error('Failed to upload image to Hotpot AI');
    }
  }

  /**
   * Start restoration process (Hotpot processes immediately on upload)
   */
  async restoreImage(jobId: string): Promise<void> {
    // Hotpot AI starts processing immediately on upload
    // This method is here for interface compatibility
    await sleep(100);
  }

  /**
   * Get restoration result
   */
  async getResult(jobId: string): Promise<RestorationResult> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/status/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      if (response.data.status === 'completed' && response.data.output) {
        // Download the restored image
        const imageUrl = response.data.output;
        const imageResponse = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
        });

        return {
          success: true,
          restoredImageUrl: imageUrl,
          restoredImageBuffer: Buffer.from(imageResponse.data),
          jobId,
        };
      } else if (response.data.status === 'failed') {
        return {
          success: false,
          errorMessage: response.data.error || 'Restoration failed',
        };
      } else {
        return {
          success: false,
          errorMessage: 'Image is still processing',
        };
      }
    } catch (error) {
      console.error('Hotpot AI get result error:', error);
      return {
        success: false,
        errorMessage: 'Failed to retrieve restoration result',
      };
    }
  }

  /**
   * Check job status
   */
  async checkStatus(
    jobId: string
  ): Promise<{ status: 'processing' | 'completed' | 'failed' }> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/status/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 10000,
        }
      );

      const status = response.data.status;

      if (status === 'completed') {
        return { status: 'completed' };
      } else if (status === 'failed' || status === 'error') {
        return { status: 'failed' };
      } else {
        return { status: 'processing' };
      }
    } catch (error) {
      console.error('Hotpot AI check status error:', error);
      return { status: 'processing' }; // Continue checking
    }
  }
}
