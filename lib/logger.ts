/**
 * Error Logging and Handling
 * Logs errors securely without exposing sensitive information to users
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error, userId } = entry;
    let log = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (userId) {
      log += ` [User: ${userId}]`;
    }
    
    log += ` ${message}`;
    
    if (context) {
      log += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error && !this.isProduction) {
      log += `\n  Error: ${error.message}\n  Stack: ${error.stack}`;
    } else if (error) {
      // In production, only log error message, not stack trace
      log += ` | Error: ${error.message}`;
    }
    
    return log;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    userId?: string
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.sanitizeContext(context),
      error,
      userId,
    };
  }

  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;
    
    // Remove sensitive fields
    const sensitive = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...context };
    
    Object.keys(sanitized).forEach(key => {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  info(message: string, context?: Record<string, any>, userId?: string) {
    const entry = this.createLogEntry('info', message, context, undefined, userId);
    console.log(this.formatLog(entry));
    // TODO: Send to external logging service (e.g., Sentry, LogRocket)
  }

  warn(message: string, context?: Record<string, any>, userId?: string) {
    const entry = this.createLogEntry('warn', message, context, undefined, userId);
    console.warn(this.formatLog(entry));
    // TODO: Send to external logging service
  }

  error(message: string, error?: Error, context?: Record<string, any>, userId?: string) {
    const entry = this.createLogEntry('error', message, context, error, userId);
    console.error(this.formatLog(entry));
    // TODO: Send to external logging service (e.g., Sentry)
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.isProduction) {
      const entry = this.createLogEntry('debug', message, context);
      console.debug(this.formatLog(entry));
    }
  }

  // Log security events
  security(message: string, context?: Record<string, any>, userId?: string) {
    const entry = this.createLogEntry('warn', `[SECURITY] ${message}`, context, undefined, userId);
    console.warn(this.formatLog(entry));
    // TODO: Send to security monitoring service
  }
}

export const logger = new Logger();

// Error response helper - never exposes stack traces
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  error?: Error
): { message: string; statusCode: number } {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log the full error
  logger.error(message, error);
  
  // Return sanitized error to user
  if (isProduction) {
    // Generic error messages in production
    const genericMessages: Record<number, string> = {
      400: 'Invalid request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not found',
      429: 'Too many requests',
      500: 'Internal server error',
    };
    
    return {
      message: genericMessages[statusCode] || 'An error occurred',
      statusCode,
    };
  }
  
  // Show actual error in development
  return {
    message: error?.message || message,
    statusCode,
  };
}

// Async error handler wrapper
export function asyncHandler<T>(
  fn: (...args: any[]) => Promise<T>
) {
  return async (...args: any[]): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error('Async handler error', error as Error, {
        function: fn.name,
        args: JSON.stringify(args).substring(0, 200),
      });
      throw error;
    }
  };
}
