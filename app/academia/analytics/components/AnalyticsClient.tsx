"use client";

import React, { useState, useEffect, Suspense, startTransition } from "react";
import dynamic from "next/dynamic";
import { Mark } from "@/types/Marks";
import { Course } from "@/types/Course";
import { AttendanceCourse } from "@/types/Attendance";
import { Calendar } from "@/types/Calendar";
import { lightHaptics, mediumHaptics } from "@/utils/haptics";
import { useMobileView } from "./MobileContext";
import AnalyticsErrorBoundary from "./AnalyticsErrorBoundary";
import { usePerformanceMonitor } from "@/utils/PerformanceMonitor";

// Conditionally import the debug component only in development
const WrappedDebugger = process.env.NODE_ENV === 'development' 
  ? dynamic(() => import("./WrappedDebugger"), { ssr: false })
  : () => null;

// Loading placeholder for better UX
const AnalyticsLoadingPlaceholder = () => (
  <div className="w-full p-4 animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-2/3"></div>
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

// Using optimized dynamic imports with configurable loading options
const SummaryAnalytics = dynamic(() => import("./SummaryAnalytics"), { 
  ssr: false,
  loading: () => <AnalyticsLoadingPlaceholder />
});

const MarksAnalytics = dynamic(() => import("./MarksAnalytics"), { 
  ssr: false,
  loading: () => <AnalyticsLoadingPlaceholder />
});

const AttendanceAnalytics = dynamic(() => import("./AttendanceAnalytics"), { 
  ssr: false,
  loading: () => <AnalyticsLoadingPlaceholder />
});

// Performance analytics is the heaviest component - use intersection observer for loading
const PerformanceAnalytics = dynamic(() => import("./PerformanceAnalytics"), { 
  ssr: false, 
  loading: () => <AnalyticsLoadingPlaceholder />
});

interface AnalyticsClientProps {
  marks?: Mark[];
  courses?: Course[];
  attendance?: AttendanceCourse[];
  calendar?: Calendar[];
}

const AnalyticsClient: React.FC<AnalyticsClientProps> = ({
  marks = [],
  courses = [],
  attendance = [],
  calendar = []
}) => {
  // Monitor performance of this main analytics component
  usePerformanceMonitor('AnalyticsClient');
  
  // Track active section for mobile quick navigation
  const [activeSection, setActiveSection] = useState<string>("summary");
  // Track which heavy components have been loaded
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set(['summary']));
  // Get mobile view state from context
  const { isMobileView } = useMobileView();

  // Define a ref to track programmatic scrolling state
  const isScrollingProgrammaticallyRef = React.useRef(false);
  
  // Memoize scroll function to prevent recreating on every render
  const scrollToSection = React.useCallback((sectionId: string) => {
    lightHaptics();
    
    const element = document.getElementById(sectionId);
    if (element) {
      isScrollingProgrammaticallyRef.current = true;
      
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      // Use startTransition for non-blocking state update
      startTransition(() => {
        setActiveSection(sectionId);
      });
      
      // Update URL hash
      if (window.history) {
        const urlWithoutHash = window.location.href.split('#')[0];
        window.history.replaceState(null, '', `${urlWithoutHash}#${sectionId}`);
      }
      
      // Reset the flag after scroll completes
      setTimeout(() => {
        isScrollingProgrammaticallyRef.current = false;
      }, 1000);
    }
  }, []);
  
  // Optimize intersection observer with debouncing and performance improvements
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only target the specific sections we need to observe
      const sectionIds = ['summary', 'marks', 'attendance', 'performance'];
      const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
      
      // Get hash from URL or default to summary
      const initialHash = window.location.hash.slice(1);
      if (initialHash && sectionIds.includes(initialHash) && initialHash !== activeSection) {
        setActiveSection(initialHash);
      }
      
      // Track last active section to prevent unnecessary haptic feedback
      let lastActiveSection = activeSection;
      
      // Optimized debounced intersection handler to reduce jank
      let debounceTimer: ReturnType<typeof setTimeout>;
      
      const handleIntersection = (entries: IntersectionObserverEntry[]) => {
        // Skip intersection handling during programmatic scrolling
        if (isScrollingProgrammaticallyRef.current) return;
        
        clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(() => {
          // Find entries currently in viewport
          const visibleEntries = entries.filter(entry => entry.isIntersecting);
          
          if (visibleEntries.length > 0) {
            // Sort by Y position to get the topmost visible section
            const sortedEntries = [...visibleEntries].sort((a, b) => {
              const rectA = a.boundingClientRect;
              const rectB = b.boundingClientRect;
              return Math.abs(rectA.top) - Math.abs(rectB.top);
            });
            
            const id = sortedEntries[0].target.getAttribute('id') as string;
            
            // Only update if different to avoid unnecessary re-renders
            if (id && id !== activeSection) {
              // Provide subtle haptic feedback when automatically changing sections
              // but only if this wasn't from a touch scroll
              if (lastActiveSection !== id) {
                mediumHaptics();
                lastActiveSection = id;
              }
              
              // Use startTransition to make state updates non-blocking
              startTransition(() => {
                setActiveSection(id);
              });
              
              // Update URL hash silently without triggering scroll
              if (window.history) {
                const urlWithoutHash = window.location.href.split('#')[0];
                window.history.replaceState(null, '', `${urlWithoutHash}#${id}`);
              }
            }
          }
        }, isMobileView ? 150 : 100); // Slightly longer debounce on mobile for smoother experience
      };

      const observer = new IntersectionObserver(
        handleIntersection,
        { 
          // Optimized root margins based on device
          rootMargin: isMobileView ? '-5% 0px -10% 0px' : '-10% 0px -15% 0px',
          threshold: [0.05, 0.15, 0.3] // Optimized thresholds for earlier detection
        }
      );

      sections.forEach((section) => {
        if (section) observer.observe(section);
      });

      return () => {
        clearTimeout(debounceTimer);
        sections.forEach((section) => {
          if (section) observer.unobserve(section);
        });
      };
    }
  }, [activeSection, isMobileView]);

  // Enhanced scroll to section handler with conditional loading
  const enhancedScrollToSection = React.useCallback((sectionId: string) => {
    // Add haptic feedback for better touch interaction based on device
    if (isMobileView) {
      mediumHaptics(); // More pronounced haptics on mobile
    } else {
      lightHaptics(); // Subtle haptics on desktop
    }
    
    // Load the section if it hasn't been loaded yet
    if (!loadedSections.has(sectionId)) {
      startTransition(() => {
        setLoadedSections(prev => new Set([...prev, sectionId]));
      });
    }
    
    // Mark performance section as viewed in session storage
    if (sectionId === 'performance' && typeof window !== 'undefined') {
      sessionStorage.setItem('viewed-performance', 'true');
    }
    
    // Use the memoized scroll function
    scrollToSection(sectionId);
  }, [isMobileView, loadedSections, scrollToSection]);

  return (
    <div className="relative pb-24">
      {/* Enhanced mobile navigation bar with hardware acceleration and reduced flickering */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-light-background-light/95 dark:bg-dark-background-dark/95 backdrop-blur-md border-t border-light-border/20 dark:border-dark-border/20 z-40 px-1 py-1.5 transform-gpu will-change-transform shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-evenly px-2">
          {[
            { id: "summary", label: "Summary", icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
              </svg>
            )},
            { id: "marks", label: "Marks", icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            )},
            { id: "attendance", label: "Attendance", icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            )},
            { id: "performance", label: "Stats", icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
            )}
          ].map(item => (
            <button 
              key={item.id}
              aria-label={`View ${item.label} section`}
              onClick={() => enhancedScrollToSection(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 transition-all duration-150 ${
                activeSection === item.id 
                  ? "text-light-accent dark:text-dark-accent scale-110" 
                  : "text-light-color/60 dark:text-dark-color/60 hover:text-light-accent hover:dark:text-dark-accent"
              }`}
            >
              <div className="transform transition-transform active:scale-90">
                {item.icon}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {activeSection === item.id && (
                <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-light-accent dark:bg-dark-accent" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics sections with improved mobile layout */}
      <div className="space-y-6 md:space-y-8 px-2 sm:px-0 mx-auto max-w-full md:max-w-3xl lg:max-w-4xl">
        <div id="summary" className="scroll-mt-16 md:scroll-mt-24">
          <AnalyticsErrorBoundary componentName="Summary Analytics">
            <Suspense fallback={<AnalyticsLoadingPlaceholder />}>
              <SummaryAnalytics 
                marks={marks} 
                courses={courses} 
                attendance={attendance} 
                calendar={calendar} 
              />
            </Suspense>
          </AnalyticsErrorBoundary>
        </div>
        
        <div id="marks" className="scroll-mt-16 md:scroll-mt-24">
          {loadedSections.has('marks') ? (
            <AnalyticsErrorBoundary componentName="Marks Analytics">
              <Suspense fallback={<AnalyticsLoadingPlaceholder />}>
                <MarksAnalytics marks={marks} courses={courses} />
              </Suspense>
            </AnalyticsErrorBoundary>
          ) : (
            <div className="py-6 md:py-8">
              <button 
                onClick={() => enhancedScrollToSection('marks')}
                className="mx-auto block px-6 py-3 rounded-lg bg-light-accent/10 text-light-accent dark:bg-dark-accent/20 dark:text-dark-accent font-medium"
              >
                Load Marks Analytics
              </button>
            </div>
          )}
        </div>
        
        <div id="attendance" className="scroll-mt-16 md:scroll-mt-24">
          {loadedSections.has('attendance') ? (
            <AnalyticsErrorBoundary componentName="Attendance Analytics">
              <Suspense fallback={<AnalyticsLoadingPlaceholder />}>
                <AttendanceAnalytics attendance={attendance} calendar={calendar} />
              </Suspense>
            </AnalyticsErrorBoundary>
          ) : (
            <div className="py-6 md:py-8">
              <button 
                onClick={() => enhancedScrollToSection('attendance')}
                className="mx-auto block px-6 py-3 rounded-lg bg-light-accent/10 text-light-accent dark:bg-dark-accent/20 dark:text-dark-accent font-medium"
              >
                Load Attendance Analytics
              </button>
            </div>
          )}
        </div>
        
        {/* Performance is the heaviest, use an additional delay/lazy strategy */}
        <div id="performance" className="scroll-mt-16 md:scroll-mt-24">
          {(loadedSections.has('performance') || activeSection === 'performance' || (typeof window !== 'undefined' && sessionStorage.getItem('viewed-performance'))) ? (
            <AnalyticsErrorBoundary componentName="Performance Analytics">
              <Suspense fallback={<AnalyticsLoadingPlaceholder />}>
                <PerformanceAnalytics 
                  marks={marks} 
                  courses={courses} 
                  attendance={attendance} 
                  calendar={calendar} 
                />
              </Suspense>
            </AnalyticsErrorBoundary>
          ) : (
            <div className="py-6 md:py-8">
              <button 
                onClick={() => enhancedScrollToSection('performance')}
                className="mx-auto block px-6 py-3 rounded-lg bg-light-accent/10 text-light-accent dark:bg-dark-accent/20 dark:text-dark-accent font-medium"
              >
                Load Performance Analytics
              </button>
            </div>
          )}
        </div>
        
        {/* Only show the debug component in development mode */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 mb-20">
            <Suspense fallback={<AnalyticsLoadingPlaceholder />}>
              <WrappedDebugger calendar={calendar} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsClient;