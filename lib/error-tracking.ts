/**
 * Error Tracking & Alerting Service
 * 
 * Centralized error handling with:
 * - Error logging to Mixpanel
 * - Email alerts for critical errors
 * - Error rate monitoring
 * - Automatic recovery suggestions
 */

import { logger } from './logger';
import { Analytics } from './analytics';
import { sendEmail } from '@/services/email.service';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',          // Non-critical, logged only
  MEDIUM = 'medium',    // Important, logged and tracked
  HIGH = 'high',        // Serious, logged, tracked, and alerted
  CRITICAL = 'critical' // System-breaking, immediate alert
}

/**
 * Error context for tracking
 */
export interface ErrorContext {
  userId?: string;
  email?: string;
  orderId?: string;
  jobId?: string;
  provider?: string;
  metadata?: Record<string, any>;
}

/**
 * Error tracking configuration
 */
const ERROR_CONFIG = {
  // Send email alerts for these severities
  ALERT_SEVERITIES: [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL],
  
  // Admin emails for alerts
  ADMIN_EMAILS: process.env.ADMIN_EMAILS?.split(',') || [],
  
  // Error rate thresholds (errors per minute)
  ERROR_RATE_THRESHOLD: 10,
  
  // Cooldown between alerts (minutes)
  ALERT_COOLDOWN: 15,
};

/**
 * In-memory error rate tracking
 */
const errorRateTracker = new Map<string, number[]>();
let lastAlertTime = new Map<string, number>();

/**
 * Track and report an error
 */
export async function trackError(
  error: Error,
  context: ErrorContext,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): Promise<void> {
  const errorKey = `${context.orderId || context.jobId || 'system'}_${error.message}`;
  
  try {
    // Log to console/file
    logger.error(`[${severity.toUpperCase()}] ${error.message}`, error, context);
    
    // Track in Mixpanel
    Analytics.errorOccurred(error.message, {
      severity,
      ...context,
      stack: error.stack,
    });
    
    // Update error rate
    updateErrorRate(errorKey);
    
    // Send alerts if needed
    if (shouldSendAlert(severity, errorKey)) {
      await sendErrorAlert(error, context, severity);
      lastAlertTime.set(errorKey, Date.now());
    }
    
  } catch (trackingError) {
    // Fallback: at least log to console if tracking fails
    console.error('Error tracking failed:', trackingError);
    console.error('Original error:', error);
  }
}

/**
 * Update error rate tracking
 */
function updateErrorRate(key: string): void {
  const now = Date.now();
  const timestamps = errorRateTracker.get(key) || [];
  
  // Keep only errors from last minute
  const recentErrors = timestamps.filter(t => now - t < 60000);
  recentErrors.push(now);
  
  errorRateTracker.set(key, recentErrors);
}

/**
 * Check if error rate exceeds threshold
 */
function isErrorRateHigh(key: string): boolean {
  const timestamps = errorRateTracker.get(key) || [];
  return timestamps.length > ERROR_CONFIG.ERROR_RATE_THRESHOLD;
}

/**
 * Determine if alert should be sent
 */
function shouldSendAlert(severity: ErrorSeverity, errorKey: string): boolean {
  // Check severity
  if (!ERROR_CONFIG.ALERT_SEVERITIES.includes(severity)) {
    return false;
  }
  
  // Check if admins configured
  if (ERROR_CONFIG.ADMIN_EMAILS.length === 0) {
    return false;
  }
  
  // Check cooldown
  const lastAlert = lastAlertTime.get(errorKey);
  if (lastAlert) {
    const minutesSinceLastAlert = (Date.now() - lastAlert) / 60000;
    if (minutesSinceLastAlert < ERROR_CONFIG.ALERT_COOLDOWN) {
      return false;
    }
  }
  
  return true;
}

/**
 * Send error alert email to admins
 */
