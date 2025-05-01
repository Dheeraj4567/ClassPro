"use client";

import React from "react";
import { Mark } from "@/types/Marks";
import { Course } from "@/types/Course";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface MarksAnalyticsProps {
  marks?: Mark[];
  courses?: Course[];
}

const MarksAnalytics: React.FC<MarksAnalyticsProps> = ({ marks = [], courses = [] }) => {
  // If no marks data available, show placeholder
  if (!marks?.length) {
    return (
      <section className="w-full">
        <h2 className="text-2xl font-semibold pl-1">Marks Analytics</h2>
        <div className="my-4 flex items-center justify-center py-16 rounded-xl bg-light-background-dark dark:bg-dark-background-dark">
          <p className="text-light-accent dark:text-dark-accent opacity-80">No marks data available</p>
        </div>
      </section>
    );
  }

  // Create data for the bar chart
  const chartData = marks.map(mark => {
    const courseName = mark.courseName.split(':')[0];
    const course = courses?.find(c => c.code === mark.courseCode) || null;
    
    return {
      name: courseName,
      courseCode: mark.courseCode,
      courseType: mark.courseType,
      creditPoints: course?.credit || "0",
      scored: Number(mark.overall.scored || 0),
      total: Number(mark.overall.total || 0),
      percentage: (Number(mark.overall.scored || 0) / Number(mark.overall.total || 1)) * 100
    };
  });

  // Group courses by type for better organization
  const theoryCourses = chartData.filter(course => course.courseType === "Theory");
  const practicalCourses = chartData.filter(course => course.courseType === "Practical");

  // Calculate overall marks statistics
  const totalScored = chartData.reduce((sum, course) => sum + course.scored, 0);
  const totalMarks = chartData.reduce((sum, course) => sum + course.total, 0);
  const overallPercentage = (totalScored / totalMarks) * 100;

  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-light-background-light dark:bg-dark-background-normal p-4 rounded-lg shadow-lg border border-light-button dark:border-dark-button">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-light-accent dark:text-dark-accent">{data.courseCode}</p>
          <div className="mt-2">
            <p className="text-sm">
              Marks: <span className="font-medium">{data.scored} / {data.total}</span>
            </p>
            <p className="text-sm">
              Percentage: <span 
                className={`font-medium ${
                  data.percentage >= 75 
                    ? "text-light-success-color dark:text-dark-success-color" 
                    : data.percentage >= 60 
                      ? "text-light-warn-color dark:text-dark-warn-color" 
                      : "text-light-error-color dark:text-dark-error-color"
                }`}
              >
                {data.percentage.toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="w-full">
      <h2 className="text-2xl font-semibold pl-1">Marks Analytics</h2>
      
      <div className="my-4 p-5 bg-light-background-normal dark:bg-dark-background-normal rounded-xl shadow-sm">
        {/* Total marks summary card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-4 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Total Marks Achieved</h3>
            <p className="text-3xl font-semibold">{totalScored.toFixed(1)}</p>
            <p className="text-lg text-light-color/60 dark:text-dark-color/60">/ {totalMarks}</p>
          </div>
          
          <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-4 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Overall Percentage</h3>
            <p className={`text-3xl font-semibold ${
              overallPercentage >= 75 
                ? "text-light-success-color dark:text-dark-success-color" 
                : overallPercentage >= 60 
                  ? "text-light-warn-color dark:text-dark-warn-color" 
                  : "text-light-error-color dark:text-dark-error-color"
            }`}>
              {overallPercentage.toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-4 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Total Courses</h3>
            <p className="text-3xl font-semibold">{chartData.length}</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs rounded-full bg-light-warn-background text-light-warn-color dark:bg-dark-warn-background dark:text-dark-warn-color px-2 py-0.5">
                Theory: {theoryCourses.length}
              </span>
              <span className="text-xs rounded-full bg-light-success-background text-light-success-color dark:bg-dark-success-background dark:text-dark-success-color px-2 py-0.5">
                Practical: {practicalCourses.length}
              </span>
            </div>
          </div>
        </div>
        
        {/* Total marks achieved vs. total marks graph */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Total Marks Achieved vs Total Marks</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                  height={80}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Bar 
                  name="Total Marks" 
                  dataKey="total" 
                  fill="var(--color-light-background-dark)"
                  fillOpacity={0.7} 
                  className="dark:fill-dark-background-dark"
                />
                <Bar 
                  name="Marks Achieved" 
                  dataKey="scored" 
                  fill="var(--color-light-accent)"
                  className="dark:fill-dark-accent" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Percentage graph */}
        <div className="mt-12">
          <h3 className="text-lg font-medium mb-4">Marks Percentage by Course</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                  height={80}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Bar 
                  name="Percentage" 
                  dataKey="percentage" 
                  fill="var(--color-light-accent)" 
                  className="dark:fill-dark-accent"
                  barSize={30}
                >
                  {chartData.map((entry, index) => (
                    <rect
                      key={`cell-${index}`}
                      fill={
                        entry.percentage >= 75
                          ? "var(--color-light-success-color)"
                          : entry.percentage >= 60
                          ? "var(--color-light-warn-color)"
                          : "var(--color-light-error-color)"
                      }
                      className={
                        entry.percentage >= 75
                          ? "dark:fill-dark-success-color"
                          : entry.percentage >= 60
                          ? "dark:fill-dark-warn-color"
                          : "dark:fill-dark-error-color"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarksAnalytics;