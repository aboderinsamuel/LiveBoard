// Performance optimization utilities
import React from 'react';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private constructor() {
    this.setupPerformanceObservers();
  }

  private setupPerformanceObservers(): void {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('long-tasks', entry.duration);
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }

      // Monitor layout shifts
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              this.recordMetric('layout-shifts', (entry as any).value);
            }
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutShiftObserver);
      } catch (e) {
        console.warn('Layout shift monitoring not supported');
      }
    }
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getMetricStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [name] of this.metrics) {
      result[name] = this.getMetricStats(name);
    }
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Canvas optimization utilities
export class CanvasOptimizer {
  private static readonly MAX_POINTS_PER_ACTION = 1000;
  private static readonly OPTIMIZATION_THRESHOLD = 100;

  static optimizeDrawingActions(actions: any[]): any[] {
    return actions.map(action => {
      if (action.points && action.points.length > this.MAX_POINTS_PER_ACTION) {
        // Simplify path by removing intermediate points
        const simplified = this.simplifyPath(action.points, 2);
        return { ...action, points: simplified };
      }
      return action;
    });
  }

  private static simplifyPath(points: any[], tolerance: number): any[] {
    if (points.length <= 2) return points;

    const simplified = [points[0]];
    let lastPoint = points[0];

    for (let i = 1; i < points.length - 1; i++) {
      const currentPoint = points[i];
      const distance = Math.sqrt(
        Math.pow(currentPoint.x - lastPoint.x, 2) + 
        Math.pow(currentPoint.y - lastPoint.y, 2)
      );

      if (distance > tolerance) {
        simplified.push(currentPoint);
        lastPoint = currentPoint;
      }
    }

    simplified.push(points[points.length - 1]);
    return simplified;
  }

  static shouldOptimize(actions: any[]): boolean {
    return actions.length > this.OPTIMIZATION_THRESHOLD;
  }
}

// Memory management utilities
export class MemoryManager {
  private static readonly MAX_ACTIONS = 10000;
  private static readonly CLEANUP_INTERVAL = 30000; // 30 seconds

  static cleanupOldActions(actions: any[], maxAge: number = 300000): any[] {
    const now = Date.now();
    return actions.filter(action => 
      action.timestamp && (now - action.timestamp) < maxAge
    );
  }

  static limitActions(actions: any[], maxCount: number = this.MAX_ACTIONS): any[] {
    if (actions.length <= maxCount) return actions;
    
    // Keep the most recent actions
    return actions.slice(-maxCount);
  }

  static startPeriodicCleanup(
    getActions: () => any[],
    setActions: (actions: any[]) => void
  ): () => void {
    const interval = setInterval(() => {
      const actions = getActions();
      const cleaned = this.cleanupOldActions(actions);
      const limited = this.limitActions(cleaned);
      
      if (limited.length !== actions.length) {
        setActions(limited);
      }
    }, this.CLEANUP_INTERVAL);

    return () => clearInterval(interval);
  }
}

// Debounced function for high-frequency events
export function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

// Throttled function for high-frequency events
export function createThrottledFunction<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

// Virtual scrolling for large lists
export class VirtualScroller {
  private containerHeight: number = 0;
  private itemHeight: number = 0;
  private scrollTop: number = 0;

  constructor(containerHeight: number, itemHeight: number) {
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
  }

  getVisibleRange(totalItems: number): { start: number; end: number } {
    const start = Math.floor(this.scrollTop / this.itemHeight);
    const end = Math.min(
      start + Math.ceil(this.containerHeight / this.itemHeight) + 1,
      totalItems
    );
    
    return { start, end };
  }

  updateScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }

  getTotalHeight(totalItems: number): number {
    return totalItems * this.itemHeight;
  }
}

// Image optimization utilities
export class ImageOptimizer {
  static async compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

// Bundle size optimization
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc);
}

// Service Worker utilities for caching
export class CacheManager {
  private static readonly CACHE_NAME = 'whiteboard-cache-v1';
  private static readonly CACHE_URLS = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
  ];

  static async setupCache(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  static async cacheResources(): Promise<void> {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.CACHE_NAME);
        await cache.addAll(this.CACHE_URLS);
      } catch (error) {
        console.error('Failed to cache resources:', error);
      }
    }
  }
}
