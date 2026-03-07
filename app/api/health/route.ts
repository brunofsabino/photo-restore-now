import { NextRequest, NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Used for testing server availability
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    aiProvider: process.env.AI_PROVIDER,
    r2Storage: process.env.USE_R2 === 'true',
  });
}
