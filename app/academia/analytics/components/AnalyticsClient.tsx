"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Mark } from "@/types/Marks";
import { Course } from "@/types/Course";
import { AttendanceCourse } from "@/types/Attendance";
import { Calendar } from "@/types/Calendar";

// Using dynamic imports for all analytics components
const SummaryAnalytics = dynamic(() => import("./SummaryAnalytics"), { ssr: false });
const MarksAnalytics = dynamic(() => import("./MarksAnalytics"), { ssr: false });
const AttendanceAnalytics = dynamic(() => import("./AttendanceAnalytics"), { ssr: false });
const PerformanceAnalytics = dynamic(() => import("./PerformanceAnalytics"), { ssr: false });

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

  // Effect to handle intersection observer for detecting active section while scrolling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sections = document.querySelectorAll('div[id]');

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('id') as string;
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.3 }
      );

      sections.forEach((section) => {
        observer.observe(section);
      });

      return () => {
        sections.forEach((section) => {
          observer.unobserve(section);
        });
      };
    }
  }, []);

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
      {/* Mobile quick navigation bar - fixed at bottom on small screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-light-background-light dark:bg-dark-background-light border-t border-light-border dark:border-dark-border z-10 px-1 py-2">
        <div className="flex items-center justify-between px-2">
          <button 
            onClick={() => scrollToSection("summary")}
            className={`flex flex-col items-center justify-center p-1 ${activeSection === "summary" ? "text-light-accent dark:text-dark-accent" : "text-light-color/60 dark:text-dark-color/60"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
              <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
              <path d="M12 3v6"></path>
            </svg>
            <span className="text-xs mt-1">Summary</span>
          </button>
          
          <button 
            onClick={() => scrollToSection("marks")}
            className={`flex flex-col items-center justify-center p-1 ${activeSection === "marks" ? "text-light-accent dark:text-dark-accent" : "text-light-color/60 dark:text-dark-color/60"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            <span className="text-xs mt-1">Marks</span>
          </button>
          
          <button 
            onClick={() => scrollToSection("attendance")}
            className={`flex flex-col items-center justify-center p-1 ${activeSection === "attendance" ? "text-light-accent dark:text-dark-accent" : "text-light-color/60 dark:text-dark-color/60"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <polyline points="16 11 18 13 22 9"></polyline>
            </svg>
            <span className="text-xs mt-1">Attendance</span>
          </button>
          
          <button 
            onClick={() => scrollToSection("performance")}
            className={`flex flex-col items-center justify-center p-1 ${activeSection === "performance" ? "text-light-accent dark:text-dark-accent" : "text-light-color/60 dark:text-dark-color/60"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 22h14"></path>
              <path d="M19 9V3h-8v6"></path>
              <path d="M5 9V3h8v6"></path>
              <path d="M5 9a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5"></path>
              <path d="M5 9h14"></path>
            </svg>
            <span className="text-xs mt-1">Performance</span>
          </button>
        </div>
      </div>

      {/* Analytics sections with improved mobile spacing */}
      <div className="space-y-8 px-1 sm:px-0">
        <div id="summary" className="scroll-mt-24">
          <SummaryAnalytics 
            marks={marks} 
            courses={courses} 
            attendance={attendance} 
            calendar={calendar} 
          />
        </div>
        
        <div id="marks" className="scroll-mt-24">
          <MarksAnalytics marks={marks} courses={courses} />
        </div>
        
        <div id="attendance" className="scroll-mt-24">
          <AttendanceAnalytics attendance={attendance} calendar={calendar} />
        </div>
        
        <div id="performance" className="scroll-mt-24">
          <PerformanceAnalytics 
            marks={marks} 
            courses={courses} 
            attendance={attendance} 
            calendar={calendar} 
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsClient;