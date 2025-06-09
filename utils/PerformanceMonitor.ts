"use client";

import React, { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(componentName: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${componentName}-start`);
    }
  }

  endMeasure(componentName: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${componentName}-end`);
      
      try {
        performance.measure(
          `${componentName}-render`,
          `${componentName}-start`,
          `${componentName}-end`
        );

        const measure = performance.getEntriesByName(`${componentName}-render`)[0];
        if (measure) {
          this.metrics.push({
            componentName,
            renderTime: measure.duration,
            timestamp: Date.now()
          });

          // Keep only last 100 measurements to prevent memory leaks
          if (this.metrics.length > 100) {
            this.metrics = this.metrics.slice(-100);
          }

          // Log in development mode
          if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 ${componentName} rendered in ${measure.duration.toFixed(2)}ms`);
          }
        }

        // Clean up performance entries
        performance.clearMarks(`${componentName}-start`);
        performance.clearMarks(`${componentName}-end`);
        performance.clearMeasures(`${componentName}-render`);
      } catch (error) {
        // Silent fail for performance measurements
        if (process.env.NODE_ENV === 'development') {
          console.warn('Performance measurement failed:', error);
        }
      }
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageRenderTime(componentName: string): number {
    const componentMetrics = this.metrics.filter(m => m.componentName === componentName);
    if (componentMetrics.length === 0) return 0;
    
    const total = componentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return total / componentMetrics.length;
  }

  getSlowestComponents(limit = 5): PerformanceMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, limit);
  }

  trackLongTask(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              if (process.env.NODE_ENV === 'development') {
                console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
              }
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', observer);
      } catch (error) {
        // PerformanceObserver not supported
      }
    }
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for easy component performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>();

  useEffect(() => {
    renderStartTime.current = performance.now();
    performanceMonitor.startMeasure(componentName);

    return () => {
      if (renderStartTime.current) {
        performanceMonitor.endMeasure(componentName);
      }
    };
  });

  useEffect(() => {
    // Track long tasks on mount
    performanceMonitor.trackLongTask();

    return () => {
      // Cleanup on unmount
      performanceMonitor.cleanup();
    };
  }, []);
};

// Higher-order component for performance monitoring
export function withPerformanceMonitor<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const ComponentWithPerformanceMonitor = (props: P) => {
    const name = componentName || WrappedComponent.name || 'UnknownComponent';
    usePerformanceMonitor(name);
    
    return React.createElement(WrappedComponent, props);
  };

  ComponentWithPerformanceMonitor.displayName = `withPerformanceMonitor(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ComponentWithPerformanceMonitor;
}
