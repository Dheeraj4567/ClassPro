'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar } from '@/types/Calendar';
import { isClassProWrappedAvailable } from '@/utils/semesterTimings';
import { motion, AnimatePresence } from 'framer-motion';
import { lightHaptics } from '@/utils/haptics';

interface WrappedSidebarLinkProps {
  calendar: Calendar[];
  onClick: () => void;
}

const WrappedSidebarLink = ({ calendar, onClick }: WrappedSidebarLinkProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [availability, setAvailability] = useState<{
    isAvailable: boolean;
    daysRemaining?: number;
    daysUntilLastWorkingDay?: number;
  }>({ isAvailable: false });

  // Check if ClassProWrapped should be visible
  useEffect(() => {
    // Check if we already have calculated availability in localStorage
    const cachedAvailabilityStr = localStorage.getItem('classProWrappedAvailability');
    
    if (cachedAvailabilityStr) {
      try {
        // Try to parse the cached availability
        const cachedAvailability = JSON.parse(cachedAvailabilityStr);
        const cachedLastWorkingDayDate = localStorage.getItem('classProWrappedLastWorkingDay');
        
        // Make sure timestamp is within 24 hours (86400000 ms)
        const isFresh = Date.now() - cachedAvailability.timestamp < 86400000;
        
        // Check if the cached data is from before our date parsing fix
        // If we have a last working day but isAvailable is false and daysRemaining/daysUntilLastWorkingDay are undefined,
        // it's likely from the old buggy calculation
        const isStaleCache = cachedAvailability.lastWorkingDay && 
                           !cachedAvailability.isAvailable && 
                           cachedAvailability.daysRemaining === undefined && 
                           cachedAvailability.daysUntilLastWorkingDay === undefined;
        
        if (isFresh && !isStaleCache) {
          setAvailability(cachedAvailability);
          setIsVisible(true); // Always show the component
          console.log('[ClassPro Wrapped] Using cached availability:', cachedAvailability);
          return;
        } else if (isStaleCache) {
          console.log('[ClassPro Wrapped] Detected stale cache from old date parsing logic, recalculating...');
          // Clear the stale cache
          localStorage.removeItem('classProWrappedAvailability');
          localStorage.removeItem('classProWrappedLastWorkingDay');
        }
      } catch (error) {
        console.error('[ClassPro Wrapped] Error parsing cached wrapped availability:', error);
      }
    }
    
    // If no cached data or cache is stale, calculate it fresh
    if (calendar && calendar.length > 0) {
      console.log('[ClassPro Wrapped] Calendar data:', calendar);
      const wrappedAvailability = isClassProWrappedAvailable(calendar);
      console.log('[ClassPro Wrapped] Calculated availability:', wrappedAvailability);
      
      // Cache the calculation with timestamp
      try {
        localStorage.setItem('classProWrappedAvailability', JSON.stringify({
          ...wrappedAvailability,
          timestamp: Date.now()
        }));
        
        if (wrappedAvailability.lastWorkingDay) {
          localStorage.setItem('classProWrappedLastWorkingDay', wrappedAvailability.lastWorkingDay.date);
        }
      } catch (error) {
        console.error('Error caching wrapped availability:', error);
      }
      
      setAvailability(wrappedAvailability);
      setIsVisible(true); // Always show the component
    } else {
      console.log('[ClassPro Wrapped] No calendar data available');
      setIsVisible(true); // Still show component even without calendar
    }
  }, [calendar]);

  const handleClick = () => {
    // Only allow navigation if the feature is available
    if (!availability.isAvailable) {
      console.log('[ClassPro Wrapped] Feature not available yet. Days remaining:', availability.daysRemaining);
      return;
    }
    
    lightHaptics();
    onClick();
    router.push('/academia/wrapped');
  };

  // Always render the component, but style it based on availability
  // if (!isVisible) {
  //   return null;
  // }

  // Check if currently on the wrapped page
  const isActive = pathname === '/academia/wrapped';
  const isAvailable = availability.isAvailable;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={handleClick}
          disabled={!isAvailable}
          className={`w-full flex items-center gap-3 rounded-md py-2 px-3 transition-all ${
            isActive
              ? 'bg-light-accent/10 dark:bg-dark-accent/20 text-light-accent dark:text-dark-accent'
              : isAvailable
                ? 'text-light-color dark:text-dark-color hover:bg-light-background-light dark:hover:bg-dark-background-light'
                : 'text-light-color/40 dark:text-dark-color/40 cursor-not-allowed'
          }`}
        >
          {/* Animated icon - similar to the music wave animation */}
          <div className="relative w-6 h-6 flex items-end justify-center">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={`mx-[1px] w-[3px] rounded-t-sm ${
                  isAvailable 
                    ? 'bg-gradient-to-t from-light-accent to-purple-500 dark:from-dark-accent dark:to-blue-400'
                    : 'bg-light-color/20 dark:bg-dark-color/20'
                }`}
                animate={isAvailable ? {
                  height: [`${10 + i * 5}px`, `${20 + i * 8}px`, `${10 + i * 5}px`],
                } : {
                  height: `${10 + i * 5}px`
                }}
                transition={isAvailable ? {
                  duration: 0.8 + i * 0.2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                } : {}}
              />
            ))}
          </div>

          <div className="flex flex-col text-left">
            <span className={`font-semibold ${
              isActive 
                ? 'bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-blue-400' 
                : ''
            }`}>ClassPro Wrapped</span>
            <span className="text-xs opacity-70">
              {!isAvailable
                ? 'Coming soon...'
                : availability.daysRemaining === 1
                ? 'Last day!'
                : `${availability.daysRemaining} days left`}
            </span>
          </div>

          {/* "NEW" badge */}
          <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-md text-white ${
            isAvailable 
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-blue-500'
              : 'bg-gray-400 dark:bg-gray-600'
          }`}>
            {isAvailable ? 'NEW' : 'SOON'}
          </span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default WrappedSidebarLink;
