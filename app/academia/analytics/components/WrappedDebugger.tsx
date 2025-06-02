// Debug component to verify ClassProWrapped feature availability
"use client";

import React, { useState, useEffect } from 'react';
import { isClassProWrappedAvailable } from '@/utils/semesterTimings';
import { Calendar } from '@/types/Calendar';

interface WrappedDebugProps {
  calendar: Calendar[];
}

/**
 * Debug component to see the status of ClassProWrapped feature
 * and test its availability with mock dates
 */
const WrappedDebugger: React.FC<WrappedDebugProps> = ({ calendar }) => {
  const [availability, setAvailability] = useState<{
    isAvailable: boolean;
    daysRemaining?: number;
    lastWorkingDay?: any;
  }>({ isAvailable: false });
  
  const [testDate, setTestDate] = useState<string>('');
  const [originalDate, setOriginalDate] = useState<Date>(new Date());
  const [isMocking, setIsMocking] = useState<boolean>(false);
  
  // Get actual availability on component mount
  useEffect(() => {
    if (calendar && calendar.length > 0) {
      const currentAvailability = isClassProWrappedAvailable(calendar);
      setAvailability(currentAvailability);
    }
  }, [calendar]);
  
  // Function to test with a specific date
  const testWithDate = () => {
    if (!testDate) return;
    
    // Save the original date for restoration
    if (!isMocking) {
      setOriginalDate(new Date());
    }
    
    try {
      // Mock the Date constructor
      const MockDate = class extends Date {
        constructor(value?: string | number | Date, month?: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number) {
          if (arguments.length === 0) {
            super(testDate);
          } else if (arguments.length === 1) {
            super(value as any);
          } else {
            super(
              value as any, 
              month as number, 
              date as number, 
              hours as number, 
              minutes as number, 
              seconds as number, 
              ms as number
            );
          }
        }
      };
      
      // Override global Date
      const OriginalDate = Date;
      global.Date = MockDate as DateConstructor;
      setIsMocking(true);
      
      // Calculate availability with the mocked date
      const mockedAvailability = isClassProWrappedAvailable(calendar);
      setAvailability(mockedAvailability);
      
    } catch (e) {
      console.error("Error mocking date:", e);
    }
  };
  
  // Restore the original date function
  const restoreRealDate = () => {
    if (isMocking) {
      // @ts-ignore - This is for testing only
      delete global.Date;
      setIsMocking(false);
      
      // Get real availability
      const realAvailability = isClassProWrappedAvailable(calendar);
      setAvailability(realAvailability);
    }
  };
  
  return (
    <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
      <h2 className="text-lg font-bold mb-2">ClassProWrapped Debug</h2>
      
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded mb-4">
        <h3 className="font-medium">Current Status:</h3>
        <p className="mt-1">
          <span className="font-medium">Available:</span>{' '}
          <span className={availability.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            {availability.isAvailable ? 'Yes' : 'No'}
          </span>
        </p>
        
        {availability.isAvailable && availability.daysRemaining !== undefined && (
          <p className="mt-1">
            <span className="font-medium">Days Remaining:</span> {availability.daysRemaining}
          </p>
        )}
        
        {availability.lastWorkingDay && (
          <p className="mt-1">
            <span className="font-medium">Last Working Day:</span> {availability.lastWorkingDay.date} 
            {availability.lastWorkingDay.event ? ` (${availability.lastWorkingDay.event})` : ''}
          </p>
        )}
        
        <p className="mt-1">
          <span className="font-medium">Current Date:</span>{' '}
          {isMocking ? (
            <span className="text-orange-500 dark:text-orange-400">
              {new Date().toLocaleDateString()} (Mocked)
            </span>
          ) : (
            new Date().toLocaleDateString()
          )}
        </p>
      </div>
      
      <div className="space-y-3">
        <div>
          <label htmlFor="test-date" className="block text-sm font-medium mb-1">Test with a specific date:</label>
          <div className="flex gap-2">
            <input
              id="test-date"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            />
            <button 
              onClick={testWithDate}
              disabled={!testDate}
              className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Test
            </button>
            
            {isMocking && (
              <button 
                onClick={restoreRealDate}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                Restore Real Date
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WrappedDebugger;
