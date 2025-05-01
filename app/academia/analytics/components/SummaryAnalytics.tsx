"use client";

import React from "react";
import { Mark } from "@/types/Marks";
import { Course } from "@/types/Course";
import { AttendanceCourse } from "@/types/Attendance";
import { Calendar } from "@/types/Calendar";

interface SummaryAnalyticsProps {
  marks?: Mark[];
  courses?: Course[];
  attendance?: AttendanceCourse[];
  calendar?: Calendar[];
}

const SummaryAnalytics: React.FC<SummaryAnalyticsProps> = ({
  marks = [],
  courses = [],
  attendance = [],
  calendar = []
}) => {
  // Calculate overall marks statistics
  const totalMarksScored = marks.reduce((sum, mark) => sum + Number(mark.overall.scored || 0), 0);
  const totalMarksAvailable = marks.reduce((sum, mark) => sum + Number(mark.overall.total || 0), 0);
  const overallMarksPercentage = totalMarksAvailable > 0 
    ? (totalMarksScored / totalMarksAvailable) * 100 
    : 0;
  
  // Calculate overall attendance statistics
  const attendanceData = attendance.map(course => {
    const present = Number(course.hoursConducted) - Number(course.hoursAbsent);
    const total = Number(course.hoursConducted);
    return { present, total };
  });
  
  const totalPresent = attendanceData.reduce((sum, course) => sum + course.present, 0);
  const totalClasses = attendanceData.reduce((sum, course) => sum + course.total, 0);
  const overallAttendancePercentage = totalClasses > 0 
    ? (totalPresent / totalClasses) * 100 
    : 0;

  // Calculate CGPA (simplified estimation)
  const totalCredits = courses.reduce((sum, course) => sum + Number(course.credit || 0), 0);
  const totalGradePoints = marks.reduce((sum, mark) => {
    const percentage = Number(mark.overall.scored || 0) / Number(mark.overall.total || 1) * 100;
    let gradePoint = 0;
    
    if (percentage >= 90) gradePoint = 10;
    else if (percentage >= 80) gradePoint = 9;
    else if (percentage >= 70) gradePoint = 8;
    else if (percentage >= 60) gradePoint = 7;
    else if (percentage >= 50) gradePoint = 6;
    else if (percentage >= 45) gradePoint = 5;
    else if (percentage >= 40) gradePoint = 4;
    else gradePoint = 0;
    
    const course = courses.find(c => c.code === mark.courseCode);
    return sum + (gradePoint * Number(course?.credit || 0));
  }, 0);
  
  const estimatedCGPA = totalCredits > 0 
    ? (totalGradePoints / totalCredits).toFixed(2)
    : "N/A";

  // Performance status
  const getPerformanceStatus = () => {
    if (overallMarksPercentage >= 75 && overallAttendancePercentage >= 85) {
      return {
        status: "Excellent",
        color: "text-light-success-color dark:text-dark-success-color",
        message: "Keep up the great work! Your performance is outstanding."
      };
    } else if (overallMarksPercentage >= 60 && overallAttendancePercentage >= 75) {
      return {
        status: "Good",
        color: "text-light-accent dark:text-dark-accent",
        message: "You're doing well. Focus on improving a bit more to reach excellence."
      };
    } else if (overallMarksPercentage >= 50 && overallAttendancePercentage >= 65) {
      return {
        status: "Average",
        color: "text-light-warn-color dark:text-dark-warn-color",
        message: "Your performance is average. Consider focusing more on studies and attendance."
      };
    } else {
      return {
        status: "Needs Improvement",
        color: "text-light-error-color dark:text-dark-error-color",
        message: "Your performance needs significant improvement. Consider seeking academic guidance."
      };
    }
  };

  const performanceData = getPerformanceStatus();

  return (
    <section id="summary" className="w-full scroll-mt-20">
      <h2 className="text-2xl font-semibold pl-1">Performance Summary</h2>
      
      <div className="my-4 p-5 bg-light-background-normal dark:bg-dark-background-normal rounded-xl shadow-sm">
        {/* Performance Status */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Overall Status</h3>
          <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-light-accent dark:text-dark-accent font-medium">Performance Status:</p>
              <p className={`text-xl font-bold ${performanceData.color}`}>{performanceData.status}</p>
            </div>
            <p className="text-sm mt-2 text-light-color/70 dark:text-dark-color/70">{performanceData.message}</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Marks */}
          <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-2">Marks Overview</h3>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-semibold ${
                  overallMarksPercentage >= 75 
                    ? "text-light-success-color dark:text-dark-success-color" 
                    : overallMarksPercentage >= 60 
                      ? "text-light-warn-color dark:text-dark-warn-color" 
                      : "text-light-error-color dark:text-dark-error-color"
                }`}>
                  {overallMarksPercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-light-color/60 dark:text-dark-color/60">Overall Score</p>
              </div>
              <p className="text-sm text-light-color/60 dark:text-dark-color/60">
                {totalMarksScored.toFixed(0)}/{totalMarksAvailable}
              </p>
            </div>
            <div className="mt-3 h-2 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  overallMarksPercentage >= 75 
                    ? "bg-light-success-color dark:bg-dark-success-color" 
                    : overallMarksPercentage >= 60 
                      ? "bg-light-warn-color dark:bg-dark-warn-color" 
                      : "bg-light-error-color dark:bg-dark-error-color"
                }`}
                style={{ width: `${Math.min(overallMarksPercentage, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Attendance */}
          <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-2">Attendance Overview</h3>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-semibold ${
                  overallAttendancePercentage >= 75 
                    ? "text-light-success-color dark:text-dark-success-color" 
                    : "text-light-error-color dark:text-dark-error-color"
                }`}>
                  {overallAttendancePercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-light-color/60 dark:text-dark-color/60">Overall Attendance</p>
              </div>
              <p className="text-sm text-light-color/60 dark:text-dark-color/60">
                {totalPresent}/{totalClasses} hrs
              </p>
            </div>
            <div className="mt-3 h-2 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  overallAttendancePercentage >= 75 
                    ? "bg-light-success-color dark:bg-dark-success-color" 
                    : "bg-light-error-color dark:bg-dark-error-color"
                }`}
                style={{ width: `${Math.min(overallAttendancePercentage, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Estimated CGPA */}
          <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-2">CGPA Estimation</h3>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-semibold ${
                  Number(estimatedCGPA) >= 8 
                    ? "text-light-success-color dark:text-dark-success-color" 
                    : Number(estimatedCGPA) >= 6 
                      ? "text-light-warn-color dark:text-dark-warn-color" 
                      : "text-light-error-color dark:text-dark-error-color"
                }`}>
                  {estimatedCGPA}
                </p>
                <p className="text-sm text-light-color/60 dark:text-dark-color/60">Estimated CGPA</p>
              </div>
              <p className="text-sm text-light-color/60 dark:text-dark-color/60">
                {totalCredits} Credits
              </p>
            </div>
            <div className="mt-3 h-2 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  Number(estimatedCGPA) >= 8 
                    ? "bg-light-success-color dark:bg-dark-success-color" 
                    : Number(estimatedCGPA) >= 6 
                      ? "bg-light-warn-color dark:bg-dark-warn-color" 
                      : "bg-light-error-color dark:bg-dark-error-color"
                }`}
                style={{ width: `${Math.min((Number(estimatedCGPA) / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Course Distribution */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Course Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
              <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-3">By Category</h4>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-sm bg-light-accent dark:bg-dark-accent"></div>
                    <p className="text-sm">Theory</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-sm bg-light-warn-color dark:bg-dark-warn-color"></div>
                    <p className="text-sm">Practical</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-sm bg-light-success-color dark:bg-dark-success-color"></div>
                    <p className="text-sm">Other</p>
                  </div>
                </div>
                <div className="flex-1 h-32 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-8 border-light-accent dark:border-dark-accent relative">
                    <div className="absolute inset-0 rounded-full border-t-8 border-r-8 border-light-warn-color dark:border-dark-warn-color rotate-45"></div>
                    <div className="absolute inset-0 rounded-full border-l-8 border-b-8 border-light-success-color dark:border-dark-success-color -rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
              <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-3">By Credit</h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm">4 Credits</p>
                  <p className="text-sm font-medium">{courses.filter(c => Number(c.credit) === 4).length} Courses</p>
                </div>
                <div className="h-2 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-light-success-color dark:bg-dark-success-color"
                    style={{ width: `${(courses.filter(c => Number(c.credit) === 4).length / courses.length) * 100}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm">3 Credits</p>
                  <p className="text-sm font-medium">{courses.filter(c => Number(c.credit) === 3).length} Courses</p>
                </div>
                <div className="h-2 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-light-warn-color dark:bg-dark-warn-color"
                    style={{ width: `${(courses.filter(c => Number(c.credit) === 3).length / courses.length) * 100}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm">2 Credits</p>
                  <p className="text-sm font-medium">{courses.filter(c => Number(c.credit) === 2).length} Courses</p>
                </div>
                <div className="h-2 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-light-accent dark:bg-dark-accent"
                    style={{ width: `${(courses.filter(c => Number(c.credit) === 2).length / courses.length) * 100}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm">1 Credit</p>
                  <p className="text-sm font-medium">{courses.filter(c => Number(c.credit) === 1).length} Courses</p>
                </div>
                <div className="h-2 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-light-error-color dark:bg-dark-error-color"
                    style={{ width: `${(courses.filter(c => Number(c.credit) === 1).length / courses.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SummaryAnalytics;