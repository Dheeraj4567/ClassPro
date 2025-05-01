import React from "react";
import { fetchUserData } from "@/hooks/fetchUserData";
import { fetchCalendar } from "@/hooks/fetchCalendar";
import dynamic from "next/dynamic";

// Using dynamic imports with ssr disabled to ensure client-side only rendering
const MarksAnalytics = dynamic(() => import("./components/MarksAnalytics"), { ssr: false });
const AttendanceAnalytics = dynamic(() => import("./components/AttendanceAnalytics"), { ssr: false });

export default async function Analytics() {
  // Fetch data on the server
  const userData = await fetchUserData();
  const calendarData = await fetchCalendar();
  
  const { marks, attendance, courses } = userData;

  return (
    <div className="flex flex-col gap-12 px-3 py-2">
      <section id="analytics-header">
        <h1 className="text-3xl font-semibold text-light-color dark:text-dark-color">
          Analytics
        </h1>
        <p className="text-md font-medium text-light-accent opacity-80 dark:text-dark-accent">
          Performance insights and metrics
        </p>
      </section>

      {/* Pass data to client components */}
      <MarksAnalytics marks={marks?.marks} courses={courses?.courses} />
      <AttendanceAnalytics attendance={attendance?.attendance} calendar={calendarData?.calendar} />
    </div>
  );
}