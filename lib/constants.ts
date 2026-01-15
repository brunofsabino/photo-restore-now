/**
 * Constants and Configuration
 */

import { PricingPackage, ServiceOption } from '@/types';

// ============================================
// SERVICE OPTIONS
// ============================================

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: 'restoration',
    name: 'Restoration Only',
    description: 'Fix scratches, tears, and damage. Perfect for damaged photos that are already in color.',
    icon: '🔧',
    priceMultiplier: 1.0, // Base price
  },
  {
    id: 'colorization',
    name: 'Colorization Only',
    description: 'Add vibrant colors to black & white photos. Best for undamaged vintage photos.',
    icon: '🎨',
    priceMultiplier: 0.5, // 50% of base price
  },
  {
    id: 'restoration-colorization',
    name: 'Restoration + Colorization',
    description: 'Complete transformation: fix damage AND add colors. Best for old damaged B&W photos.',
    icon: '⭐',
    priceMultiplier: 1.6, // 60% premium (combo discount)
    popular: true,
  },
];

// ============================================
// PRICING PACKAGES
// ============================================

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    id: '1-photo',
    name: 'Try It Package',
    photoCount: 1,
    basePrice: 599, // $5.99 (was $9.99)
    features: [
      'AI-powered restoration',
      'HD quality download',
      'Remove scratches & tears',
      'Print-ready quality',
      '24-hour delivery',
      'Email support',
      'Money-back guarantee',
    ],
  },
  {
    id: '3-photos',
    name: 'Family Memories',
    photoCount: 3,
    basePrice: 1497, // $14.97 (was $24.99)
    popular: true,
    badge: 'Most Popular',
    features: [
      'Everything in Try It',
      'Only $4.99 per photo',
      'Save over 15%',
      'Perfect for family album',
      'Priority 12-hour delivery',
      'Lifetime cloud storage',
      'Satisfaction guarantee',
    ],
  },
  {
    id: '5-photos',
    name: 'Album Package',
    photoCount: 5,
    basePrice: 2295, // $22.95 (was $39.99)
    badge: 'Best Value',
    features: [
      'Everything in Family',
      'Only $4.59 per photo',
      'Save 30% vs single photo',
      'Colorize B&W photos included',
      '6-hour express delivery',
      'Share link with family',
      'Premium support',
    ],
  },
  {
    id: '10-photos',
    name: 'Heritage Collection',
    photoCount: 10,
    basePrice: 3997, // $39.97 (was $69.99)
    badge: 'Premium',
    features: [
      'Everything in Album',
      'Only $3.99 per photo',
      'Best savings - save 40%',
      'Complete album restoration',
      'Before/After comparisons',
      'White glove service',
      'VIP support & same-day delivery',
    ],
  },
];

// ============================================
// FILE VALIDATION
// ============================================

export const MAX_FILE_SIZE = parseInt(
  process.env.MAX_FILE_SIZE || '10485760'
); // 10MB default

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// ============================================
// API ENDPOINTS
// ============================================

export const API_ROUTES = {
  // Cart & Checkout
  ADD_TO_CART: '/api/cart/add',
  GET_CART: '/api/cart',
  CHECKOUT: '/api/checkout',
  
  // Payment
  CREATE_PAYMENT_INTENT: '/api/payment/create-intent',
  STRIPE_WEBHOOK: '/api/webhooks/stripe',
  
  // Upload & Processing
  UPLOAD_IMAGE: '/api/upload',
  PROCESS_JOB: '/api/jobs/process',
  GET_JOB_STATUS: '/api/jobs/status',
  
  // Results
  DOWNLOAD_IMAGE: '/api/download',
  GET_HISTORY: '/api/history',
} as const;

// ============================================
// STORAGE CONFIGURATION
// ============================================

export const STORAGE_PATHS = {
  ORIGINAL_IMAGES: 'original',
  RESTORED_IMAGES: 'restored',
  TEMP: 'temp',
} as const;

// ============================================
// EMAIL TEMPLATES
// ============================================

export const EMAIL_SUBJECTS = {
  ORDER_CONFIRMATION: 'Your Photo Restoration Order Confirmation',
  PROCESSING_STARTED: 'Your Photos Are Being Restored',
  RESTORATION_COMPLETE: 'Your Restored Photos Are Ready!',
  RESTORATION_FAILED: 'Issue with Your Photo Restoration',
} as const;

// ============================================
// RATE LIMITING
// ============================================

export const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: parseInt(process.env.RATE_LIMIT_REQUESTS || '10'),
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
} as const;

// ============================================
// AI PROVIDER CONFIGURATION
// ============================================

export const AI_PROVIDERS = {
  VANCEAI: 'vanceai',
  HOTPOT: 'hotpot',
} as const;

export const DEFAULT_AI_PROVIDER = (process.env.AI_PROVIDER || 'vanceai') as 'vanceai' | 'hotpot';

// ============================================
// JOB PROCESSING
// ============================================

export const JOB_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000,
  POLLING_INTERVAL_MS: 3000,
  TIMEOUT_MS: 300000, // 5 minutes
} as const;

// ============================================
// LINKS
// ============================================

export const APP_ROUTES = {
  HOME: '/',
  PRICING: '/pricing',
  SIGNIN: '/auth/signin',
  UPLOAD: '/upload',
  CHECKOUT: '/checkout',
  DASHBOARD: '/dashboard',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;
