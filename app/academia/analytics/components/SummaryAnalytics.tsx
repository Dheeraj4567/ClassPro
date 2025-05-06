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

  // Calculate CGPA with enhanced algorithm using GradeX approach
  const calculateCGPA = () => {
    if (!marks.length || !courses.length) {
      return { 
        cgpa: "N/A", 
        averageCGPA: "N/A",
        bestCGPA: "N/A",
        projectedRange: "N/A",
        midPointCGPA: "N/A",
        highScoreProbability: 0 
      };
    }

    // Calculate total credits with a safety check
    const totalCredits = courses.reduce((sum, course) => sum + Number(course.credit || 0), 0);
    
    // Guard against division by zero
    if (totalCredits === 0) {
      return { 
        cgpa: "0.00", 
        averageCGPA: "0.00",
        bestCGPA: "0.00",
        projectedRange: "0.00 - 0.00",
        midPointCGPA: "0.00",
        highScoreProbability: 0 
      };
    }
    
    // Calculate current CGPA based on existing marks
    // Using the GradeX approach for projecting potential scores
    const totalGradePoints = marks.reduce((sum, mark) => {
      const scored = Number(mark.overall.scored || 0);
      const total = Number(mark.overall.total || 1);
      
      // Using GradeX approach: For incomplete assessments, assume remaining marks
      let potentialScore;
      if (total < 60) {
        // For courses where internal assessments are not yet complete (total < 60)
        // Assume student will get remaining internal marks (up to 60) plus end sem marks (up to 40)
        const maxRemainingInternal = 60 - total;
        const maxExternal = 40; // End semester exam marks
        potentialScore = Math.min(100, scored + maxRemainingInternal + maxExternal);
      } else {
        // For completed assessments or those already over 60 marks
        // Just use the actual percentage
        potentialScore = total === 100 ? scored : (scored / total) * 100;
      }
      
      // Calculate grade point based on potential score
      let gradePoint = 0;
      
      // SRM University specific grading scale (10-point relative grading system)
      if (potentialScore >= 91) gradePoint = 10;      // S/O Grade
      else if (potentialScore >= 81) gradePoint = 9;  // A+ Grade
      else if (potentialScore >= 71) gradePoint = 8;  // A Grade  
      else if (potentialScore >= 61) gradePoint = 7;  // B+ Grade
      else if (potentialScore >= 56) gradePoint = 6;  // B Grade
      else if (potentialScore >= 50) gradePoint = 5;  // C Grade
      else gradePoint = 0;                           // F Grade (Fail)
      
      const course = courses.find(c => c.code === mark.courseCode);
      return sum + (gradePoint * Number(course?.credit || 0));
    }, 0);
    
    const currentCGPA = (totalGradePoints / totalCredits).toFixed(2);
    const currentCGPANum = parseFloat(currentCGPA);
    
    // For projected CGPA calculations, calculate a more optimistic projection
    // that assumes even better performance in remaining assessments
    
    // Average case: Modest improvement over current projected CGPA
    const avgImprovement = Math.min(0.5, (10 - currentCGPANum) * 0.2);
    const averageCGPA = Math.min(10, currentCGPANum + avgImprovement).toFixed(2);
    
    // Best case: More significant improvement assuming maximum performance
    const bestImprovement = Math.min(1.0, (10 - currentCGPANum) * 0.35);
    const bestCGPA = Math.min(10, currentCGPANum + bestImprovement).toFixed(2);
    
    // Calculate mid-point of range (for progress bar visualization)
    const midPointCGPA = ((parseFloat(averageCGPA) + parseFloat(bestCGPA)) / 2).toFixed(2);
    
    // Format as range
    const projectedRange = `${averageCGPA} - ${bestCGPA}`;
    
    // Calculate probability of getting higher grades
    let highScoreProbability = 0;
    
    // Base probability on current CGPA using SRM's scale - optimistic values
    if (currentCGPANum >= 9.5) {
      highScoreProbability = 98;
    } else if (currentCGPANum >= 9) {
      highScoreProbability = 95;
    } else if (currentCGPANum >= 8.5) {
      highScoreProbability = 90;
    } else if (currentCGPANum >= 8) {
      highScoreProbability = 85;
    } else if (currentCGPANum >= 7.5) {
      highScoreProbability = 80;
    } else if (currentCGPANum >= 7) {
      highScoreProbability = 75;
    } else if (currentCGPANum >= 6.5) {
      highScoreProbability = 70;
    } else if (currentCGPANum >= 6) {
      highScoreProbability = 65;
    } else if (currentCGPANum >= 5.5) {
      highScoreProbability = 60;
    } else if (currentCGPANum >= 5) {
      highScoreProbability = 55;
    } else {
      highScoreProbability = 45;
    }
    
    // Cap at 99% - almost perfect certainty in the optimistic model
    highScoreProbability = Math.min(99, Math.max(40, highScoreProbability));
    
    return { 
      cgpa: currentCGPA,
      averageCGPA,
      bestCGPA,
      projectedRange,
      midPointCGPA,
      highScoreProbability
    };
  };
  
  const cgpaData = calculateCGPA();

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
      
      <div className="my-4 p-3 sm:p-5 bg-light-background-normal dark:bg-dark-background-normal rounded-xl shadow-sm">
        {/* Performance Status - Improved for mobile */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg font-medium mb-2">Overall Status</h3>
          <div className="bg-light-background-light dark:bg-dark-background-light p-3 sm:p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <p className="text-light-accent dark:text-dark-accent font-medium mb-1 sm:mb-0">Performance Status:</p>
              <p className={`text-xl font-bold ${performanceData.color}`}>{performanceData.status}</p>
            </div>
            <p className="text-sm mt-2 text-light-color/70 dark:text-dark-color/70">{performanceData.message}</p>
          </div>
        </div>

        {/* Key Metrics - Improved layout for mobile */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Marks */}
          <div className="bg-light-background-light dark:bg-dark-background-light p-3 sm:p-4 rounded-lg">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-2">Marks Overview</h3>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-2xl sm:text-3xl font-semibold ${
                  overallMarksPercentage >= 75 
                    ? "text-light-success-color dark:text-dark-success-color" 
                    : overallMarksPercentage >= 60 
                      ? "text-light-warn-color dark:text-dark-warn-color" 
                      : "text-light-error-color dark:text-dark-error-color"
                }`}>
                  {overallMarksPercentage.toFixed(1)}%
                </p>
                <p className="text-xs sm:text-sm text-light-color/60 dark:text-dark-color/60">Overall Score</p>
              </div>
              <p className="text-xs sm:text-sm text-light-color/60 dark:text-dark-color/60">
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
          <div className="bg-light-background-light dark:bg-dark-background-light p-3 sm:p-4 rounded-lg">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-2">Attendance Overview</h3>
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-2xl sm:text-3xl font-semibold ${
                  overallAttendancePercentage >= 75 
                    ? "text-light-success-color dark:text-dark-success-color" 
                    : "text-light-error-color dark:text-dark-error-color"
                }`}>
                  {overallAttendancePercentage.toFixed(1)}%
                </p>
                <p className="text-xs sm:text-sm text-light-color/60 dark:text-dark-color/60">Overall Attendance</p>
              </div>
              <p className="text-xs sm:text-sm text-light-color/60 dark:text-dark-color/60">
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
          
          {/* Estimated CGPA - Mobile optimized */}
          <div className="bg-light-background-light dark:bg-dark-background-light p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-2">CGPA Estimation</h3>
                </p>
                <p className="text-sm font-medium">{cgpaData.projectedRange}</p>
              </div>
            </div>
            <div className="mt-3 relative">
              <div className="h-2 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                {/* Current CGPA marker */}
                <div 
                  className={`h-full ${
                    Number(cgpaData.cgpa) >= 8 
                      ? "bg-light-success-color dark:bg-dark-success-color" 
                      : Number(cgpaData.cgpa) >= 6 
                        ? "bg-light-warn-color dark:bg-dark-warn-color" 
                        : "bg-light-error-color dark:bg-dark-error-color"
                  }`}
                  style={{ width: `${Math.min((Number(cgpaData.cgpa) / 10) * 100, 100)}%` }}
                />
                {/* Projected range overlay */}
                <div
                  className="absolute top-0 h-2 bg-light-accent dark:bg-dark-accent opacity-50"
                  style={{ 
                    left: `${Math.min((Number(cgpaData.cgpa) / 10) * 100, 100)}%`, 
                    width: `${((Number(cgpaData.bestCGPA) - Number(cgpaData.cgpa)) / 10) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1 text-light-color/50 dark:text-dark-color/50">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-light-background-normal dark:bg-dark-background-normal p-2 text-center">
                <p className="text-xs text-light-color/50 dark:text-dark-color/50">Average Case</p>
                <p className="font-medium">{cgpaData.averageCGPA}</p>
              </div>
              <div className="rounded-lg bg-light-background-normal dark:bg-dark-background-normal p-2 text-center">
                <p className="text-xs text-light-color/50 dark:text-dark-color/50">Best Case</p>
                <p className="font-medium">{cgpaData.bestCGPA}</p>
              </div>
            </div>

            <div className="mt-2 hidden sm:block">
              <p className="text-xs sm:text-sm text-light-color/60 dark:text-dark-color/60">
                Probability of achieving 80-100% marks: <span className="font-medium">{cgpaData.highScoreProbability}%</span>
              </p>
            </div>
            
            <div className="mt-2 p-2 bg-light-background-normal dark:bg-dark-background-normal rounded text-xs text-light-color/70 dark:text-dark-color/70 hidden sm:block">
              <p>This is an estimate based on your current academic performance. The range shows potential outcomes from average to best-case scenarios.</p>
            </div>
          </div>
        </div>

        {/* Course Distribution - Improved for mobile */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Course Distribution</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* By Category - Mobile optimized */}
            <div className="bg-light-background-light dark:bg-dark-background-light p-3 sm:p-4 rounded-lg">
              <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-3">By Category</h4>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex flex-row sm:flex-col justify-center gap-4 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-sm bg-light-accent dark:bg-dark-accent"></div>
                    <p className="text-xs sm:text-sm">Theory</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-sm bg-light-warn-color dark:bg-dark-warn-color"></div>
                    <p className="text-xs sm:text-sm">Practical</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-sm bg-light-success-color dark:bg-dark-success-color"></div>
                    <p className="text-xs sm:text-sm">Other</p>
                  </div>
                </div>
                <div className="flex-1 h-28 sm:h-32 flex items-center justify-center">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-8 border-light-accent dark:border-dark-accent relative">
                    <div className="absolute inset-0 rounded-full border-t-8 border-r-8 border-light-warn-color dark:border-dark-warn-color rotate-45"></div>
                    <div className="absolute inset-0 rounded-full border-l-8 border-b-8 border-light-success-color dark:border-dark-success-color -rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* By Credit - Mobile optimized */}
            <div className="bg-light-background-light dark:bg-dark-background-light p-3 sm:p-4 rounded-lg">
              <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-3">By Credit</h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm">4 Credits</p>
                  <p className="text-xs sm:text-sm font-medium">{courses.filter(c => Number(c.credit) === 4).length} Courses</p>
                </div>
                <div className="h-2 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-light-success-color dark:bg-dark-success-color"
                    style={{ width: `${(courses.filter(c => Number(c.credit) === 4).length / courses.length) * 100}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs sm:text-sm">3 Credits</p>
                  <p className="text-xs sm:text-sm font-medium">{courses.filter(c => Number(c.credit) === 3).length} Courses</p>
                </div>
                <div className="h-2 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-light-warn-color dark:bg-dark-warn-color"
                    style={{ width: `${(courses.filter(c => Number(c.credit) === 3).length / courses.length) * 100}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs sm:text-sm">2 Credits</p>
                  <p className="text-xs sm:text-sm font-medium">{courses.filter(c => Number(c.credit) === 2).length} Courses</p>
                </div>
                <div className="h-2 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-light-accent dark:bg-dark-accent"
                    style={{ width: `${(courses.filter(c => Number(c.credit) === 2).length / courses.length) * 100}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs sm:text-sm">1 Credit</p>
                  <p className="text-xs sm:text-sm font-medium">{courses.filter(c => Number(c.credit) === 1).length} Courses</p>
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