/**
 * Core Types for PhotoRestoreNow
 */

// ============================================
// PACKAGE & PRICING TYPES
// ============================================

export type PackageType = '1-photo' | '3-photos' | '5-photos' | '10-photos';

export interface PricingPackage {
  id: PackageType;
  name: string;
  photoCount: number;
  price: number; // in cents
  popular?: boolean;
  badge?: string;
  features: string[];
}

// ============================================
// IMAGE & RESTORATION TYPES
// ============================================

export type ImageStatus = 
  | 'pending'       // Waiting for payment
  | 'paid'          // Payment confirmed
  | 'processing'    // Being restored by AI
  | 'completed'     // Restoration complete
  | 'failed'        // Restoration failed
  | 'delivered';    // Sent to customer

export interface ImageFile {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  originalUrl?: string;
  restoredUrl?: string;
}

export interface RestorationJob {
  id: string;
  userId?: string; // Optional for guest users
  email: string;
  packageId: PackageType;
  images: ImageFile[];
  status: ImageStatus;
  paymentIntentId?: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

// ============================================
// AI PROVIDER TYPES
// ============================================

export interface AIProviderConfig {
  name: 'vanceai' | 'hotpot';
  apiKey: string;
  apiUrl: string;
}

export interface RestorationRequest {
  imageBuffer: Buffer;
  fileName: string;
  options?: {
    quality?: 'standard' | 'high';
    removeScratches?: boolean;
    colorize?: boolean;
  };
}

export interface RestorationResult {
  success: boolean;
  restoredImageUrl?: string;
  restoredImageBuffer?: Buffer;
  jobId?: string;
  errorMessage?: string;
  processingTime?: number;
}

export interface ImageRestorationProvider {
  name: string;
  
  /**
   * Upload image to provider
   */
  uploadImage(request: RestorationRequest): Promise<{ jobId: string }>;
  
  /**
   * Start restoration process
   */
  restoreImage(jobId: string): Promise<void>;
  
  /**
   * Get restoration result
   */
  getResult(jobId: string): Promise<RestorationResult>;
  
  /**
   * Check if job is complete
   */
  checkStatus(jobId: string): Promise<{ status: 'processing' | 'completed' | 'failed' }>;
}

// ============================================
// CART & CHECKOUT TYPES
// ============================================

export interface CartItem {
  id: string;
  packageId: PackageType;
  images: File[];
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalImages: number;
}

export interface CheckoutSession {
  sessionId: string;
  cartId: string;
  email: string;
  clientSecret?: string;
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  clientSecret: string;
}

// ============================================
// STORAGE TYPES
// ============================================

export type StorageProvider = 's3' | 'r2';

export interface StorageConfig {
  provider: StorageProvider;
  bucket: string;
  region?: string;
  endpoint?: string;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

// ============================================
// EMAIL TYPES
// ============================================

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

export interface RestorationCompleteEmail {
  customerEmail: string;
  jobId: string;
  downloadLinks: string[];
  expiresAt: Date;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}
