"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
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
  
  // Memoize availability calculation to prevent recalculation
  const availability = useMemo(() => {
    if (!calendar || calendar.length === 0) {
      return { isAvailable: false };
    }
    return isClassProWrappedAvailable(calendar);
  }, [calendar]);
  
  // Memoize month string calculation
  const monthString = useMemo(() => {
    if (!availability.lastWorkingDay || !calendar.length) return undefined;
    
    for (const monthData of calendar) {
      const hasLastWorkingDay = monthData.days.some((day: any) => 
        day.date === availability.lastWorkingDay!.date &&
        day.event?.includes("Last Working Day")
      );
      if (hasLastWorkingDay) {
        return monthData.month;
      }
    }
    return undefined;
  }, [availability.lastWorkingDay, calendar]);
  
  // Memoize cached data retrieval
  const cachedData = useMemo(() => {
    if (!availability.lastWorkingDay) return null;
    return getCachedWrappedData(availability.lastWorkingDay, monthString);
  }, [availability.lastWorkingDay, monthString]);
  
  // Memoize data processing function
  const processWrappedData = useCallback(() => {
    if (!availability.lastWorkingDay) return;
    
    if (cachedData) {
      // Use cached data if available (priority)
      console.log('Using cached Wrapped data from previous snapshot');
      setWrappedData(cachedData);
      setIsDataLoaded(true);
      return;
    }
    
    // Determine whether we should cache current data
    const shouldCache = availability.daysUntilLastWorkingDay !== undefined && 
                       (availability.daysUntilLastWorkingDay <= 0);
    
    // Determine whether we can use current data
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
      console.error('No cached data available for previous semester Wrapped');
      setIsDataLoaded(false);
    }
  }, [availability, cachedData, marks, courses, attendance, monthString]);
  
  // Update availability when it changes
  useEffect(() => {
    setWrappedAvailability(availability);
  }, [availability]);
  
  // Process data when dependencies change
  useEffect(() => {
    if (calendar && calendar.length > 0 && marks.length > 0) {
      processWrappedData();
    }
  }, [calendar, marks, courses, attendance, processWrappedData]);
  
  return {
    wrappedAvailability,
    wrappedData,
    isDataLoaded
  };
};
