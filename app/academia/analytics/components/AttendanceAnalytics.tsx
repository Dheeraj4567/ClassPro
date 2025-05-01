"use client";

import React, { useState } from "react";
import { AttendanceCourse } from "@/types/Attendance";
import { Calendar } from "@/types/Calendar";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

interface AttendanceAnalyticsProps {
  attendance?: AttendanceCourse[];
  calendar?: Calendar[];
}

// Define the interface for the selected course data
interface SelectedCourseData {
  name: string;
  courseCode: string;
  category: string;
  present: number;
  absent: number;
  total: number;
  attendancePercentage: string;
  attendanceData?: AttendanceCourse;
}

const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({ attendance = [], calendar = [] }) => {
  // State to track the selected course for the detailed modal view
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourseData | null>(null);

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

  // Process attendance data for charts
  const attendanceData = attendance.map(course => {
    const present = Number(course.hoursConducted) - Number(course.hoursAbsent);
    const total = Number(course.hoursConducted);
    const absent = Number(course.hoursAbsent);
    const attendancePercentage = (present / total) * 100;

    return {
      name: course.courseTitle.split(':')[0],
      courseCode: course.courseCode,
      category: course.category,
      present,
      absent,
      total,
      attendancePercentage: attendancePercentage.toFixed(1),
      attendanceData: course // Store the original attendance data for detailed view
    };
  });

  // Calculate overall attendance statistics
  const totalPresent = attendanceData.reduce((sum, course) => sum + course.present, 0);
  const totalAbsent = attendanceData.reduce((sum, course) => sum + course.absent, 0);
  const totalClasses = totalPresent + totalAbsent;
  const overallAttendancePercentage = (totalPresent / totalClasses) * 100;

  // Group courses by type for better organization
  const theoryCourses = attendanceData.filter(course => course.category === "Theory");
  const practicalCourses = attendanceData.filter(course => course.category === "Practical");

  // Data for the pie chart
  const pieData = [
    { name: 'Present', value: totalPresent },
    { name: 'Absent', value: totalAbsent }
  ];

  // Colors for the pie chart
  const COLORS = ['var(--color-light-success-color)', 'var(--color-light-error-color)'];
  const DARK_COLORS = ['var(--color-dark-success-color)', 'var(--color-dark-error-color)'];

  // Attendance trend data from calendar (if available)
  // This is a simplified simulation as we don't have the actual date-based attendance data
  const trendData = [];
  if (calendar?.length) {
    // Generate some example trend data based on calendar
    // In a real implementation, you would map actual attendance records to dates
    const days = calendar[0]?.days?.slice(0, 10) || [];
    let cumulativeAttendance = overallAttendancePercentage;
    
    days.forEach((day, index) => {
      // Simulating attendance fluctuation
      const fluctuation = Math.random() * 5 - 2.5;
      cumulativeAttendance = Math.min(100, Math.max(0, cumulativeAttendance + fluctuation));
      
      trendData.push({
        date: day.date,
        attendance: cumulativeAttendance.toFixed(1)
      });
    });
  }

  // Handle click on a course to show detailed information
  const handleCourseClick = (data: SelectedCourseData) => {
    setSelectedCourse(data);
  };

  // Handle click on a pie chart segment
  const handlePieClick = (data: any) => {
    // For pie chart clicks, we just show a summary of present/absent hours
    if (data && data.name) {
      // We don't set selectedCourse here as we're not showing course-specific data
      // Instead we could show a different type of modal, but for simplicity,
      // we'll just handle it with the tooltip for now
    }
  };

  // Custom tooltip for the pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-light-background-light dark:bg-dark-background-normal p-4 rounded-lg shadow-lg border border-light-button dark:border-dark-button">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            Hours: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm">
            Percentage: <span className="font-medium">
              {((data.value / totalClasses) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for attendance by course chart
  const AttendanceTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-light-background-light dark:bg-dark-background-normal p-4 rounded-lg shadow-lg border border-light-button dark:border-dark-button">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-light-accent dark:text-dark-accent">
            {data.category} • {data.courseCode}
          </p>
          <div className="mt-2">
            <p className="text-sm">
              Present: <span className="font-medium text-light-success-color dark:text-dark-success-color">
                {data.present} hrs
              </span>
            </p>
            <p className="text-sm">
              Absent: <span className="font-medium text-light-error-color dark:text-dark-error-color">
                {data.absent} hrs
              </span>
            </p>
            <p className="text-sm">
              Total: <span className="font-medium">{data.total} hrs</span>
            </p>
            <p className="text-sm">
              Attendance: <span 
                className={`font-medium ${
                  Number(data.attendancePercentage) >= 75 
                    ? "text-light-success-color dark:text-dark-success-color" 
                    : "text-light-error-color dark:text-dark-error-color"
                }`}
              >
                {data.attendancePercentage}%
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
      
      <div className="my-4 p-5 bg-light-background-normal dark:bg-dark-background-normal rounded-xl shadow-sm">
        {/* Attendance summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-4 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Overall Attendance</h3>
            <p className={`text-3xl font-semibold ${
              overallAttendancePercentage >= 75 
                ? "text-light-success-color dark:text-dark-success-color" 
                : "text-light-error-color dark:text-dark-error-color"
            }`}>
              {overallAttendancePercentage.toFixed(1)}%
            </p>
            <p className="text-sm text-light-color/60 dark:text-dark-color/60 mt-1">
              Present: {totalPresent} hrs | Absent: {totalAbsent} hrs
            </p>
          </div>
          
          <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-4 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Total Classes</h3>
            <p className="text-3xl font-semibold">{totalClasses}</p>
            <p className="text-sm text-light-color/60 dark:text-dark-color/60 mt-1">Hours</p>
          </div>
          
          <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-4 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Courses Tracked</h3>
            <p className="text-3xl font-semibold">{attendanceData.length}</p>
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

        {/* Attendance pie chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Overall Attendance Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart onClick={(data) => data?.activePayload && handlePieClick(data.activePayload[0].payload)}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    className="cursor-pointer"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        className={`${index === 0 ? "dark:fill-dark-success-color" : "dark:fill-dark-error-color"} cursor-pointer`} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Attendance by course */}
          <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Attendance by Course</h3>
            <div className="h-64 overflow-y-auto pr-2">
              {attendanceData.map((course, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between mb-2 p-2 rounded-lg hover:bg-light-background-dark hover:dark:bg-dark-background-dark cursor-pointer"
                  onClick={() => handleCourseClick(course)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{course.name}</p>
                    <p className="text-xs text-light-accent dark:text-dark-accent">{course.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          Number(course.attendancePercentage) >= 75 
                            ? "bg-light-success-color dark:bg-dark-success-color" 
                            : "bg-light-error-color dark:bg-dark-error-color"
                        }`}
                        style={{ width: `${course.attendancePercentage}%` }}
                      />
                    </div>
                    <span 
                      className={`text-sm font-medium ${
                        Number(course.attendancePercentage) >= 75 
                          ? "text-light-success-color dark:text-dark-success-color" 
                          : "text-light-error-color dark:text-dark-error-color"
                      }`}
                    >
                      {course.attendancePercentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Course-wise attendance comparison */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Course-wise Attendance</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={attendanceData}
                margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                onClick={(data) => data?.activePayload && handleCourseClick(data.activePayload[0].payload)}
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
                <YAxis 
                  domain={[0, 100]} 
                  label={{ 
                    value: 'Attendance %', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' } 
                  }} 
                />
                <Tooltip content={<AttendanceTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="attendancePercentage" 
                  name="Attendance %" 
                  stroke="var(--color-light-accent)"
                  className="dark:stroke-dark-accent cursor-pointer"
                  strokeWidth={2} 
                  dot={{
                    fill: "var(--color-light-accent)",
                    className: "dark:fill-dark-accent cursor-pointer",
                    r: 5
                  }}
                  activeDot={{
                    fill: "var(--color-light-accent)",
                    r: 7,
                    stroke: "var(--color-light-background-light)",
                    className: "dark:stroke-dark-background-normal dark:fill-dark-accent cursor-pointer",
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Detailed Course Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-light-background-normal dark:bg-dark-background-normal rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCourse.name}</h3>
                    <p className="text-sm text-light-accent dark:text-dark-accent">{selectedCourse.courseCode} ({selectedCourse.category})</p>
                  </div>
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="text-light-color/60 dark:text-dark-color/60 hover:text-light-accent hover:dark:text-dark-accent"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-4">
                    <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Present</h4>
                    <p className="text-2xl font-semibold text-light-success-color dark:text-dark-success-color">
                      {selectedCourse.present}
                      <span className="text-sm text-light-color/60 dark:text-dark-color/60 ml-1">hrs</span>
                    </p>
                  </div>
                  
                  <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-4">
                    <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Absent</h4>
                    <p className="text-2xl font-semibold text-light-error-color dark:text-dark-error-color">
                      {selectedCourse.absent}
                      <span className="text-sm text-light-color/60 dark:text-dark-color/60 ml-1">hrs</span>
                    </p>
                  </div>
                  
                  <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-4">
                    <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Attendance</h4>
                    <p className={`text-2xl font-semibold ${
                      Number(selectedCourse.attendancePercentage) >= 75 
                        ? "text-light-success-color dark:text-dark-success-color" 
                        : "text-light-error-color dark:text-dark-error-color"
                    }`}>
                      {selectedCourse.attendancePercentage}%
                    </p>
                  </div>
                </div>
                
                {/* Visual representation of attendance */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-3">Attendance Overview</h4>
                  <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
                    <div className="h-8 w-full bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          Number(selectedCourse.attendancePercentage) >= 75 
                            ? "bg-light-success-color dark:bg-dark-success-color" 
                            : "bg-light-error-color dark:bg-dark-error-color"
                        }`}
                        style={{ width: `${selectedCourse.attendancePercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span>Total Hours: {selectedCourse.total}</span>
                      <span>
                        Required for 75%: {Math.ceil(selectedCourse.total * 0.75)} hrs
                        {Number(selectedCourse.attendancePercentage) < 75 && (
                          <span className="ml-2 text-light-error-color dark:text-dark-error-color">
                            (Need {Math.ceil(selectedCourse.total * 0.75) - selectedCourse.present} more hrs)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Additional attendance details if available */}
                {selectedCourse.attendanceData && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-3">Course Details</h4>
                    <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          {selectedCourse.attendanceData.facultyName && (
                            <tr className="border-b border-light-button/20 dark:border-dark-button/20">
                              <td className="p-3 font-medium">Faculty</td>
                              <td className="p-3">{selectedCourse.attendanceData.facultyName}</td>
                            </tr>
                          )}
                          {selectedCourse.attendanceData.slot && (
                            <tr className="border-b border-light-button/20 dark:border-dark-button/20">
                              <td className="p-3 font-medium">Slot</td>
                              <td className="p-3">{selectedCourse.attendanceData.slot}</td>
                            </tr>
                          )}
                          {selectedCourse.attendanceData.courseTitle && (
                            <tr>
                              <td className="p-3 font-medium">Course Title</td>
                              <td className="p-3">{selectedCourse.attendanceData.courseTitle}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="px-4 py-2 bg-light-button dark:bg-dark-button text-light-color dark:text-dark-color rounded-lg hover:bg-light-button/80 hover:dark:bg-dark-button/80 transition-colors"
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