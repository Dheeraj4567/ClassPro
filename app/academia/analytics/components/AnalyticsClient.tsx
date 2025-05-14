"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { Mark } from "@/types/Marks";
import { Course } from "@/types/Course";
import { AttendanceCourse } from "@/types/Attendance";
import { Calendar } from "@/types/Calendar";

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

// Performance analytics is the heaviest component - prioritize other components loading first
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
  // Track active section for mobile quick navigation
  const [activeSection, setActiveSection] = useState<string>("summary");

  // Optimized effect to handle intersection observer with better performance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only target the specific sections we need to observe
      const sectionIds = ['summary', 'marks', 'attendance', 'performance'];
      const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
      
      // Use more efficient callback with passive options
      const handleIntersection = (entries: IntersectionObserverEntry[]) => {
        // Find the entry with the largest intersection ratio
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by intersection ratio to prioritize the most visible section
          const topEntry = [...visibleEntries].sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          const id = topEntry.target.getAttribute('id') as string;
          // Only update state if section has changed (reduce unnecessary re-renders)
          if (id && id !== activeSection) {
            setActiveSection(id);
          }
        }
      };

      const observer = new IntersectionObserver(
        handleIntersection,
        { 
          threshold: [0.1, 0.3, 0.5], // Multiple thresholds for more accurate tracking
          rootMargin: '-10% 0px -10% 0px' // Better margins for mobile
        }
      );

      sections.forEach((section) => {
        if (section) observer.observe(section);
      });

      return () => {
        sections.forEach((section) => {
          if (section) observer.unobserve(section);
        });
      };
    }
  }, [activeSection]);

  // Scroll to section handler
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      // Smooth scroll to section with offset for fixed header
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative pb-20">
      {/* Optimized mobile navigation bar with hardware acceleration and passive events */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-light-background-light dark:bg-dark-background-light border-t border-light-border dark:border-dark-border z-10 px-1 py-2 will-change-transform translate-z-0">
        <div className="flex items-center justify-between px-2">
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
              onClick={() => scrollToSection(item.id)}
              className={`flex flex-col items-center justify-center p-1 transition-colors duration-150 ${
                activeSection === item.id 
                  ? "text-light-accent dark:text-dark-accent" 
                  : "text-light-color/60 dark:text-dark-color/60"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {activeSection === item.id && (
                <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-light-accent dark:bg-dark-accent" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics sections with lazy loading and improved chunking */}
      <div className="space-y-8 px-1 sm:px-0">
        <div id="summary" className="scroll-mt-24">
          <Suspense fallback={<AnalyticsLoadingPlaceholder />}>
            <SummaryAnalytics 
              marks={marks} 
              courses={courses} 
              attendance={attendance} 
              calendar={calendar} 
            />
          </Suspense>
        </div>
        
        <div id="marks" className="scroll-mt-24">
          <Suspense fallback={<AnalyticsLoadingPlaceholder />}>
            <MarksAnalytics marks={marks} courses={courses} />
          </Suspense>
        </div>
        
        <div id="attendance" className="scroll-mt-24">
          <Suspense fallback={<AnalyticsLoadingPlaceholder />}>
            <AttendanceAnalytics attendance={attendance} calendar={calendar} />
          </Suspense>
        </div>
        
        {/* Performance is the heaviest, use an additional delay/lazy strategy */}
        <div id="performance" className="scroll-mt-24">
          <Suspense fallback={<AnalyticsLoadingPlaceholder />}>
            {/* Only render PerformanceAnalytics when user is scrolled to this section or has visited it */}
            {activeSection === 'performance' || (typeof window !== 'undefined' && sessionStorage.getItem('viewed-performance')) ? (
              <PerformanceAnalytics 
                marks={marks} 
                courses={courses} 
                attendance={attendance} 
                calendar={calendar} 
              />
            ) : (
              <div className="py-8">
                <button 
                  onClick={() => {
                    scrollToSection('performance');
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('viewed-performance', 'true');
                    }
                  }}
                  className="mx-auto block px-6 py-3 rounded-lg bg-light-accent/10 text-light-accent dark:bg-dark-accent/20 dark:text-dark-accent font-medium"
                >
                  Load Performance Analytics
                </button>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsClient;