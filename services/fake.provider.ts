/**
 * Fake AI Provider for Testing
 * Simulates photo restoration without calling real APIs
 */

export class FakeAIProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = 'fake_key_for_testing';
  }

  /**
   * Simulate photo restoration by returning the same image
   * In a real scenario, this would call the AI API
   */
  async restorePhoto(imageBuffer: Buffer): Promise<Buffer> {
    console.log('[FAKE-AI] Simulating photo restoration...');
    
    // Simulate processing time (1-3 seconds)
    const delay = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    console.log(`[FAKE-AI] Processing complete after ${(delay/1000).toFixed(2)}s`);
    
    // Return the same image (in production, this would be the restored version)
    // You could also apply some basic filters here to simulate changes
    return imageBuffer;
  }

  /**
   * Check if provider is configured
   */
  isConfigured(): boolean {
    return true; // Always returns true for testing
  }

  /**
   * Get provider name
   */
  getName(): string {
    return 'Fake AI Provider (Testing)';
  }
}
