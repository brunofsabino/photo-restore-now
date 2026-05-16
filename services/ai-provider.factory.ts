/**
 * AI Provider Factory
 * Factory pattern to manage multiple AI restoration providers
 */

import { VanceAIProvider } from './vanceai.provider';
import { HotpotProvider } from './hotpot.provider';
import { FakeProvider } from './fake.provider';
import { ReplicateProvider } from './replicate.provider';
import { logger } from '@/lib/logger';
import { ServiceType } from '@/types';

export type AIProviderType = 'replicate' | 'vanceai' | 'hotpot' | 'fake';
export type { ServiceType };

export interface IAIProvider {
  restorePhoto(imageBuffer: Buffer): Promise<Buffer>;
  getName(): string;
}

export class AIProviderFactory {
  static getProvider(
    providerType?: AIProviderType,
    serviceType: ServiceType = 'restoration'
  ): IAIProvider {
    const provider = providerType || (process.env.AI_PROVIDER as AIProviderType) || 'fake';

    switch (provider) {
      case 'replicate':
        return new ReplicateProvider(serviceType);
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

  static getAllProviders(): IAIProvider[] {
    return [
      new FakeProvider(),
      new ReplicateProvider('restoration'),
      new VanceAIProvider('restoration'),
      new HotpotProvider(),
    ];
  }
}
