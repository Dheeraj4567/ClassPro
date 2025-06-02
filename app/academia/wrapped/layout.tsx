"use client";

import React, { useEffect, useState } from 'react';
import { Mark } from '@/types/Marks';
import { Course } from '@/types/Course';
import { AttendanceCourse } from '@/types/Attendance';
import { Calendar } from '@/types/Calendar';
import { useRouter } from 'next/navigation';
import { isClassProWrappedAvailable, getCachedWrappedData, cacheWrappedData } from '@/utils/semesterTimings';
import { useWrappedData } from '@/hooks/useWrappedData';

// This layout component fetches the necessary data and passes it to page components
export default function WrappedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    marks: Mark[];
    courses: Course[];
    attendance: AttendanceCourse[];
    calendar: Calendar[];
  }>({
    marks: [],
    courses: [],
    attendance: [],
    calendar: []
  });

  // Fetch data and check availability
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
    try {
    // Fetch calendar first to check availability
    const calendarRes = await fetch('/api/calendar');
    const calendarData = await calendarRes.json();
    const calendar = calendarData.calendar || [];
    
    // Check if wrapped is available
    const availability = isClassProWrappedAvailable(calendar);
    
    if (!availability.isAvailable) {
      // Redirect if not available
      router.push('/academia/analytics');
      return;
    }
    
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
    
    // If we have a last working day, check for cached data
    if (availability.lastWorkingDay) {
      const cachedData = getCachedWrappedData(availability.lastWorkingDay, monthString);
      
      if (cachedData) {
        // Use cached data if available
        setData({
          ...cachedData,
          calendar
        });
        setIsLoading(false);
        return;
      }
    }
    
    // No cached data, fetch fresh data - try to use the consolidated wrapped API first
    try {
      const wrappedRes = await fetch('/api/wrapped');
      const wrappedData = await wrappedRes.json();
      
      // If we got a successful response, use the data from the wrapped API
      if (wrappedData && wrappedData.marks && wrappedData.courses && wrappedData.attendance) {
        setData({
          marks: wrappedData.marks,
          courses: wrappedData.courses,
          attendance: wrappedData.attendance,
          calendar
        });
        
        // If we're on or after the last working day, cache this data
        if (availability.lastWorkingDay && 
            availability.daysUntilLastWorkingDay !== undefined && 
            availability.daysUntilLastWorkingDay <= 0) {
          cacheWrappedData(
            wrappedData.marks, 
            wrappedData.courses, 
            wrappedData.attendance, 
            availability.lastWorkingDay,
            monthString
          );
        }
        
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error fetching from wrapped API, falling back to individual endpoints:', error);
    }
    
    // Fallback to individual API endpoints
    const [marksRes, coursesRes, attendanceRes] = await Promise.all([
      fetch('/api/marks'),
      fetch('/api/courses'),
      fetch('/api/attendance')
    ]);
    
    const marks = await marksRes.json();
    const courses = await coursesRes.json();
    const attendance = await attendanceRes.json();
        
        setData({
          marks,
          courses,
          attendance,
          calendar
        });
      } catch (error) {
        console.error('Error fetching data for ClassProWrapped:', error);
        
        // Fallback to mock data if API calls fail
        const mockData = getMockData();
        setData(mockData);
      }
      
      setIsLoading(false);
    }
    
    fetchData();
  }, [router]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-light-background-normal dark:bg-dark-background-normal">
        <div className="w-20 h-20 border-4 border-t-light-accent dark:border-t-dark-accent border-light-background-light dark:border-dark-background-light rounded-full animate-spin"></div>
        <p className="mt-6 text-xl font-medium text-light-color dark:text-dark-color">Loading your ClassPro Wrapped...</p>
      </div>
    );
  }

  // Fallback data for development/testing
  function getMockData() {
    const marks: Mark[] = [
      {
        courseCode: "CSE101",
        courseName: "Introduction to Computer Science",
        courseType: "Theory",
        overall: { scored: "82", total: "100" },
        testPerformance: [
          { test: "Continuous", marks: { scored: "40", total: "50" } },
          { test: "Term", marks: { scored: "42", total: "50" } }
        ]
      },
      {
        courseCode: "MAT202",
        courseName: "Advanced Mathematics",
        courseType: "Theory",
        overall: { scored: "75", total: "100" },
        testPerformance: [
          { test: "Continuous", marks: { scored: "35", total: "50" } },
          { test: "Term", marks: { scored: "40", total: "50" } }
        ]
      },
      {
        courseCode: "ENG303",
        courseName: "Technical Writing",
        courseType: "Theory",
        overall: { scored: "91", total: "100" },
        testPerformance: [
          { test: "Continuous", marks: { scored: "45", total: "50" } },
          { test: "Term", marks: { scored: "46", total: "50" } }
        ]
      },
      {
        courseCode: "PHY101",
        courseName: "Physics Fundamentals",
        courseType: "Theory",
        overall: { scored: "78", total: "100" },
        testPerformance: [
          { test: "Continuous", marks: { scored: "38", total: "50" } },
          { test: "Term", marks: { scored: "40", total: "50" } }
        ]
      }
    ];

    const courses: Course[] = [
      { 
        code: "CSE101", 
        title: "Introduction to Computer Science", 
        credit: "4", 
        slot: "A",
        academicYear: "2024-25",
        category: "Core",
        courseCategory: "Regular",
        faculty: "Dr. Smith",
        room: "CS101",
        slotType: "Theory",
        type: "Regular"
      },
      { 
        code: "MAT202", 
        title: "Advanced Mathematics", 
        credit: "4", 
        slot: "B",
        academicYear: "2024-25",
        category: "Core",
        courseCategory: "Regular",
        faculty: "Dr. Johnson",
        room: "MA203",
        slotType: "Theory",
        type: "Regular"
      },
      { 
        code: "ENG303", 
        title: "Technical Writing", 
        credit: "3", 
        slot: "C",
        academicYear: "2024-25",
        category: "Elective",
        courseCategory: "Regular",
        faculty: "Prof. Williams",
        room: "EN105",
        slotType: "Theory",
        type: "Regular"
      },
      { 
        code: "PHY101", 
        title: "Physics Fundamentals", 
        credit: "4", 
        slot: "D",
        academicYear: "2024-25",
        category: "Core",
        courseCategory: "Regular",
        faculty: "Dr. Brown",
        room: "PH201",
        slotType: "Theory",
        type: "Regular"
      }
    ];

    const attendance: AttendanceCourse[] = [
      { 
        courseCode: "CSE101", 
        courseTitle: "Introduction to Computer Science", 
        attendancePercentage: "92", 
        hoursAbsent: "4", 
        hoursConducted: "50",
        category: "Theory",
        facultyName: "Dr. Smith",
        slot: "A"
      },
      { 
        courseCode: "MAT202", 
        courseTitle: "Advanced Mathematics", 
        attendancePercentage: "86", 
        hoursAbsent: "7", 
        hoursConducted: "50",
        category: "Theory",
        facultyName: "Dr. Johnson",
        slot: "B"
      },
      { 
        courseCode: "ENG303", 
        courseTitle: "Technical Writing", 
        attendancePercentage: "95", 
        hoursAbsent: "2", 
        hoursConducted: "40",
        category: "Theory",
        facultyName: "Prof. Williams",
        slot: "C"
      },
      { 
        courseCode: "PHY101", 
        courseTitle: "Physics Fundamentals", 
        attendancePercentage: "78", 
        hoursAbsent: "11", 
        hoursConducted: "50",
        category: "Theory",
        facultyName: "Dr. Brown",
        slot: "D"
      }
    ];
    
    // Sample calendar with last working day
    const calendar: Calendar[] = [
      {
        month: "May",
        days: [
          { date: "14-05-2025", day: "Wednesday", dayOrder: "1" },
          { date: "15-05-2025", day: "Thursday", event: "Last Working Day", dayOrder: "2" }
        ]
      }
    ];
    
    return { marks, courses, attendance, calendar };
  }

  // Pass the data to children
  return (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // Need to use as any to avoid TypeScript issues with prop passing
          return React.cloneElement(child as any, { 
            marks: data.marks, 
            courses: data.courses, 
            attendance: data.attendance 
          });
        }
        return child;
      })}
    </>
  );
}
