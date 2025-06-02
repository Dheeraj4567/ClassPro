// Hook for handling ClassProWrapped viewing state
import { useState, useEffect } from 'react';

interface UseWrappedStateProps {
  isAvailable: boolean;
}

interface UseWrappedStateReturn {
  hasViewed: boolean;
  setHasViewed: (value: boolean) => void;
  shouldPrompt: boolean;
}

/**
 * Custom hook to manage the ClassProWrapped viewing state
 * Tracks if the user has already viewed the wrapped content
 * and determines if we should prompt them to view it
 * 
 * @param props Configuration options including availability
 * @returns Object with state and methods to manage the viewing state
 */
export const useWrappedState = ({ isAvailable }: UseWrappedStateProps): UseWrappedStateReturn => {
  const [hasViewed, setHasViewed] = useState(false);
  const [shouldPrompt, setShouldPrompt] = useState(false);

  // On mount, check if the user has already viewed wrapped for this semester
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Check for stored viewing record
      const wrappedViewRecord = localStorage.getItem('classProWrappedViewed');
      
      if (wrappedViewRecord) {
        const viewData = JSON.parse(wrappedViewRecord);
        
        // Check if they've already viewed this semester's wrapped
        const currentSemesterId = getCurrentSemesterId();
        if (viewData.semesterId === currentSemesterId) {
          setHasViewed(true);
          setShouldPrompt(false);
          return;
        }
      }
      
      // If they haven't viewed it and it's available, we should prompt them
      setShouldPrompt(isAvailable);
      
    } catch (error) {
      console.error('Error reading wrapped view status:', error);
    }
  }, [isAvailable]);
  
  // Function to mark wrapped as viewed for this semester
  const markAsViewed = (viewed: boolean) => {
    setHasViewed(viewed);
    
    if (viewed && typeof window !== 'undefined') {
      try {
        // Store the viewing record with the current semester ID
        const viewData = {
          semesterId: getCurrentSemesterId(),
          viewedAt: new Date().toISOString()
        };
        
        localStorage.setItem('classProWrappedViewed', JSON.stringify(viewData));
      } catch (error) {
        console.error('Error saving wrapped view status:', error);
      }
    }
  };
  
  return {
    hasViewed,
    setHasViewed: markAsViewed,
    shouldPrompt
  };
};

/**
 * Get a unique identifier for the current semester
 * This allows tracking wrapped viewing status per-semester
 * 
 * @returns String ID for the current semester
 */
const getCurrentSemesterId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Simple semester identification logic
  // First half: Jan-Jun, Second half: Jul-Dec
  const semesterHalf = month < 6 ? '1' : '2';
  
  return `${year}-${semesterHalf}`;
};
