'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar } from '@/types/Calendar';
import { isClassProWrappedAvailable } from '@/utils/semesterTimings';
import { motion, AnimatePresence } from 'framer-motion';
import { lightHaptics } from '@/utils/haptics';
import { IoStatsChart } from 'react-icons/io5';

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
          className={`font-semibold ${
            isActive 
              ? "bg-light-side text-light-accent dark:bg-dark-side dark:text-dark-accent" 
              : isAvailable
                ? "hover:bg-light-side hover:text-light-accent hover:opacity-70 dark:hover:bg-dark-side dark:hover:text-dark-accent"
                : "opacity-40 cursor-not-allowed"
          } text-color text-light-color dark:text-dark-color flex flex-row-reverse items-center justify-between rounded-xl px-4 py-2 text-lg transition duration-150 hover:scale-[0.98] w-full`}
        >
          <div className="flex items-center gap-3">
            <IoStatsChart className="text-xl" />
            <div className="flex flex-col text-left">
              <span className="text-base">ClassPro Wrapped</span>
              <span className="text-xs opacity-70 font-normal">
                {!isAvailable
                  ? 'Coming soon...'
                  : availability.daysRemaining === 1
                  ? 'Last day!'
                  : `${availability.daysRemaining} days left`}
              </span>
            </div>
          </div>

          {/* Status badge - matches the NEW badge pattern used elsewhere */}
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
            isAvailable 
              ? 'bg-light-accent dark:bg-dark-accent text-light-background-light dark:text-dark-background-dark'
              : 'bg-light-color/20 dark:bg-dark-color/20 text-light-color/60 dark:text-dark-color/60'
          }`}>
            {isAvailable ? 'NEW' : 'SOON'}
          </span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default WrappedSidebarLink;
