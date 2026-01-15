/**
 * Mixpanel Analytics Service
 * 
 * Tracks user behavior, conversions, and funnel metrics
 */

import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let isInitialized = false;

export const initMixpanel = () => {
  if (typeof window !== 'undefined' && MIXPANEL_TOKEN && !isInitialized) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === 'development',
      track_pageview: true,
      persistence: 'localStorage',
    });
    isInitialized = true;
    console.log('Mixpanel initialized');
  }
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (isInitialized) {
    mixpanel.track(eventName, properties);
  }
};

// Identify user
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (isInitialized) {
    mixpanel.identify(userId);
    if (properties) {
      mixpanel.people.set(properties);
    }
  }
};

// Reset identity (on logout)
export const resetUser = () => {
  if (isInitialized) {
    mixpanel.reset();
  }
};

// Track page views
export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  if (isInitialized) {
    mixpanel.track('Page View', {
      page: pageName,
      ...properties,
    });
  }
};

// E-commerce specific tracking
export const MixpanelEvents = {
  // User Journey
  SIGNED_UP: 'User Signed Up',
  SIGNED_IN: 'User Signed In',
  SIGNED_OUT: 'User Signed Out',
  
  // Product/Package Selection
  VIEWED_PRICING: 'Viewed Pricing Page',
  SELECTED_PACKAGE: 'Selected Package',
  
  // Upload Flow
  STARTED_UPLOAD: 'Started Photo Upload',
  UPLOADED_PHOTO: 'Uploaded Photo',
  COMPLETED_UPLOAD: 'Completed Upload',
  
  // Checkout Flow
  VIEWED_CART: 'Viewed Cart',
  STARTED_CHECKOUT: 'Started Checkout',
  ENTERED_EMAIL: 'Entered Email',
  PAYMENT_METHOD_SHOWN: 'Payment Method Shown',
  PAYMENT_SUBMITTED: 'Payment Submitted',
  PAYMENT_SUCCEEDED: 'Payment Succeeded',
  PAYMENT_FAILED: 'Payment Failed',
  
  // Order Processing
  ORDER_CREATED: 'Order Created',
  ORDER_PROCESSING: 'Order Processing Started',
  ORDER_COMPLETED: 'Order Completed',
  ORDER_DOWNLOADED: 'Order Downloaded',
  
  // Engagement
  CLICKED_CTA: 'Clicked CTA Button',
  WATCHED_VIDEO: 'Watched Before/After',
  SHARED_RESULT: 'Shared Result',
  
  // Support
  CONTACTED_SUPPORT: 'Contacted Support',
  LEFT_FEEDBACK: 'Left Feedback',
} as const;

// Helper to track conversion funnel
export const trackFunnelStep = (step: string, properties?: Record<string, any>) => {
  trackEvent('Funnel Step', {
    step,
    timestamp: new Date().toISOString(),
    ...properties,
  });
};

// Track revenue
export const trackRevenue = (amount: number, orderId: string, properties?: Record<string, any>) => {
  if (isInitialized) {
    mixpanel.people.track_charge(amount / 100, {
      orderId,
      timestamp: new Date().toISOString(),
      ...properties,
    });
    
    trackEvent(MixpanelEvents.PAYMENT_SUCCEEDED, {
      revenue: amount / 100,
      orderId,
      ...properties,
    });
  }
};

export default mixpanel;
