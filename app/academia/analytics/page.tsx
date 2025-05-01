import React from "react";
import { fetchUserData } from "@/hooks/fetchUserData";
import { fetchCalendar } from "@/hooks/fetchCalendar";
import dynamic from "next/dynamic";

// Using dynamic imports to resolve component loading issues
const MarksAnalytics = dynamic(() => import("./components/MarksAnalytics"));
const AttendanceAnalytics = dynamic(() => import("./components/AttendanceAnalytics"));

export default async function Analytics() {
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

      <MarksAnalytics marks={marks?.marks} courses={courses?.courses} />
      <AttendanceAnalytics attendance={attendance?.attendance} calendar={calendarData?.calendar} />
    </div>
  );
}