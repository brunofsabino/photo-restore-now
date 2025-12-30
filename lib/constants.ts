/**
 * Constants and Configuration
 */

import { PricingPackage } from '@/types';

// ============================================
// PRICING PACKAGES
// ============================================

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    id: '1-photo',
    name: 'Basic Package',
    photoCount: 1,
    price: 999, // $9.99
    features: [
      'AI-powered restoration',
      'Sharpness correction',
      'Noise removal',
      'Digital download',
      '24-hour delivery',
      'Email support',
    ],
  },
  {
    id: '3-photos',
    name: 'Family Package',
    photoCount: 3,
    price: 2499, // $24.99
    popular: true,
    features: [
      'Everything in Basic',
      '~$8.33 per photo',
      'Save $5',
      'Perfect for family photos',
      'Priority delivery',
      'Satisfaction guarantee',
    ],
  },
  {
    id: '5-photos',
    name: 'Memories Package',
    photoCount: 5,
    price: 3999, // $39.99
    features: [
      'Everything in Family',
      '~$8.00 per photo',
      'Best value',
      'Premium processing',
      'Fastest delivery',
      '100% satisfaction guarantee',
    ],
  },
  {
    id: '10-photos',
    name: 'Heritage Package',
    photoCount: 10,
    price: 6999, // $69.99
    badge: 'Premium',
    features: [
      'Everything in Memories',
      '~$6.99 per photo',
      'Perfect for old albums',
      'Complete digitization',
      'Dedicated VIP support',
      'Express delivery',
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
