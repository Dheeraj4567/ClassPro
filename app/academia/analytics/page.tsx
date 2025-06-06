import React from "react";
import { fetchUserData } from "@/hooks/fetchUserData";
import { fetchCalendar } from "@/hooks/fetchCalendar";
import AnalyticsClient from "./components/AnalyticsClient";
import NavBarWrapper from "./components/NavBarWrapper";
import { MobileProvider } from "./components/MobileContext";

export default async function Analytics() {
  // Fetch data on the server
  const userData = await fetchUserData();
  const calendarData = await fetchCalendar();
  
  const { marks, attendance, courses } = userData;

  return (
    <>
      <div id="items" className="flex flex-col gap-12 px-3 py-2">
        <section id="analytics-header">
          <h1 className="text-3xl font-semibold text-light-color dark:text-dark-color">
            Analytics
          </h1>
          <p className="text-md font-medium text-light-accent opacity-80 dark:text-dark-accent">
            Performance insights and metrics
          </p>
        </section>

        {/* Wrap client components with MobileProvider */}
        <MobileProvider>
          <AnalyticsClient 
            marks={marks?.marks} 
            courses={courses?.courses} 
            attendance={attendance?.attendance} 
            calendar={calendarData?.calendar} 
          />
        </MobileProvider>
      </div>
      <NavBarWrapper />
    </>
  );
}