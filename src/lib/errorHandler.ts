import React from 'react';

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
  userId?: string;
  whiteboardId?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private constructor() {
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: ErrorType.RUNTIME_ERROR,
        message: `Unhandled promise rejection: ${event.reason}`,
        details: event.reason,
      });
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError({
        type: ErrorType.RUNTIME_ERROR,
        message: event.message,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        },
      });
    });
  }

  handleError(error: Omit<AppError, 'timestamp'>): void {
    const appError: AppError = {
      ...error,
      timestamp: Date.now(),
    };

    // Add to error log
    this.errorLog.push(appError);
    
    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('App Error:', appError);
    }

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(appError);
    }
  }

  private async reportError(error: AppError): Promise<void> {
    try {
      // In a real application, you would send this to an error reporting service
      // like Sentry, LogRocket, or your own error tracking API
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  getErrorsByType(type: ErrorType): AppError[] {
    return this.errorLog.filter(error => error.type === type);
  }

  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(-count);
  }
}

// Utility functions for common error scenarios
export function createNetworkError(message: string, details?: any): AppError {
  return {
    type: ErrorType.NETWORK_ERROR,
    message,
    details,
    timestamp: Date.now(),
  };
}

export function createWebSocketError(message: string, details?: any): AppError {
  return {
    type: ErrorType.WEBSOCKET_ERROR,
    message,
    details,
    timestamp: Date.now(),
  };
}

export function createValidationError(message: string, details?: any): AppError {
  return {
    type: ErrorType.VALIDATION_ERROR,
    message,
    details,
    timestamp: Date.now(),
  };
}

export function createPermissionError(message: string, details?: any): AppError {
  return {
    type: ErrorType.PERMISSION_ERROR,
    message,
    details,
    timestamp: Date.now(),
  };
}

export function createRuntimeError(message: string, details?: any): AppError {
  return {
    type: ErrorType.RUNTIME_ERROR,
    message,
    details,
    timestamp: Date.now(),
  };
}

// Error boundary component for React
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  return class ErrorBoundary extends React.Component<
    T & { children?: React.ReactNode },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: T & { children?: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      ErrorHandler.getInstance().handleError({
        type: ErrorType.RUNTIME_ERROR,
        message: error.message,
        details: {
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        },
      });
    }

    render() {
      if (this.state.hasError) {
        if (fallback) {
          return React.createElement(fallback, {
            error: this.state.error!,
            resetError: () => this.setState({ hasError: false, error: undefined }),
          });
        }

        return React.createElement('div', {
          className: "p-4 bg-red-50 border border-red-200 rounded-md"
        }, [
          React.createElement('h3', {
            key: 'title',
            className: "text-sm font-medium text-red-800"
          }, "Something went wrong"),
          React.createElement('p', {
            key: 'message',
            className: "mt-1 text-sm text-red-700"
          }, this.state.error?.message || 'An unexpected error occurred'),
          React.createElement('button', {
            key: 'retry',
            onClick: () => this.setState({ hasError: false, error: undefined }),
            className: "mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
          }, "Try again")
        ]);
      }

      return React.createElement(Component, this.props);
    }
  };
}

// Retry utility with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Safe async wrapper
export function safeAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorHandler.getInstance().handleError({
        type: ErrorType.RUNTIME_ERROR,
        message: `Async function error: ${(error as Error).message}`,
        details: { args, error },
      });
      return null;
    }
  };
}
