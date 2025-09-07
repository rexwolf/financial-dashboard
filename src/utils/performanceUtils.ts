// Performance monitoring utilities
import React from 'react';

interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.metrics.push({
        name,
        duration,
        timestamp: Date.now()
      });

      // Log slow operations (>500ms)
      if (duration > 500) {
        console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      }

      // Keep only last 100 metrics
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100);
      }
    };
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageTime(name: string): number {
    const filteredMetrics = this.metrics.filter(m => m.name === name);
    if (filteredMetrics.length === 0) return 0;
    
    const total = filteredMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / filteredMetrics.length;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// HOC for measuring component render time
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const stopTimer = performanceMonitor.startTimer(`${componentName}_render`);
    
    React.useEffect(() => {
      stopTimer();
    });

    return React.createElement(Component, props);
  };
}

// Hook for measuring async operations
export function useAsyncPerformance() {
  const measureAsync = React.useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const stopTimer = performanceMonitor.startTimer(operationName);
    try {
      const result = await operation();
      stopTimer();
      return result;
    } catch (error) {
      stopTimer();
      throw error;
    }
  }, []);

  return { measureAsync };
}

// Utility functions
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory usage monitoring
export const getMemoryUsage = (): any => {
  if ('memory' in performance) {
    return (performance as any).memory;
  }
  return null;
};

// Network performance monitoring
export const measureNetworkRequest = async (
  url: string,
  options?: RequestInit
): Promise<{ response: Response; timing: PerformanceEntry | null }> => {
  const requestId = `network_${Date.now()}`;
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    
    // Try to get detailed timing info
    const timing = performance.getEntriesByName(url)[0] || null;
    
    performanceMonitor.getMetrics().push({
      name: `network_request_${url}`,
      duration: endTime - startTime,
      timestamp: Date.now()
    });

    return { response, timing };
  } catch (error) {
    const endTime = performance.now();
    performanceMonitor.getMetrics().push({
      name: `network_error_${url}`,
      duration: endTime - startTime,
      timestamp: Date.now()
    });
    throw error;
  }
};

export default performanceMonitor;
