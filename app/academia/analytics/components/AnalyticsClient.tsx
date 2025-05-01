"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Mark } from "@/types/Marks";
import { Course } from "@/types/Course";
import { AttendanceCourse } from "@/types/Attendance";
import { Calendar } from "@/types/Calendar";

// Using dynamic imports with ssr disabled to ensure client-side only rendering
const MarksAnalytics = dynamic(() => import("./MarksAnalytics"), { ssr: false });
const AttendanceAnalytics = dynamic(() => import("./AttendanceAnalytics"), { ssr: false });

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
      <MarksAnalytics marks={marks} courses={courses} />
      <AttendanceAnalytics attendance={attendance} calendar={calendar} />
    </>
  );
};

export default AnalyticsClient;