"use client";

import React, { useState } from "react";
import { AttendanceCourse } from "@/types/Attendance";
import { Calendar } from "@/types/Calendar";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';

interface AttendanceAnalyticsProps {
  attendance?: AttendanceCourse[];
  calendar?: Calendar[];
}

// Define the interface for selected course data
interface SelectedCourseData {
  facultyName: string;
  courseCode: string;
  courseTitle: string;
  slot: string;
  hoursConducted: number;
  hoursPresent: number;
  hoursAbsent: number;
  attendancePercentage: number;
}

const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({ attendance = [], calendar = [] }) => {
  // State to track the selected course for detailed view
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourseData | null>(null);
  // State for chart display orientation on mobile
  const [mobileView, setMobileView] = useState<'vertical' | 'horizontal'>('horizontal');

  // If no attendance data available, show placeholder
  if (!attendance?.length) {
    return (
      <section className="w-full">
        <h2 className="text-2xl font-semibold pl-1">Attendance Analytics</h2>
        <div className="my-4 flex items-center justify-center py-16 rounded-xl bg-light-background-dark dark:bg-dark-background-dark">
          <p className="text-light-accent dark:text-dark-accent opacity-80">No attendance data available</p>
        </div>
      </section>
    );
  }
  
  // Create processed data for charts
  const chartData = attendance.map(course => {
    const hoursPresent = Number(course.hoursConducted) - Number(course.hoursAbsent);
    const attendancePercentage = (hoursPresent / Number(course.hoursConducted)) * 100;
    
    return {
      facultyName: course.facultyName,
      courseCode: course.courseCode,
      courseTitle: course.courseTitle,
      slot: course.slot,
      hoursConducted: Number(course.hoursConducted),
      hoursPresent,
      hoursAbsent: Number(course.hoursAbsent),
      attendancePercentage
    };
  });

  // Calculate overall attendance statistics
  const totalConducted = chartData.reduce((sum, course) => sum + course.hoursConducted, 0);
  const totalPresent = chartData.reduce((sum, course) => sum + course.hoursPresent, 0);
  const totalAbsent = chartData.reduce((sum, course) => sum + course.hoursAbsent, 0);
  const overallAttendancePercentage = totalConducted > 0 ? (totalPresent / totalConducted) * 100 : 0;

  // Handle click on a bar to show detailed information
  const handleCourseClick = (data: SelectedCourseData) => {
    setSelectedCourse(data);
  };
  
  // Toggle mobile chart view between horizontal and vertical
  const toggleMobileView = () => {
    setMobileView(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  };

  // Identify low attendance courses
  const lowAttendanceCourses = chartData.filter(course => course.attendancePercentage < 75);
  
  // Data for overall attendance pie chart
  const pieData = [
    { name: "Present", value: totalPresent, fill: "var(--color-light-success-color)" },
    { name: "Absent", value: totalAbsent, fill: "var(--color-light-error-color)" }
  ];

  // Colors for the charts
  const COLORS = ["var(--color-light-success-color)", "var(--color-light-error-color)"];
  const DARK_COLORS = ["var(--color-dark-success-color)", "var(--color-dark-error-color)"];

  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-light-background-light dark:bg-dark-background-normal p-3 rounded-lg shadow-lg border border-light-button dark:border-dark-button">
          <p className="font-semibold text-sm">{data.courseTitle || data.courseCode}</p>
          <div className="mt-2">
            <p className="text-xs">Hours Present: <span className="font-medium">{data.hoursPresent}</span></p>
            <p className="text-xs">Hours Absent: <span className="font-medium">{data.hoursAbsent}</span></p>
            <p className="text-xs">
              Attendance: <span 
                className={`font-medium ${
                  data.attendancePercentage >= 75
                    ? "text-light-success-color dark:text-dark-success-color" 
                    : "text-light-error-color dark:text-dark-error-color"
                }`}
              >
                {data.attendancePercentage.toFixed(1)}%
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
      <h2 className="text-2xl font-semibold pl-1">Attendance Analytics</h2>
      
      <div className="my-4 p-3 sm:p-5 bg-light-background-normal dark:bg-dark-background-normal rounded-xl shadow-sm">
        {/* Overall attendance summary cards - Mobile friendly grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
          <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-3 sm:p-4 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Overall Attendance</h3>
            <p className={`text-2xl sm:text-3xl font-semibold ${
              overallAttendancePercentage >= 75 
                ? "text-light-success-color dark:text-dark-success-color" 
                : "text-light-error-color dark:text-dark-error-color"
            }`}>
              {overallAttendancePercentage.toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-3 sm:p-4 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Hours Present/Total</h3>
            <div className="flex items-baseline">
              <p className="text-2xl sm:text-3xl font-semibold">{totalPresent}</p>
              <p className="text-base sm:text-lg text-light-color/60 dark:text-dark-color/60 ml-1">/ {totalConducted}</p>
            </div>
          </div>
          
          <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-3 sm:p-4 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Low Attendance</h3>
            {lowAttendanceCourses.length > 0 ? (
              <div className="flex flex-col items-center">
                <p className="text-2xl sm:text-3xl font-semibold text-light-error-color dark:text-dark-error-color">
                  {lowAttendanceCourses.length}
                </p>
                <p className="text-xs text-center mt-1">
                  {lowAttendanceCourses.length} course{lowAttendanceCourses.length === 1 ? '' : 's'} below 75%
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-2xl sm:text-3xl font-semibold text-light-success-color dark:text-dark-success-color">0</p>
                <p className="text-xs text-center mt-1">All courses above 75% 👏</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile view toggle control */}
        <div className="block sm:hidden mb-4">
          <button 
            onClick={toggleMobileView}
            className="w-full py-2 px-3 bg-light-background-light dark:bg-dark-background-light rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <span>Switch to {mobileView === 'horizontal' ? 'Vertical' : 'Horizontal'} View</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
              <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
              <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
              <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
            </svg>
          </button>
        </div>
        
        {/* Course-wise Attendance Table - Responsive for mobile */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Course-wise Attendance</h3>
          <div className="bg-light-background-light dark:bg-dark-background-light p-2 sm:p-4 rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-light-button/20 dark:border-dark-button/20">
                    <th className="text-left p-2">Course</th>
                    <th className="text-right p-2">Hours</th>
                    <th className="text-right p-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((course, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-light-button/10 dark:border-dark-button/10 hover:bg-light-background-dark hover:dark:bg-dark-background-dark cursor-pointer"
                      onClick={() => handleCourseClick(course)}
                    >
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{course.courseTitle || course.courseCode}</p>
                          <p className="text-xs text-light-accent dark:text-dark-accent">
                            {course.courseCode} • {course.slot}
                          </p>
                        </div>
                      </td>
                      <td className="p-2 text-right">{course.hoursPresent}/{course.hoursConducted}</td>
                      <td className="p-2 text-right">
                        <span className={
                          course.attendancePercentage >= 75
                            ? "text-light-success-color dark:text-dark-success-color" 
                            : "text-light-error-color dark:text-dark-error-color"
                        }>
                          {course.attendancePercentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-center text-light-color/60 dark:text-dark-color/60 mt-2">
              Tap on any course for detailed information
            </p>
          </div>
        </div>
        
        {/* Overall attendance distribution */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart for overall attendance */}
          <div>
            <h3 className="text-lg font-medium mb-4">Overall Attendance Distribution</h3>
            <div className="bg-light-background-light dark:bg-dark-background-light p-3 sm:p-4 rounded-lg">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill}
                          className={index === 0 
                            ? "dark:fill-dark-success-color" 
                            : "dark:fill-dark-error-color"
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-light-success-color dark:bg-dark-success-color"></div>
                  <p className="text-xs">Present ({totalPresent} hrs)</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-light-error-color dark:bg-dark-error-color"></div>
                  <p className="text-xs">Absent ({totalAbsent} hrs)</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Course attendance comparison */}
          <div>
            <h3 className="text-lg font-medium mb-4">Course Attendance Comparison</h3>
            <div className="bg-light-background-light dark:bg-dark-background-light p-3 sm:p-4 rounded-lg">
              <div className={`h-64 w-full ${mobileView === 'vertical' ? 'min-h-[400px]' : ''}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout={mobileView === 'vertical' && window.innerWidth < 640 ? 'vertical' : 'horizontal'}
                    margin={{ 
                      top: 5, 
                      right: 10, 
                      left: mobileView === 'vertical' && window.innerWidth < 640 ? 60 : 0, 
                      bottom: mobileView === 'horizontal' || window.innerWidth >= 640 ? 40 : 10 
                    }}
                    onClick={(data) => data?.activePayload && handleCourseClick(data.activePayload[0].payload)}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    {mobileView === 'vertical' && window.innerWidth < 640 ? (
                      <>
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis 
                          dataKey="courseCode" 
                          type="category"
                          width={50}
                          tick={{ fontSize: 10 }}
                        />
                      </>
                    ) : (
                      <>
                        <XAxis 
                          dataKey="courseCode" 
                          angle={0}
                          tick={{ fontSize: 10 }}
                          interval={0}
                        />
                        <YAxis domain={[0, 100]} />
                      </>
                    )}
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar 
                      name="Attendance %" 
                      dataKey="attendancePercentage" 
                      fill="var(--color-light-accent)" 
                      className="dark:fill-dark-accent cursor-pointer"
                      barSize={20}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.attendancePercentage >= 75 
                            ? "var(--color-light-success-color)" 
                            : "var(--color-light-error-color)"
                          }
                          className={entry.attendancePercentage >= 75 
                            ? "dark:fill-dark-success-color cursor-pointer" 
                            : "dark:fill-dark-error-color cursor-pointer"
                          } 
                        />
                      ))}
                    </Bar>
                    {/* Attendance threshold line at 75% */}
                    <line 
                      x1={mobileView === 'vertical' ? '75' : '0'} 
                      y1={mobileView === 'vertical' ? '0' : '75'} 
                      x2={mobileView === 'vertical' ? '75' : '100%'}
                      y2={mobileView === 'vertical' ? '100%' : '75'} 
                      stroke="var(--color-light-warn-color)"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      className="dark:stroke-dark-warn-color"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detailed Course Modal - Mobile optimized */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-2">
            <div className="bg-light-background-normal dark:bg-dark-background-normal rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">{selectedCourse.courseTitle || selectedCourse.courseCode}</h3>
                    <p className="text-xs sm:text-sm text-light-accent dark:text-dark-accent">
                      {selectedCourse.courseCode} • {selectedCourse.slot}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="text-light-color/60 dark:text-dark-color/60 hover:text-light-accent hover:dark:text-dark-accent"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <p className="text-sm mb-1">Faculty: <span className="font-medium">{selectedCourse.facultyName}</span></p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-3 flex flex-col items-center justify-center">
                    <h4 className="text-xs font-medium text-light-accent dark:text-dark-accent mb-1">Hours Present</h4>
                    <p className="text-xl font-semibold text-light-success-color dark:text-dark-success-color">
                      {selectedCourse.hoursPresent}
                    </p>
                  </div>
                  
                  <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-3 flex flex-col items-center justify-center">
                    <h4 className="text-xs font-medium text-light-accent dark:text-dark-accent mb-1">Hours Absent</h4>
                    <p className="text-xl font-semibold text-light-error-color dark:text-dark-error-color">
                      {selectedCourse.hoursAbsent}
                    </p>
                  </div>
                  
                  <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-3 flex flex-col items-center justify-center">
                    <h4 className="text-xs font-medium text-light-accent dark:text-dark-accent mb-1">Attendance %</h4>
                    <p className={`text-xl font-semibold ${
                      selectedCourse.attendancePercentage >= 75
                        ? "text-light-success-color dark:text-dark-success-color" 
                        : "text-light-error-color dark:text-dark-error-color"
                    }`}>
                      {selectedCourse.attendancePercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-3 sm:p-4 mb-6">
                  <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-3">Attendance Gauge</h4>
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart 
                        cx="50%" 
                        cy="50%" 
                        innerRadius="40%" 
                        outerRadius="100%" 
                        barSize={14} 
                        data={[
                          {
                            name: 'Attendance',
                            value: selectedCourse.attendancePercentage,
                            fill: selectedCourse.attendancePercentage >= 75 
                              ? "var(--color-light-success-color)" 
                              : "var(--color-light-error-color)",
                            className: selectedCourse.attendancePercentage >= 75 
                              ? "dark:fill-dark-success-color" 
                              : "dark:fill-dark-error-color"
                          }
                        ]}
                        startAngle={180} 
                        endAngle={0}
                      >
                        <RadialBar
                          background
                          dataKey="value"
                          cornerRadius={10}
                        />
                        {/* Custom label element for percentage display */}
                        <g>
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="central"
                            style={{ 
                              fill: 'currentColor',
                              fontSize: '18px',
                              fontWeight: 600 
                            }}
                          >
                            {selectedCourse.attendancePercentage.toFixed(1)}%
                          </text>
                        </g>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {selectedCourse.attendancePercentage < 75 && (
                  <div className="bg-light-error-background dark:bg-dark-error-background p-3 rounded-lg mb-6">
                    <div className="flex gap-2 items-center text-light-error-color dark:text-dark-error-color">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <p className="text-sm font-medium">Attendance Warning</p>
                    </div>
                    <p className="text-xs mt-1 text-light-error-color dark:text-dark-error-color">
                      Your attendance is below the required 75%. Consider attending classes more regularly to meet the minimum requirement.
                    </p>
                  </div>
                )}
                
                {/* Calculate classes needed to reach 75% if below threshold */}
                {selectedCourse.attendancePercentage < 75 && (
                  <div className="bg-light-warn-background dark:bg-dark-warn-background p-3 rounded-lg mb-6">
                    <div className="flex gap-2 items-center text-light-warn-color dark:text-dark-warn-color">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                      </svg>
                      <p className="text-sm font-medium">Attendance Recovery Plan</p>
                    </div>
                    
                    {(() => {
                      // Calculate classes needed to reach 75%
                      const totalClasses = selectedCourse.hoursConducted;
                      const presentClasses = selectedCourse.hoursPresent;
                      
                      // Formula: (present + x) / (total + x) = 0.75
                      // Solving for x: x = (0.75*total - present) / 0.25
                      const classesNeeded = Math.ceil((0.75 * totalClasses - presentClasses) / 0.25);
                      
                      return (
                        <p className="text-xs mt-1 text-light-warn-color dark:text-dark-warn-color">
                          You need to attend the next <span className="font-semibold">{classesNeeded}</span> consecutive classes without any absence to reach the 75% attendance threshold.
                        </p>
                      );
                    })()}
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="px-3 py-1.5 bg-light-button dark:bg-dark-button text-light-color dark:text-dark-color text-sm rounded-lg hover:bg-light-button/80 hover:dark:bg-dark-button/80 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AttendanceAnalytics;