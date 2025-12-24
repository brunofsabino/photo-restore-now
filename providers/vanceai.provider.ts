/**
 * VanceAI Provider Implementation
 * 
 * VanceAI offers professional photo restoration services
 * API Documentation: https://api-service.vanceai.com/web/doc/api
 */

import axios from 'axios';
import {
  ImageRestorationProvider,
  RestorationRequest,
  RestorationResult,
} from '@/types';
import { sleep } from '@/lib/utils';

export class VanceAIProvider implements ImageRestorationProvider {
  name = 'VanceAI';
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.VANCEAI_API_KEY || '';
    this.apiUrl = process.env.VANCEAI_API_URL || 'https://api-service.vanceai.com';

    if (!this.apiKey) {
      throw new Error('VanceAI API key is not configured');
    }
  }

  /**
   * Upload image to VanceAI
   */
  async uploadImage(request: RestorationRequest): Promise<{ jobId: string }> {
    try {
      const formData = new FormData();
      const blob = new Blob([request.imageBuffer], { type: 'image/jpeg' });
      formData.append('file', blob, request.fileName);

      const response = await axios.post(
        `${this.apiUrl}/web/api/v1/upload`,
        formData,
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Upload failed');
      }

      return {
        jobId: response.data.data.uid,
      };
    } catch (error) {
      console.error('VanceAI upload error:', error);
      throw new Error('Failed to upload image to VanceAI');
    }
  }

  /**
   * Start restoration process
   */
  async restoreImage(jobId: string): Promise<void> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/web/api/v1/transform`,
        {
          uid: jobId,
          jconfig: JSON.stringify({
            job: 'photo-restoration',
            config: {
              module: 'restore',
              module_params: {
                model_name: 'general',
              },
            },
          }),
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Restoration failed to start');
      }
    } catch (error) {
      console.error('VanceAI restore error:', error);
      throw new Error('Failed to start restoration with VanceAI');
    }
  }

  /**
   * Get restoration result
   */
  async getResult(jobId: string): Promise<RestorationResult> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/web/api/v1/download`,
        {
          params: { uid: jobId },
          headers: {
            'api-key': this.apiKey,
          },
          timeout: 30000,
        }
      );

      if (response.data.code !== 200) {
        return {
          success: false,
          errorMessage: response.data.msg || 'Failed to get result',
        };
      }

      // Download the restored image
      const imageUrl = response.data.data.image_url;
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });

      return {
        success: true,
        restoredImageUrl: imageUrl,
        restoredImageBuffer: Buffer.from(imageResponse.data),
        jobId,
      };
    } catch (error) {
      console.error('VanceAI get result error:', error);
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
        `${this.apiUrl}/web/api/v1/progress`,
        {
          params: { uid: jobId },
          headers: {
            'api-key': this.apiKey,
          },
          timeout: 10000,
        }
      );

      if (response.data.code !== 200) {
        return { status: 'failed' };
      }

      const progress = response.data.data.progress;
      
      if (progress === 100) {
        return { status: 'completed' };
      } else if (progress === -1) {
        return { status: 'failed' };
      } else {
        return { status: 'processing' };
      }
    } catch (error) {
      console.error('VanceAI check status error:', error);
      return { status: 'processing' }; // Continue checking
    }
  }
}
