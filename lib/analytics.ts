/**
 * Server-side Analytics Service
 * Tracks events from backend (payments, job completions, errors)
 */

import Mixpanel from 'mixpanel';
import { logger } from './logger';

const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN;

// Initialize Mixpanel server SDK (only if token is configured)
const mixpanel = MIXPANEL_TOKEN ? Mixpanel.init(MIXPANEL_TOKEN) : null;

if (!MIXPANEL_TOKEN) {
  logger.info('[Analytics] Mixpanel not configured - analytics disabled');
}

/**
 * Track server-side events
 */
export function trackServerEvent(
  event: string,
  properties?: Record<string, any>,
  distinctId?: string
) {
  if (!mixpanel) return;

  try {
    mixpanel.track(event, {
      distinct_id: distinctId || 'anonymous',
      ...properties,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    logger.error('[Analytics] Failed to track event', error as Error, { event });
  }
}

/**
 * Track user properties
 */
export function setUserProperties(
  userId: string,
  properties: Record<string, any>
) {
  if (!mixpanel) return;

  try {
    mixpanel.people.set(userId, {
      ...properties,
      $last_seen: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('[Analytics] Failed to set user properties', error as Error, { userId });
  }
}

/**
 * Track payment events
 */
export const Analytics = {
  // Payment tracking
  paymentStarted: (email: string, amount: number, packageId: string) => {
    trackServerEvent('Payment Started', {
      email,
      amount,
      packageId,
      currency: 'USD',
    }, email);
  },

  paymentIntentCreated: (email: string, amount: number, packageId: string, imageCount: number) => {
    trackServerEvent('Payment Intent Created', {
      email,
      amount,
      packageId,
      imageCount,
      currency: 'USD',
    }, email);
  },

  paymentSucceeded: (email: string, amount: number, packageId: string, paymentIntentId: string) => {
    trackServerEvent('Payment Succeeded', {
      email,
      amount,
      packageId,
      paymentIntentId,
      revenue: amount / 100, // Mixpanel revenue tracking
      currency: 'USD',
    }, email);

    // Track revenue
    if (mixpanel) {
      mixpanel.people.track_charge(email, amount / 100, {
        $time: new Date().toISOString(),
        packageId,
      });
    }
  },

  paymentFailed: (email: string, amount: number, error: string) => {
    trackServerEvent('Payment Failed', {
      email,
      amount,
      error,
    }, email);
  },

  // Job processing tracking
  jobStarted: (jobId: string, email: string, imageCount: number, provider: string) => {
    trackServerEvent('Job Started', {
      jobId,
      email,
      imageCount,
      provider,
    }, email);
  },

  jobCompleted: (jobId: string, email: string, imageCount: number, processingTime: number) => {
    trackServerEvent('Job Completed', {
      jobId,
      email,
      imageCount,
      processingTime,
    }, email);
  },

  jobFailed: (jobId: string, email: string, error: string) => {
    trackServerEvent('Job Failed', {
      jobId,
      email,
      error,
    }, email);
  },

  // Upload tracking
  uploadStarted: (email: string, fileCount: number, totalSize: number) => {
    trackServerEvent('Upload Started', {
      email,
      fileCount,
      totalSize,
    }, email);
  },

  uploadCompleted: (email: string, fileCount: number, storage: 'R2' | 'local') => {
    trackServerEvent('Upload Completed', {
      email,
      fileCount,
      storage,
    }, email);
  },

  // User tracking
  userSignedUp: (userId: string, email: string, provider: string) => {
    trackServerEvent('User Signed Up', {
      email,
      provider,
    }, userId);

    setUserProperties(userId, {
      $email: email,
      $created: new Date().toISOString(),
      signupProvider: provider,
    });
  },

  userSignedIn: (userId: string, email: string) => {
    trackServerEvent('User Signed In', {
      email,
    }, userId);

    setUserProperties(userId, {
      $email: email,
      $last_login: new Date().toISOString(),
    });
  },

  // Error tracking
  errorOccurred: (error: string, context: Record<string, any>) => {
    trackServerEvent('Error Occurred', {
      error,
      ...context,
    });
  },

  // Performance tracking
  apiPerformance: (endpoint: string, duration: number, statusCode: number) => {
    trackServerEvent('API Performance', {
      endpoint,
      duration_ms: duration,
      status_code: statusCode,
    });
  },

  aiProviderPerformance: (
    provider: string,
    operation: string,
    duration: number,
    success: boolean,
    details?: Record<string, any>
  ) => {
    trackServerEvent('AI Provider Performance', {
      provider,
      operation,
      duration_ms: duration,
      success,
      ...details,
    });
  },

  storagePerformance: (
    operation: 'upload' | 'download',
    storageType: 'r2' | 'local',
    duration: number,
    fileSize: number,
    success: boolean
  ) => {
    trackServerEvent('Storage Performance', {
      operation,
      storage_type: storageType,
      duration_ms: duration,
      file_size_bytes: fileSize,
      success,
    });
  },

  // Email tracking
  emailSent: (type: string, recipient: string, success: boolean) => {
    trackServerEvent('Email Sent', {
      type,
      recipient,
      success,
    }, recipient);
  },
};
