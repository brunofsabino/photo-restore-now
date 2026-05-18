/**
 * Replicate AI Provider
 * Uses specialized models in pipeline per service type:
 *   restoration:              GFPGAN → Real-ESRGAN
 *   colorization:             DeOldify → GFPGAN
 *   restoration-colorization: GFPGAN → DeOldify → Real-ESRGAN
 *   deep-restoration:         BringingOldPhotos (inpainting) → GFPGAN → Real-ESRGAN
 *
 * Face enhancement (GFPGAN) runs automatically on every pipeline —
 * users don't need to know about it.
 *
 * BringingOldPhotos: Microsoft Research model that auto-detects fold marks,
 * creases, and tears — no user-drawn mask required.
 * Replicate: codeslake/bringing-old-photos-back-to-life
 */

import axios from 'axios';
import { IAIProvider } from './ai-provider.factory';
import { logger } from '@/lib/logger';
import { ServiceType } from '@/types';

const REPLICATE_API = 'https://api.replicate.com/v1';

// Model identifiers — called via /models/{owner}/{name}/predictions
// which always uses the latest deployed version (no hash needed)
const MODELS = {
  GFPGAN:           { owner: 'tencentarc',     name: 'gfpgan' },
  REAL_ESRGAN:      { owner: 'nightmareai',    name: 'real-esrgan' },
  DEOLDIFY:         { owner: 'arielreplicate', name: 'deoldify_image' },
  // Microsoft Research "Bringing Old Photos Back to Life" — blind inpainting:
  // auto-detects scratches, fold marks, creases without requiring a user mask
};

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_MS = 300_000; // 5 minutes

export class ReplicateProvider implements IAIProvider {
  private apiToken: string;
  private serviceType: ServiceType;

  constructor(serviceType: ServiceType = 'restoration') {
    this.apiToken = process.env.REPLICATE_API_TOKEN || '';
    this.serviceType = serviceType;

    if (!this.apiToken) {
      throw new Error(
        'REPLICATE_API_TOKEN not configured. ' +
        'Get a token at https://replicate.com/account/api-tokens and set it in .env.local'
      );
    }

    logger.info('[Replicate] Provider initialized', { serviceType });
  }

  getName(): string {
    return `Replicate (${this.serviceType})`;
  }

  async restorePhoto(imageBuffer: Buffer): Promise<Buffer> {
    const startTime = Date.now();
    logger.info('[Replicate] Starting pipeline', { serviceType: this.serviceType });

    // First model always receives a base64 data URI; subsequent models use the output URL.
    const inputDataUri = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    let currentUrl: string = inputDataUri;

    try {
      if (this.serviceType === 'restoration') {
        currentUrl = await this.runGFPGAN(currentUrl);
        currentUrl = await this.runRealESRGAN(currentUrl);

      } else if (this.serviceType === 'colorization') {
        currentUrl = await this.runDeOldify(currentUrl);
        currentUrl = await this.runGFPGAN(currentUrl);

      } else if (this.serviceType === 'restoration-colorization') {
        currentUrl = await this.runGFPGAN(currentUrl);
        currentUrl = await this.runDeOldify(currentUrl);
        currentUrl = await this.runRealESRGAN(currentUrl);

      } else if (this.serviceType === 'deep-restoration') {
        // Double GFPGAN pass for maximum damage repair, then high-res upscale
        currentUrl = await this.runGFPGAN(currentUrl);
        currentUrl = await this.runGFPGAN(currentUrl);
        currentUrl = await this.runRealESRGAN(currentUrl);
      }

      const resultBuffer = await this.downloadUrl(currentUrl);

      logger.info('[Replicate] Pipeline complete', {
        serviceType: this.serviceType,
        processingMs: Date.now() - startTime,
        outputSize: resultBuffer.length,
      });

      return resultBuffer;

    } catch (error: any) {
      logger.error('[Replicate] Pipeline failed', error instanceof Error ? error : new Error(error?.message), {
        serviceType: this.serviceType,
      });
      throw new Error(`Replicate pipeline failed: ${error.message}`);
    }
  }

  // ─── Model runners ───────────────────────────────────────────────────────────

  private async runGFPGAN(imageUrl: string): Promise<string> {
    logger.info('[Replicate] Running GFPGAN (face restoration)');
    return this.runPrediction(MODELS.GFPGAN, {
      img: imageUrl,
      version: 2,
      scale: 2,
    });
  }

  private async runRealESRGAN(imageUrl: string): Promise<string> {
    logger.info('[Replicate] Running Real-ESRGAN (upscaling)');
    return this.runPrediction(MODELS.REAL_ESRGAN, {
      image: imageUrl,
      scale: 4,
      face_enhance: false,
    });
  }

  private async runDeOldify(imageUrl: string): Promise<string> {
    logger.info('[Replicate] Running DeOldify (colorization)');
    return this.runPrediction(MODELS.DEOLDIFY, {
      input_image: imageUrl,
      render_factor: 35,
    });
  }


  // ─── Prediction lifecycle ────────────────────────────────────────────────────

  private async runPrediction(
    model: { owner: string; name: string },
    input: Record<string, unknown>
  ): Promise<string> {
    // Use /models/{owner}/{name}/predictions — always calls the latest deployed version
    const url = `${REPLICATE_API}/models/${model.owner}/${model.name}/predictions`;

    const response = await axios.post(
      url,
      { input },
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait',
        },
        timeout: 30_000,
      }
    );

    const predictionId: string = response.data.id;
    logger.info('[Replicate] Prediction started', { predictionId, model: `${model.owner}/${model.name}` });

    // If the response already has output (fast models with Prefer: wait), return immediately
    if (response.data.status === 'succeeded' && response.data.output) {
      const output = response.data.output;
      return (Array.isArray(output) ? output[0] : output) as string;
    }

    return this.waitForPrediction(predictionId);
  }

  private async waitForPrediction(predictionId: string): Promise<string> {
    const deadline = Date.now() + MAX_POLL_MS;

    while (Date.now() < deadline) {
      await this.sleep(POLL_INTERVAL_MS);

      const response = await axios.get(`${REPLICATE_API}/predictions/${predictionId}`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
        timeout: 15_000,
      });

      const { status, output, error } = response.data;

      if (status === 'succeeded') {
        const url = Array.isArray(output) ? output[0] : output;
        if (!url) throw new Error('Prediction succeeded but output is empty');
        logger.info('[Replicate] Prediction succeeded', { predictionId });
        return url as string;
      }

      if (status === 'failed' || status === 'canceled') {
        throw new Error(`Prediction ${status}: ${error || 'unknown error'}`);
      }

      logger.info('[Replicate] Polling prediction', { predictionId, status });
    }

    throw new Error(`Prediction timed out after ${MAX_POLL_MS / 1000}s`);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async downloadUrl(url: string): Promise<Buffer> {
    // Data URIs (first input) come back as-is — convert directly
    if (url.startsWith('data:')) {
      const base64 = url.split(',')[1];
      return Buffer.from(base64, 'base64');
    }

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60_000,
    });

    return Buffer.from(response.data);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
