import React, { useEffect, useState } from 'react';
import { isClassProWrappedAvailable } from '@/utils/semesterTimings';

export default function WrappedDebugInfo({ calendar }: { calendar: any[] }) {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (calendar && calendar.length > 0) {
      const availability = isClassProWrappedAvailable(calendar);
      console.log('Calendar data:', calendar);
      console.log('Wrapped availability:', availability);
      setDebugInfo({
        calendarLength: calendar.length,
        availability,
        calendarSample: calendar.slice(0, 2) // Show first 2 months
      });
    }
  }, [calendar]);

  if (!debugInfo) {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50">
        <h3 className="font-bold">Wrapped Debug</h3>
        <p>No calendar data</p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg z-50 max-w-sm">
      <h3 className="font-bold">Wrapped Debug</h3>
      <p>Calendar months: {debugInfo.calendarLength}</p>
      <p>Available: {String(debugInfo.availability.isAvailable)}</p>
      <p>Days remaining: {debugInfo.availability.daysRemaining || 'N/A'}</p>
      <p>Last working day: {debugInfo.availability.lastWorkingDay?.date || 'Not found'}</p>
      <details className="mt-2">
        <summary className="cursor-pointer">Calendar sample</summary>
        <pre className="text-xs mt-1 overflow-auto max-h-40">
          {JSON.stringify(debugInfo.calendarSample, null, 2)}
        </pre>
      </details>
    </div>
  );
}
