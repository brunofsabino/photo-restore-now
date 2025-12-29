/**
 * AI Provider Factory
 * Factory pattern to manage multiple AI restoration providers
 */

import { VanceAIProvider } from './vanceai.provider';
import { HotpotProvider } from './hotpot.provider';
import { FakeAIProvider } from './fake.provider';

export type AIProviderType = 'vanceai' | 'hotpot' | 'fake';

export interface IAIProvider {
  restorePhoto(imageBuffer: Buffer): Promise<Buffer>;
  getName(): string;
}

export class AIProviderFactory {
  /**
   * Get AI provider instance
   * @param providerType - Type of provider to use (defaults to env var AI_PROVIDER)
   */
  static getProvider(providerType?: AIProviderType): IAIProvider {
    const provider = providerType || (process.env.AI_PROVIDER as AIProviderType) || 'fake';

    switch (provider) {
      case 'vanceai':
        return new VanceAIProvider();
      case 'hotpot':
        return new HotpotProvider();
      case 'fake':
        return new FakeAIProvider();
      default:
        console.warn(`Unknown AI provider: ${provider}, falling back to Fake Provider`);
        return new FakeAIProvider();
    }
  }

  /**
   * Get all available providers
   */
  static getAllProviders(): IAIProvider[] {
    return [
      new FakeAIProvider(),
      new VanceAIProvider(),
      new HotpotProvider(),
    ];
  }
}
