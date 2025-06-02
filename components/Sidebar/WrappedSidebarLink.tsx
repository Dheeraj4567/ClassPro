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
        
        if (isFresh) {
          setAvailability(cachedAvailability);
          setIsVisible(cachedAvailability.isAvailable);
          return;
        }
      } catch (error) {
        console.error('Error parsing cached wrapped availability:', error);
      }
    }
    
    // If no cached data or cache is stale, calculate it fresh
    if (calendar && calendar.length > 0) {
      const wrappedAvailability = isClassProWrappedAvailable(calendar);
      
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
      setIsVisible(wrappedAvailability.isAvailable);
    }
  }, [calendar]);

  const handleClick = () => {
    lightHaptics();
    onClick();
    router.push('/academia/wrapped');
  };

  // If not available, don't render anything
  if (!isVisible) {
    return null;
  }

  // Check if currently on the wrapped page
  const isActive = pathname === '/academia/wrapped';

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
          className={`w-full flex items-center gap-3 rounded-md py-2 px-3 transition-all ${
            isActive
              ? 'bg-light-accent/10 dark:bg-dark-accent/20 text-light-accent dark:text-dark-accent'
              : 'text-light-color dark:text-dark-color hover:bg-light-background-light dark:hover:bg-dark-background-light'
          }`}
        >
          {/* Animated icon - similar to the music wave animation */}
          <div className="relative w-6 h-6 flex items-end justify-center">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="mx-[1px] w-[3px] bg-gradient-to-t from-light-accent to-purple-500 dark:from-dark-accent dark:to-blue-400 rounded-t-sm"
                animate={{
                  height: [`${10 + i * 5}px`, `${20 + i * 8}px`, `${10 + i * 5}px`],
                }}
                transition={{
                  duration: 0.8 + i * 0.2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
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
              {availability.daysRemaining === 1
                ? 'Last day!'
                : `${availability.daysRemaining} days left`}
            </span>
          </div>

          {/* "NEW" badge */}
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-blue-500 text-white">
            NEW
          </span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default WrappedSidebarLink;
