"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualizedChartProps {
  children: React.ReactNode;
  height?: number;
  threshold?: number;
  className?: string;
}

const VirtualizedChart: React.FC<VirtualizedChartProps> = ({
  children,
  height = 400,
  threshold = 0.1,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize the intersection observer options
  const observerOptions = useMemo(() => ({
    rootMargin: '50px 0px',
    threshold: threshold
  }), [threshold]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      observerOptions
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [observerOptions]);

  // Placeholder for when chart is not visible
  const ChartPlaceholder = () => (
    <div 
      className="flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Chart will load when in view</p>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={className}>
      {/* Only render the actual chart when visible or has been visible */}
      {isVisible || hasBeenVisible ? (
        <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-50'}`}>
          {children}
        </div>
      ) : (
        <ChartPlaceholder />
      )}
    </div>
  );
};

export default VirtualizedChart;
