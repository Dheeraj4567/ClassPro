"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Mark } from "@/types/Marks";
import { Course } from "@/types/Course";
import { AttendanceCourse } from "@/types/Attendance";
import { Calendar } from "@/types/Calendar";

// Using dynamic imports for all analytics components
const SummaryAnalytics = dynamic(() => import("./SummaryAnalytics"), { ssr: false });
const MarksAnalytics = dynamic(() => import("./MarksAnalytics"), { ssr: false });
const AttendanceAnalytics = dynamic(() => import("./AttendanceAnalytics"), { ssr: false });
const PerformanceAnalytics = dynamic(() => import("./PerformanceAnalytics"), { ssr: false });

interface AnalyticsClientProps {
  marks?: Mark[];
  courses?: Course[];
  attendance?: AttendanceCourse[];
  calendar?: Calendar[];
}

const AnalyticsClient: React.FC<AnalyticsClientProps> = ({
  marks = [],
  courses = [],
  attendance = [],
  calendar = []
}) => {
  return (
    <>
      <SummaryAnalytics 
        marks={marks} 
        courses={courses} 
        attendance={attendance} 
        calendar={calendar} 
      />
      
      <div id="marks">
        <MarksAnalytics marks={marks} courses={courses} />
      </div>
      
      <div id="attendance">
        <AttendanceAnalytics attendance={attendance} calendar={calendar} />
      </div>
      
      <PerformanceAnalytics 
        marks={marks} 
        courses={courses} 
        attendance={attendance} 
        calendar={calendar} 
      />
    </>
  );
};

export default AnalyticsClient;