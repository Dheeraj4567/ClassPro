"use client";

import React from "react";
import { useMobileView } from "./MobileContext";
import { lightHaptics } from "@/utils/haptics";

// Enhanced NavBarWrapper with haptic feedback and mobile optimization
const NavBarWrapper: React.FC = () => {
  const { isMobileView } = useMobileView();

  // Function to handle scrolling to sections with haptic feedback
  const scrollToSection = (sectionId: string) => {
    lightHaptics();
    
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };
  
  // Don't render on mobile as AnalyticsClient has its own navigation
  if (isMobileView) return null;
  
  return (
    <div className="hidden lg:block sticky top-0 z-30 w-full bg-light-background-light/80 dark:bg-dark-background-normal/80 backdrop-blur-md shadow-sm">
      <div className="container max-w-4xl mx-auto py-2">
        <nav className="flex items-center justify-center gap-8">
          {[
            { id: "summary", label: "Summary" },
            { id: "marks", label: "Marks" },
            { id: "attendance", label: "Attendance" },
            { id: "performance", label: "Performance" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="px-3 py-1.5 text-light-color/70 dark:text-dark-color/70 hover:text-light-accent dark:hover:text-dark-accent rounded-md text-sm font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NavBarWrapper;