"use client";

import React from "react";
import { Mark } from "@/types/Marks";
import { Course } from "@/types/Course";
import { AttendanceCourse } from "@/types/Attendance";
import { Calendar } from "@/types/Calendar";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface PerformanceAnalyticsProps {
  marks?: Mark[];
  courses?: Course[];
  attendance?: AttendanceCourse[];
  calendar?: Calendar[];
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  marks = [],
  courses = [],
  attendance = [],
  calendar = []
}) => {
  // Calculate performance data for each course
  const performanceData = marks.map(mark => {
    const courseName = mark.courseName.split(':')[0];
    const attendanceRecord = attendance.find(a => a.courseCode === mark.courseCode);
    
    const marksPercentage = Number(mark.overall.scored || 0) / Number(mark.overall.total || 1) * 100;
    const attendancePercentage = attendanceRecord 
      ? ((Number(attendanceRecord.hoursConducted) - Number(attendanceRecord.hoursAbsent)) / Number(attendanceRecord.hoursConducted)) * 100
      : 0;
    
    // Calculate an overall performance score
    const performanceScore = (marksPercentage * 0.7) + (attendancePercentage * 0.3);
    
    return {
      name: courseName,
      courseCode: mark.courseCode,
      courseType: mark.courseType,
      marksPercentage: marksPercentage.toFixed(1),
      attendancePercentage: attendancePercentage.toFixed(1),
      performanceScore: performanceScore.toFixed(1)
    };
  });

  // Sort courses by performance score
  const sortedPerformance = [...performanceData].sort((a, b) => 
    Number(b.performanceScore) - Number(a.performanceScore)
  );

  // Data for the radar chart
  const skillData = [
    { subject: 'Assignment Completion', A: 85, fullMark: 100 },
    { subject: 'Study Consistency', A: 70, fullMark: 100 },
    { subject: 'Test Performance', A: marks.length > 0 ? 
      marks.reduce((sum, mark) => sum + (Number(mark.overall.scored || 0) / Number(mark.overall.total || 1)) * 100, 0) / marks.length : 0, 
      fullMark: 100 },
    { subject: 'Attendance', A: attendance.length > 0 ? 
      attendance.reduce((sum, course) => {
        const percent = ((Number(course.hoursConducted) - Number(course.hoursAbsent)) / Number(course.hoursConducted)) * 100;
        return sum + percent;
      }, 0) / attendance.length : 0, 
      fullMark: 100 },
    { subject: 'Time Management', A: 75, fullMark: 100 },
    { subject: 'Participation', A: 80, fullMark: 100 },
  ];

  // Generate some improvement recommendations
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Check average marks
    const avgMarks = marks.reduce((sum, mark) => 
      sum + (Number(mark.overall.scored || 0) / Number(mark.overall.total || 1) * 100), 0) / marks.length;
    
    if (avgMarks < 60) {
      recommendations.push({
        area: "Academic Performance",
        recommendation: "Consider forming study groups or seeking additional help from professors.",
        priority: "High",
        color: "text-light-error-color dark:text-dark-error-color"
      });
    }
    
    // Check attendance
    const avgAttendance = attendance.reduce((sum, course) => {
      const percent = ((Number(course.hoursConducted) - Number(course.hoursAbsent)) / Number(course.hoursConducted)) * 100;
      return sum + percent;
    }, 0) / attendance.length;
    
    if (avgAttendance < 75) {
      recommendations.push({
        area: "Attendance",
        recommendation: "Your attendance is below the required minimum. Focus on improving your attendance.",
        priority: "High",
        color: "text-light-error-color dark:text-dark-error-color"
      });
    } else if (avgAttendance < 85) {
      recommendations.push({
        area: "Attendance",
        recommendation: "Your attendance is satisfactory but could be improved.",
        priority: "Medium",
        color: "text-light-warn-color dark:text-dark-warn-color"
      });
    }
    
    // Look for courses with poor performance
    const poorPerformanceCourses = performanceData.filter(course => Number(course.performanceScore) < 60);
    if (poorPerformanceCourses.length > 0) {
      recommendations.push({
        area: "Course Focus",
        recommendation: `Focus more attention on courses: ${poorPerformanceCourses.map(c => c.name).join(', ')}`,
        priority: "Medium",
        color: "text-light-warn-color dark:text-dark-warn-color"
      });
    }
    
    // Always add a positive recommendation
    recommendations.push({
      area: "Time Management",
      recommendation: "Consider using a study planner to organize your study sessions more effectively.",
      priority: "Low",
      color: "text-light-accent dark:text-dark-accent"
    });
    
    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <section id="performance" className="w-full scroll-mt-20">
      <h2 className="text-2xl font-semibold pl-1">Performance Analysis</h2>
      
      <div className="my-4 p-5 bg-light-background-normal dark:bg-dark-background-normal rounded-xl shadow-sm">
        {/* Course Performance Ranking */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Course Performance Ranking</h3>
          <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedPerformance}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    name="Overall Performance" 
                    dataKey="performanceScore" 
                    fill="var(--color-light-accent)"
                    className="dark:fill-dark-accent"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Skill Assessment */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Skill Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
              <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-3">Your Skills Radar</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={skillData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar 
                      name="Your Skills" 
                      dataKey="A" 
                      stroke="var(--color-light-accent)" 
                      fill="var(--color-light-accent)" 
                      fillOpacity={0.6} 
                      className="dark:stroke-dark-accent dark:fill-dark-accent"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
              <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-3">Performance Trend</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={performanceData} 
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tickFormatter={(value) => value.length > 8 ? `${value.substring(0, 8)}...` : value}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="marksPercentage" 
                      name="Marks %" 
                      stroke="var(--color-light-error-color)" 
                      className="dark:stroke-dark-error-color"
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="attendancePercentage" 
                      name="Attendance %" 
                      stroke="var(--color-light-success-color)" 
                      className="dark:stroke-dark-success-color"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Recommendations */}
        <div>
          <h3 className="text-lg font-medium mb-4">Improvement Recommendations</h3>
          <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
            <div className="flex flex-col gap-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{rec.area}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rec.color === "text-light-error-color dark:text-dark-error-color" 
                      ? "bg-light-error-background dark:bg-dark-error-background" 
                      : rec.color === "text-light-warn-color dark:text-dark-warn-color"
                      ? "bg-light-warn-background dark:bg-dark-warn-background"
                      : "bg-light-accent/10 dark:bg-dark-accent/10"
                    } ${rec.color}`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="text-sm text-light-color/70 dark:text-dark-color/70">{rec.recommendation}</p>
                  {index < recommendations.length - 1 && <hr className="border-t-light-side dark:border-t-dark-side my-2" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerformanceAnalytics;