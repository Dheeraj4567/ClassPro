"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mark } from '@/types/Marks';
import { Course } from '@/types/Course';
import { AttendanceCourse } from '@/types/Attendance';
import { Calendar } from '@/types/Calendar';
import { isClassProWrappedAvailable } from '@/utils/semesterTimings';
import { useWrappedData } from '@/hooks/useWrappedData';
import { lightHaptics } from '@/utils/haptics';
import dynamic from 'next/dynamic';

// Dynamically import the ClassProWrapped component with loading state
const WrappedPage = dynamic(() => import('@/app/academia/wrapped/page'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <div className="w-20 h-20 border-4 border-t-light-accent dark:border-t-dark-accent border-light-background-light dark:border-dark-background-light rounded-full animate-spin"></div>
      <p className="mt-6 text-xl font-medium text-light-color dark:text-dark-color">Loading your semester story...</p>
    </div>
  ),
});

interface WrappedRouteProps {
  marks: Mark[];
  courses: Course[];
  attendance: AttendanceCourse[];
  calendar: Calendar[];
}

export default function WrappedRoute(props: WrappedRouteProps) {
  const router = useRouter();
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  
  // Use our custom hook to get the wrapped data and availability
  const { wrappedAvailability, wrappedData, isDataLoaded } = useWrappedData(props);
  
  // Check if ClassProWrapped is available, redirect if not
  useEffect(() => {
    setCheckingAvailability(true);
    
    if (props.calendar && props.calendar.length > 0) {
      const { isAvailable } = isClassProWrappedAvailable(props.calendar);
      
      if (!isAvailable) {
        lightHaptics();
        router.push('/academia/analytics');
      } else {
        setCheckingAvailability(false);
      }
    }
  }, [props.calendar, router]);
  
  // If checking availability or not available, show loading
  if (checkingAvailability) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-4 border-t-light-accent dark:border-t-dark-accent border-light-background-light dark:border-dark-background-light rounded-full animate-spin"></div>
        <p className="mt-6 text-xl font-medium text-light-color dark:text-dark-color">Checking availability...</p>
      </div>
    );
  }
  
  // If data is not loaded yet, show loading
  if (!isDataLoaded) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-4 border-t-light-accent dark:border-t-dark-accent border-light-background-light dark:border-dark-background-light rounded-full animate-spin"></div>
        <p className="mt-6 text-xl font-medium text-light-color dark:text-dark-color">Preparing your Wrapped...</p>
      </div>
    );
  }
  
  // If data is loaded, show the wrapped page
  return <WrappedPage />;
}
