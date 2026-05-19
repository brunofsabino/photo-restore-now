/**
 * Hotpot AI Provider
 * Implementation for Hotpot AI photo restoration API
 */

import { IAIProvider } from './ai-provider.factory';

export class HotpotProvider implements IAIProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.HOTPOT_API_KEY || '';
    this.apiUrl = process.env.HOTPOT_API_URL || 'https://api.hotpot.ai';

    if (!this.apiKey) {
      console.warn('[Hotpot] API key not configured');
    }
  }

  getName(): string {
    return 'Hotpot AI';
  }

  async restorePhoto(imageUrl: string): Promise<Buffer> {
    console.log('[Hotpot] Starting photo restoration...');

    if (!this.apiKey) {
      throw new Error('Hotpot API key is not configured');
    }

    try {
      console.warn('[Hotpot] Using mock restoration - implement real API call');

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Return original image as placeholder
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);

    } catch (error: any) {
      console.error('[Hotpot] Restoration failed:', error);
      throw new Error(`Hotpot restoration failed: ${error.message}`);
    }
  }
}
