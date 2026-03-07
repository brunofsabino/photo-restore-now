/**
 * AI Provider Factory
 * Factory pattern to manage multiple AI restoration providers
 */

import { VanceAIProvider } from './vanceai.provider';
import { HotpotProvider } from './hotpot.provider';
import { FakeProvider } from './fake.provider';
import { logger } from '@/lib/logger';

export type AIProviderType = 'vanceai' | 'hotpot' | 'fake';
export type ServiceType = 'restoration' | 'colorization' | 'restoration-colorization';

export interface IAIProvider {
  restorePhoto(imageBuffer: Buffer): Promise<Buffer>;
  getName(): string;
}

export class AIProviderFactory {
  /**
   * Get AI provider instance
   * @param providerType - Type of provider to use (defaults to env var AI_PROVIDER)
   * @param serviceType - Type of service (restoration, colorization, both)
   */
  static getProvider(
    providerType?: AIProviderType, 
    serviceType: ServiceType = 'restoration'
  ): IAIProvider {
    const provider = providerType || (process.env.AI_PROVIDER as AIProviderType) || 'fake';

    switch (provider) {
      case 'vanceai':
        return new VanceAIProvider(serviceType);
      case 'hotpot':
        return new HotpotProvider();
      case 'fake':
        return new FakeProvider();
      default:
        logger.warn(`[AI] Unknown provider: ${provider}, using Fake Provider`, { provider });
        return new FakeProvider();
    }
  }

  /**
   * Get all available providers
   */
  static getAllProviders(): IAIProvider[] {
    return [
      new FakeProvider(),
      new VanceAIProvider('restoration'),
      new HotpotProvider(),
    ];
  }
}