async function sendErrorAlert(
  error: Error,
  context: ErrorContext,
  severity: ErrorSeverity
): Promise<void> {
  const isHighRate = isErrorRateHigh(
    `${context.orderId || context.jobId || 'system'}_${error.message}`
  );
  
  const subject = `[${severity.toUpperCase()}] ${isHighRate ? '⚠️ High Error Rate - ' : ''}PhotoRestoreNow Error Alert`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .severity-${severity} {
          padding: 10px;
          border-left: 4px solid ${getSeverityColor(severity)};
          background: #f9f9f9;
          margin: 20px 0;
        }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        .stack { background: #f4f4f4; padding: 10px; overflow-x: auto; font-family: monospace; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🚨 Error Alert</h2>
        
        <div class="severity-${severity}">
          <h3>Severity: ${severity.toUpperCase()}</h3>
          ${isHighRate ? '<p><strong>⚠️ HIGH ERROR RATE DETECTED</strong></p>' : ''}
        </div>
        
        <div class="detail">
          <span class="label">Error Message:</span><br>
          <code>${error.message}</code>
        </div>
        
        ${context.orderId ? `
        <div class="detail">
          <span class="label">Order ID:</span> <code>${context.orderId}</code>
        </div>
        ` : ''}
        
        ${context.jobId ? `
        <div class="detail">
          <span class="label">Job ID:</span> <code>${context.jobId}</code>
        </div>
        ` : ''}
        
        ${context.email ? `
        <div class="detail">
          <span class="label">User Email:</span> <code>${context.email}</code>
        </div>
        ` : ''}
        
        ${context.provider ? `
        <div class="detail">
          <span class="label">AI Provider:</span> <code>${context.provider}</code>
        </div>
        ` : ''}
        
        ${context.metadata ? `
        <div class="detail">
          <span class="label">Additional Context:</span><br>
          <code>${JSON.stringify(context.metadata, null, 2)}</code>
        </div>
        ` : ''}
        
        <div class="detail">
          <span class="label">Stack Trace:</span>
          <pre class="stack">${error.stack || 'No stack trace available'}</pre>
        </div>
        
        <div class="detail">
          <span class="label">Timestamp:</span> ${new Date().toISOString()}
        </div>
        
        <hr>
        <p><small>This is an automated alert from PhotoRestoreNow error monitoring system.</small></p>
      </div>
    </body>
    </html>
  `;
  
  // Send to all admin emails
  for (const adminEmail of ERROR_CONFIG.ADMIN_EMAILS) {
    try {
      await sendEmail({
        to: adminEmail,
        subject,
        html,
      });
    } catch (emailError) {
      console.error(`Failed to send alert to ${adminEmail}:`, emailError);
    }
  }
}

/**
 * Get color for severity level
 */
function getSeverityColor(severity: ErrorSeverity): string {
  switch (severity) {
    case ErrorSeverity.LOW: return '#4CAF50';
    case ErrorSeverity.MEDIUM: return '#FF9800';
    case ErrorSeverity.HIGH: return '#F44336';
    case ErrorSeverity.CRITICAL: return '#9C27B0';
    default: return '#757575';
  }
}

/**
 * Convenient error tracking wrappers
 */
export const ErrorTracker = {
  /**
   * Track low severity error (logged only)
   */
  low: (error: Error, context: ErrorContext = {}) => 
    trackError(error, context, ErrorSeverity.LOW),
  
  /**
   * Track medium severity error (logged and tracked)
   */
  medium: (error: Error, context: ErrorContext = {}) => 
    trackError(error, context, ErrorSeverity.MEDIUM),
  
  /**
   * Track high severity error (alerts sent)
   */
  high: (error: Error, context: ErrorContext = {}) => 
    trackError(error, context, ErrorSeverity.HIGH),
  
  /**
   * Track critical error (immediate alerts)
   */
  critical: (error: Error, context: ErrorContext = {}) => 
    trackError(error, context, ErrorSeverity.CRITICAL),
  
  /**
   * Track payment-related error
   */
  payment: (error: Error, orderId: string, email: string) => 
    trackError(error, { orderId, email }, ErrorSeverity.HIGH),
  
  /**
   * Track AI provider error
   */
  aiProvider: (error: Error, provider: string, jobId?: string) => 
    trackError(error, { provider, jobId }, ErrorSeverity.HIGH),
  
  /**
   * Track storage error
   */
  storage: (error: Error, metadata?: Record<string, any>) => 
    trackError(error, { metadata }, ErrorSeverity.HIGH),
  
  /**
   * Track email sending error
   */
  emailSending: (error: Error, recipient: string) => 
    trackError(error, { email: recipient }, ErrorSeverity.MEDIUM),
};
