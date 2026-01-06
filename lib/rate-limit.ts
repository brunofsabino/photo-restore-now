import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/payment': { windowMs: 60000, maxRequests: 10 },  // 10 requests per minute
  '/api/files': { windowMs: 60000, maxRequests: 20 },    // 20 requests per minute
  '/api/jobs': { windowMs: 60000, maxRequests: 30 },     // 30 requests per minute
};

export function rateLimit(req: NextRequest): boolean {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const pathname = req.nextUrl.pathname;
  
  // Find matching rate limit config
  const configKey = Object.keys(RATE_LIMITS).find(path => pathname.startsWith(path));
  if (!configKey) return true; // No rate limit for this path
  
  const config = RATE_LIMITS[configKey];
  const key = `${ip}:${configKey}`;
  const now = Date.now();
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return true;
  }
  
  if (record.count >= config.maxRequests) {
    return false; // Rate limit exceeded
  }
  
  record.count++;
  return true;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute
