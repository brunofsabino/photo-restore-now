/**
 * AI Provider Factory
 * Factory pattern to manage multiple AI restoration providers
 */

import { VanceAIProvider } from './vanceai.provider';
import { HotpotProvider } from './hotpot.provider';

export type AIProviderType = 'vanceai' | 'hotpot';

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
    const provider = providerType || (process.env.AI_PROVIDER as AIProviderType) || 'vanceai';

    switch (provider) {
      case 'vanceai':
        return new VanceAIProvider();
      case 'hotpot':
        return new HotpotProvider();
      default:
        console.warn(`Unknown AI provider: ${provider}, falling back to VanceAI`);
        return new VanceAIProvider();
    }
  }

  /**
   * Get all available providers
   */
  static getAllProviders(): IAIProvider[] {
    return [
      new VanceAIProvider(),
      new HotpotProvider(),
    ];
  }
}
