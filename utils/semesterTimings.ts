// Utils for determining semester timings and availability periods

import { Calendar, Day } from "@/types/Calendar";
import { Mark } from "@/types/Marks";
import { Course } from "@/types/Course";
import { AttendanceCourse } from "@/types/Attendance";

// Type definitions for Wrapped data
interface WrappedCacheData {
  timestamp: number;
  semesterId: string;
  lastWorkingDayDate: string;
  data: {
    marks: Mark[];
    courses: Course[];
    attendance: AttendanceCourse[];
  };
}

/**
 * Determines if the current date is within the ClassProWrapped availability window
 * (Available for 1 month after the semester's last working day)
 * 
 * @param calendar The calendar data containing semester information
 * @returns Object containing availability status, days remaining, and last working day
 */
export const isClassProWrappedAvailable = (calendar: Calendar[]): { 
  isAvailable: boolean; 
  daysRemaining?: number;
  lastWorkingDay?: Day;
  daysUntilLastWorkingDay?: number;
} => {
  if (!calendar || calendar.length === 0) {
    return { isAvailable: false };
  }

  // Find the semester's last working day from the calendar
  const lastWorkingDayData = findLastWorkingDay(calendar);
  
  if (!lastWorkingDayData) {
    return { isAvailable: false };
  }

  const { day: lastWorkingDay, month } = lastWorkingDayData;

  // Calculate if we're within the 1-month availability window after the last working day
  const today = new Date();
  const lastWorkingDate = parseCalendarDate(lastWorkingDay.date, month);
  
  if (!lastWorkingDate) {
    return { isAvailable: false };
  }
  
  // Calculate the end of the availability window (30 days after last working day)
  const availabilityEndDate = new Date(lastWorkingDate);
  availabilityEndDate.setDate(lastWorkingDate.getDate() + 30);
  
  // Wrapped is available from the last working day onwards for 30 days
  const isAvailable = today >= lastWorkingDate && today <= availabilityEndDate;
  
  // Calculate days remaining and days until last working day
  let daysRemaining: number | undefined;
  let daysUntilLastWorkingDay: number | undefined;
  
  if (today < lastWorkingDate) {
    // Before the last working day - not available yet
    daysUntilLastWorkingDay = Math.ceil((lastWorkingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  } else if (isAvailable) {
    // After last working day but within availability window
    daysUntilLastWorkingDay = 0;
    daysRemaining = Math.ceil((availabilityEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  return { 
    isAvailable, 
    daysRemaining,
    daysUntilLastWorkingDay,
    lastWorkingDay
  };
};

/**
 * Find the semester's last working day from calendar data
 * Looks for specific events like "Last Working Day" or end of semester indicators
 */
const findLastWorkingDay = (calendar: Calendar[]): { day: Day; month: string } | undefined => {
  // Start by looking for a day with "Last Working Day" or similar in the event
  for (const monthData of calendar) {
    for (const day of monthData.days) {
      if (day.event && 
        (day.event.includes("Last Working Day") || 
         day.event.includes("End of Semester") ||
         day.event.includes("Last Day of Classes"))
      ) {
        return { day, month: monthData.month };
      }
    }
  }
  
  // If no explicit last day found, look for start of examination period
  for (const monthData of calendar) {
    for (const day of monthData.days) {
      if (day.event && 
        (day.event.includes("Examination Begins") || 
         day.event.includes("Final Exams Begin") ||
         day.event.includes("End of Teaching Period"))
      ) {
        // Return the previous day as the last working day before exams
        const index = monthData.days.indexOf(day);
        if (index > 0) {
          return { day: monthData.days[index - 1], month: monthData.month };
        }
        return { day, month: monthData.month };
      }
    }
  }
  
  // If still no day found, use the last day in the calendar as a fallback
  if (calendar.length > 0) {
    const lastMonth = calendar[calendar.length - 1];
    if (lastMonth.days.length > 0) {
      return { 
        day: lastMonth.days[lastMonth.days.length - 1], 
        month: lastMonth.month 
      };
    }
  }
  
  return undefined;
};

/**
 * Parse a date string from calendar format to a Date object
 * Handles both full format (DD-MM-YYYY) and day-only format (D or DD)
 */
const parseCalendarDate = (dateString: string, month?: string): Date | null => {
  try {
    // Check if it's a full date format (DD-MM-YYYY)
    if (dateString.includes('-')) {
      const [day, monthNum, year] = dateString.split('-').map(Number);
      // JS months are 0-based (0-11)
      return new Date(year, monthNum - 1, day);
    }
    
    // If it's just a day number and we have month context
    if (month && !dateString.includes('-')) {
      const day = parseInt(dateString);
      const currentYear = new Date().getFullYear();
      
      // Extract month name and year from month string (e.g., "May'25")
      const monthParts = month.split("'");
      const monthName = monthParts[0].trim().toLowerCase();
      const yearSuffix = monthParts[1];
      
      // Convert month name to number
      const monthMap: { [key: string]: number } = {
        "january": 0, "february": 1, "march": 2, "april": 3, "may": 4, "june": 5,
        "july": 6, "august": 7, "september": 8, "october": 9, "november": 10, "december": 11
      };
      
      const monthIndex = monthMap[monthName];
      if (monthIndex === undefined) {
        console.error("Unknown month name:", monthName);
        return null;
      }
      
      // Handle year - if it's a 2-digit year like '25', assume 20xx
      let fullYear = currentYear;
      if (yearSuffix) {
        const yearNum = parseInt(yearSuffix);
        if (yearNum >= 0 && yearNum <= 99) {
          fullYear = 2000 + yearNum;
        }
      }
      
      return new Date(fullYear, monthIndex, day);
    }
    
    console.error("Unable to parse date - insufficient information:", dateString, month);
    return null;
  } catch (e) {
    console.error("Failed to parse date:", dateString, month, e);
    return null;
  }
};

/**
 * Get a unique identifier for the current semester
 * This allows tracking wrapped viewing status per-semester
 * 
 * @param lastWorkingDay The last working day of the semester
 * @param monthString The month string from calendar (e.g., "May'25")
 * @returns String ID for the current semester
 */
export const getSemesterId = (lastWorkingDay?: Day, monthString?: string): string => {
  let year: number;
  let month: number;
  
  if (lastWorkingDay) {
    // Check if it's a full date format (DD-MM-YYYY)
    if (lastWorkingDay.date.includes('-')) {
      const dateParts = lastWorkingDay.date.split('-').map(Number);
      if (dateParts.length === 3) {
        year = dateParts[2]; // Year is at index 2 (DD-MM-YYYY)
        month = dateParts[1]; // Month is at index 1 (DD-MM-YYYY)
      } else {
        // Fallback to current date
        const now = new Date();
        year = now.getFullYear();
        month = now.getMonth() + 1; // JS months are 0-indexed
      }
    } else if (monthString) {
      // Handle day-only format with month context
      const monthParts = monthString.split("'");
      const monthName = monthParts[0].trim().toLowerCase();
      const yearSuffix = monthParts[1];
      
      // Convert month name to number
      const monthMap: { [key: string]: number } = {
        "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
        "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12
      };
      
      month = monthMap[monthName] || new Date().getMonth() + 1;
      
      // Handle year - if it's a 2-digit year like '25', assume 20xx
      if (yearSuffix) {
        const yearNum = parseInt(yearSuffix);
        if (yearNum >= 0 && yearNum <= 99) {
          year = 2000 + yearNum;
        } else {
          year = new Date().getFullYear();
        }
      } else {
        year = new Date().getFullYear();
      }
    } else {
      // Fallback to current date
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1; // JS months are 0-indexed
    }
  } else {
    // No lastWorkingDay provided, use current date
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1; // JS months are 0-indexed
  }
  
  // Simple semester identification logic
  // First half: Jan-Jun, Second half: Jul-Dec
  const semesterHalf = month <= 6 ? '1' : '2';
  
  return `${year}-${semesterHalf}`;
};

/**
 * Cache the wrapped data for the current semester
 * This ensures we don't recalculate data after the last working day
 * 
 * @param marks Student's marks data
 * @param courses Student's courses data
 * @param attendance Student's attendance data
 * @param lastWorkingDay The last working day of the semester
 * @param monthString The month string from calendar (e.g., "May'25")
 */
export const cacheWrappedData = (
  marks: Mark[],
  courses: Course[],
  attendance: AttendanceCourse[],
  lastWorkingDay: Day,
  monthString?: string
) => {
  if (typeof window === 'undefined') return;
  
  try {
    const semesterId = getSemesterId(lastWorkingDay, monthString);
    const cacheData: WrappedCacheData = {
      timestamp: Date.now(),
      semesterId,
      lastWorkingDayDate: lastWorkingDay.date,
      data: {
        marks,
        courses,
        attendance
      }
    };
    
    localStorage.setItem('classProWrappedCache', JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching wrapped data:', error);
  }
};

/**
 * Retrieve cached wrapped data for the current semester
 * Returns undefined if no cached data exists or if it's from a different semester
 * 
 * @param lastWorkingDay The last working day used to determine the current semester
 * @param monthString The month string from calendar (e.g., "May'25")
 * @returns The cached wrapped data or undefined if not available
 */
export const getCachedWrappedData = (lastWorkingDay: Day, monthString?: string): WrappedCacheData['data'] | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  try {
    const cachedDataString = localStorage.getItem('classProWrappedCache');
    if (!cachedDataString) return undefined;
    
    const cachedData: WrappedCacheData = JSON.parse(cachedDataString);
    const currentSemesterId = getSemesterId(lastWorkingDay, monthString);
    
    // Only use cached data if it's for the current semester
    if (cachedData.semesterId === currentSemesterId) {
      return cachedData.data;
    }
    
    return undefined;
  } catch (error) {
    console.error('Error retrieving cached wrapped data:', error);
    return undefined;
  }
};
