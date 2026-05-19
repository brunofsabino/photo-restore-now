/**
 * Replicate AI Provider
 * Uses specialized models in pipeline per service type:
 *   restoration:              Real-ESRGAN (face_enhance)
 *   colorization:             DeOldify → Real-ESRGAN
 *   restoration-colorization: BringingOldPhotos → DeOldify → Real-ESRGAN
 *   deep-restoration:         BringingOldPhotos → Real-ESRGAN
 *
 * BringingOldPhotos: Microsoft Research model that auto-detects fold marks,
 * creases, tears, and white marks — no user-drawn mask required.
 * Replicate: codeslake/bringing-old-photos-back-to-life
 * Version fetched dynamically at runtime via /v1/models endpoint.
 */

import axios from 'axios';
import { IAIProvider } from './ai-provider.factory';
import { logger } from '@/lib/logger';
import { ServiceType } from '@/types';

const REPLICATE_API = 'https://api.replicate.com/v1';

// Version-based model IDs — required by the /v1/predictions endpoint
const MODELS = {
  REAL_ESRGAN: 'b3ef194191d13140337468c916c2c5b96dd0cb06dffc032a022a31807f6a5ea8',
  DEOLDIFY:    '0da600fab0c45a66211339f1c16b71345d22f26ef5fea3dca1bb90bb5711e950',
};

// BringingOldPhotos version is resolved at runtime to always use latest
const BRINGING_OLD_PHOTOS_SLUG = { owner: 'microsoft', name: 'bringing-old-photos-back-to-life' };

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_MS = 600_000; // 10 minutes

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

  async restorePhoto(imageUrl: string): Promise<Buffer> {
    const startTime = Date.now();
    logger.info('[Replicate] Starting pipeline', { serviceType: this.serviceType });

    let currentUrl: string = imageUrl;

    try {
      if (this.serviceType === 'restoration') {
        currentUrl = await this.runRealESRGAN(currentUrl);

      } else if (this.serviceType === 'colorization') {
        currentUrl = await this.runDeOldify(currentUrl);
        currentUrl = await this.runRealESRGAN(currentUrl);

      } else if (this.serviceType === 'restoration-colorization') {
        currentUrl = await this.tryBringingOldPhotos(currentUrl);
        currentUrl = await this.runDeOldify(currentUrl);
        currentUrl = await this.runRealESRGAN(currentUrl);

      } else if (this.serviceType === 'deep-restoration') {
        currentUrl = await this.tryBringingOldPhotos(currentUrl);
        currentUrl = await this.runRealESRGAN(currentUrl);

      } else {
        logger.warn('[Replicate] Unknown serviceType — falling back to restoration', { serviceType: this.serviceType });
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

  private async runRealESRGAN(imageUrl: string): Promise<string> {
    logger.info('[Replicate] Running Real-ESRGAN (upscaling)');
    return this.runPrediction(MODELS.REAL_ESRGAN, {
      image: imageUrl,
      scale: 2,
      face_enhance: true,
    });
  }

  private async runDeOldify(imageUrl: string): Promise<string> {
    logger.info('[Replicate] Running DeOldify (colorization)', { imageUrl });
    return this.runPrediction(MODELS.DEOLDIFY, {
      input_image: imageUrl,
      model_name: 'Artistic',
      render_factor: 40,
    });
  }

  private async tryBringingOldPhotos(imageUrl: string): Promise<string> {
    try {
      return await this.runBringingOldPhotos(imageUrl);
    } catch (error: any) {
      logger.warn('[Replicate] BringingOldPhotos failed — skipping damage repair step', {
        error: error?.message,
      });
      return imageUrl;
    }
  }

  private async runBringingOldPhotos(imageUrl: string): Promise<string> {
    logger.info('[Replicate] Running BringingOldPhotos (damage repair)');
    const { owner, name } = BRINGING_OLD_PHOTOS_SLUG;
    const modelResp = await axios.get(
      `${REPLICATE_API}/models/${owner}/${name}`,
      { headers: { Authorization: `Bearer ${this.apiToken}` }, timeout: 10_000 }
    );
    const version: string = modelResp.data?.latest_version?.id;
    if (!version) throw new Error('Could not resolve BringingOldPhotos model version');
    logger.info('[Replicate] BringingOldPhotos version resolved', { version });
    return this.runPrediction(version, {
      image: imageUrl,
      HR: true,
      with_scratch: true,
    });
  }

  // ─── Prediction lifecycle ────────────────────────────────────────────────────

  private async runPrediction(
    version: string,
    input: Record<string, unknown>,
    attempt = 0
  ): Promise<string> {
    const MAX_ATTEMPTS = 3;

    try {
      const response = await axios.post(
        `${REPLICATE_API}/predictions`,
        { version, input },
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 15_000,
        }
      );

      const predictionId: string = response.data.id;
      logger.info('[Replicate] Prediction created', { predictionId, version, attempt });

      return await this.waitForPrediction(predictionId);
    } catch (error: any) {
      const status = error?.response?.status;
      const is404 = status === 404;
      const isRetryable = attempt < MAX_ATTEMPTS - 1 && !is404;
      const message = error instanceof Error ? error.message : String(error);

      if (isRetryable) {
        const delay = 10_000 * (attempt + 1); // 10s, 20s backoff
        logger.warn('[Replicate] Prediction failed, retrying', { attempt, delay, message });
        await this.sleep(delay);
        return this.runPrediction(version, input, attempt + 1);
      }

      throw new Error(`Replicate pipeline failed: ${message}`);
    }
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
