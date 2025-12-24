/**
 * AI Provider Factory
 * 
 * This factory creates the appropriate AI restoration provider
 * based on configuration. It allows easy switching between providers
 * and adding new ones without changing application code.
 */

import { ImageRestorationProvider } from '@/types';
import { VanceAIProvider } from './vanceai.provider';
import { HotpotAIProvider } from './hotpot.provider';
import { DEFAULT_AI_PROVIDER } from '@/lib/constants';

/**
 * Get the configured AI restoration provider
 */
export function getAIProvider(): ImageRestorationProvider {
  const providerName = DEFAULT_AI_PROVIDER;

  switch (providerName) {
    case 'vanceai':
      return new VanceAIProvider();
    
    case 'hotpot':
      return new HotpotAIProvider();
    
    default:
      console.warn(
        `Unknown AI provider: ${providerName}, falling back to VanceAI`
      );
      return new VanceAIProvider();
  }
}

/**
 * Get a specific provider by name
 */
export function getProviderByName(
  name: 'vanceai' | 'hotpot'
): ImageRestorationProvider {
  switch (name) {
    case 'vanceai':
      return new VanceAIProvider();
    
    case 'hotpot':
      return new HotpotAIProvider();
    
    default:
      throw new Error(`Unsupported provider: ${name}`);
  }
}

/**
 * Check if a provider is available (API key configured)
 */
export function isProviderAvailable(name: 'vanceai' | 'hotpot'): boolean {
  try {
    const provider = getProviderByName(name);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of available providers
 */
export function getAvailableProviders(): Array<{
  name: string;
  id: 'vanceai' | 'hotpot';
  available: boolean;
}> {
  return [
    {
      name: 'VanceAI',
      id: 'vanceai',
      available: isProviderAvailable('vanceai'),
    },
    {
      name: 'Hotpot AI',
      id: 'hotpot',
      available: isProviderAvailable('hotpot'),
    },
  ];
}
