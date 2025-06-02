"use client";
import { useState, useEffect } from 'react';
import { Mark } from '@/types/Marks';
import { Course } from '@/types/Course';
import { AttendanceCourse } from '@/types/Attendance';
import { Calendar, Day } from '@/types/Calendar';
import { isClassProWrappedAvailable, cacheWrappedData, getCachedWrappedData } from '@/utils/semesterTimings';

interface UseWrappedDataProps {
  marks: Mark[];
  courses: Course[];
  attendance: AttendanceCourse[];
  calendar: Calendar[];
}

/**
 * Custom hook to manage ClassProWrapped data, ensuring it's cached and not recalculated after the last working day
 */
export const useWrappedData = ({ marks, courses, attendance, calendar }: UseWrappedDataProps) => {
  const [wrappedAvailability, setWrappedAvailability] = useState<{
    isAvailable: boolean;
    daysRemaining?: number;
    lastWorkingDay?: Day;
    daysUntilLastWorkingDay?: number;
  }>({ isAvailable: false });
  
  const [wrappedData, setWrappedData] = useState<{
    marks: Mark[];
    courses: Course[];
    attendance: AttendanceCourse[];
  }>({
    marks: [],
    courses: [],
    attendance: []
  });
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Check ClassProWrapped availability and handle data caching
  useEffect(() => {
    if (calendar && calendar.length > 0) {
      const availability = isClassProWrappedAvailable(calendar);
      setWrappedAvailability(availability);
      
      // Find the month string for the last working day
      let monthString: string | undefined;
      if (availability.lastWorkingDay && calendar.length > 0) {
        // Find the month that contains the last working day
        for (const monthData of calendar) {
          const hasLastWorkingDay = monthData.days.some((day: any) => 
            day.date === availability.lastWorkingDay!.date && 
            day.event?.includes("Last Working Day")
          );
          if (hasLastWorkingDay) {
            monthString = monthData.month;
            break;
          }
        }
      }
      
      // If we have a last working day, manage the wrapped data
      if (availability.lastWorkingDay) {
        // Check if we already have cached data
        const cachedData = getCachedWrappedData(availability.lastWorkingDay, monthString);
        
        if (cachedData) {
          // Use cached data if available (priority)
          console.log('Using cached Wrapped data from previous snapshot');
          setWrappedData(cachedData);
          setIsDataLoaded(true);
        } else {
          // Determine whether we should cache current data
          const shouldCache = availability.daysUntilLastWorkingDay !== undefined && 
                             (availability.daysUntilLastWorkingDay <= 0);
          
          // Determine whether we can use current data
          // We can use current data if:
          // 1. We're before or on the last working day, OR
          // 2. It's the first day after the last working day and we need to create a cache
          const canUseCurrentData = availability.daysUntilLastWorkingDay === undefined || 
                                   availability.daysUntilLastWorkingDay >= 0 ||
                                   (availability.daysRemaining === 10); // First day after last working day
          
          if (canUseCurrentData) {
            // Use current data
            const newData = {
              marks: [...marks],
              courses: [...courses],
              attendance: [...attendance]
            };
            
            setWrappedData(newData);
            setIsDataLoaded(true);
            
            // Cache data if needed
            if (shouldCache) {
              console.log('Caching Wrapped data snapshot for this semester');
              cacheWrappedData(marks, courses, attendance, availability.lastWorkingDay, monthString);
            }
          } else {
            // We're past the last working day and don't have cached data
            // This is an error state - we should have created a cache on the last working day
            console.error('No cached data available for previous semester Wrapped');
            setIsDataLoaded(false);
          }
        }
      }
    }
  }, [calendar, marks, courses, attendance]);
  
  return {
    wrappedAvailability,
    wrappedData,
    isDataLoaded
  };
};
