"use client";

import React, { useState } from "react";
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

// Define the interface for the selected course performance data
interface CoursePerformanceData {
  name: string;
  courseCode: string;
  courseType: string;
  marksPercentage: string;
  attendancePercentage: string;
  performanceScore: string;
  originalMark?: Mark;
  originalAttendance?: AttendanceCourse;
}

// Define the interface for recommendation details modal
interface RecommendationData {
  area: string;
  recommendation: string;
  priority: string;
  color: string;
  details?: string;
  actionSteps?: string[];
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  marks = [],
  courses = [],
  attendance = [],
  calendar = []
}) => {
  // State to track selected course and recommendation for detailed view
  const [selectedCourse, setSelectedCourse] = useState<CoursePerformanceData | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationData | null>(null);
  const [skillInfoVisible, setSkillInfoVisible] = useState<boolean>(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

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
      performanceScore: performanceScore.toFixed(1),
      originalMark: mark,
      originalAttendance: attendanceRecord
    };
  });

  // Sort courses by performance score
  const sortedPerformance = [...performanceData].sort((a, b) => 
    Number(b.performanceScore) - Number(a.performanceScore)
  );

  // Data for the radar chart with click handling for each skill
  const skillData = [
    { 
      subject: 'Assignment Completion', 
      A: 85, 
      fullMark: 100,
      description: 'Measures how consistently you complete and submit assignments on time.',
      tips: [
        'Set reminders for upcoming deadlines',
        'Break down assignments into smaller tasks',
        'Start working on assignments earlier to avoid last-minute rushes'
      ]
    },
    { 
      subject: 'Study Consistency', 
      A: 70, 
      fullMark: 100,
      description: 'Indicates how regularly you study throughout the term rather than cramming before exams.',
      tips: [
        'Create a weekly study schedule',
        'Use the Pomodoro technique (25 min study, 5 min break)',
        'Join or form study groups for accountability'
      ]
    },
    { 
      subject: 'Test Performance', 
      A: marks.length > 0 ? 
        marks.reduce((sum, mark) => sum + (Number(mark.overall.scored || 0) / Number(mark.overall.total || 1)) * 100, 0) / marks.length : 0, 
      fullMark: 100,
      description: 'Your overall performance in tests and examinations across all courses.',
      tips: [
        'Practice with past exam papers',
        'Focus on understanding concepts rather than memorizing',
        'Create mind maps to connect related concepts'
      ]
    },
    { 
      subject: 'Attendance', 
      A: attendance.length > 0 ? 
        attendance.reduce((sum, course) => {
          const percent = ((Number(course.hoursConducted) - Number(course.hoursAbsent)) / Number(course.hoursConducted)) * 100;
          return sum + percent;
        }, 0) / attendance.length : 0, 
      fullMark: 100,
      description: 'Your average attendance percentage across all courses.',
      tips: [
        'Set multiple alarms to wake up for early classes',
        'Plan your route to minimize travel time between classes',
        'If you must miss a class, inform your instructor and get notes from classmates'
      ]
    },
    { 
      subject: 'Time Management', 
      A: 75, 
      fullMark: 100,
      description: 'Reflects how effectively you manage your time for academic and other activities.',
      tips: [
        'Use a digital calendar to plan your week',
        'Prioritize tasks using urgency/importance matrix',
        'Schedule buffer time between activities for unexpected delays'
      ]
    },
    { 
      subject: 'Participation', 
      A: 80, 
      fullMark: 100,
      description: 'Indicates your level of active participation and engagement in classes.',
      tips: [
        'Prepare one question before each class',
        'Sit in the front rows to stay engaged',
        'Contribute to class discussions at least once per session'
      ]
    },
  ];

  // Handle click on a course performance bar
  const handleCourseClick = (data: CoursePerformanceData) => {
    setSelectedCourse(data);
  };

  // Handle click on a skill in radar chart
  const handleSkillClick = (skill: string) => {
    setSelectedSkill(skill);
    setSkillInfoVisible(true);
  };

  // Generate some improvement recommendations with expanded details
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Check average marks
    const avgMarks = marks.length > 0 ? marks.reduce((sum, mark) => 
      sum + (Number(mark.overall.scored || 0) / Number(mark.overall.total || 1) * 100), 0) / marks.length : 0;
    
    if (avgMarks < 60) {
      recommendations.push({
        area: "Academic Performance",
        recommendation: "Consider forming study groups or seeking additional help from professors.",
        priority: "High",
        color: "text-light-error-color dark:text-dark-error-color",
        details: "Your overall academic performance is below the expected level. This could impact your GPA and potential opportunities in the future.",
        actionSteps: [
          "Schedule office hours with professors for courses where marks are below 60%",
          "Join or form study groups with classmates who are performing well",
          "Consider using university tutoring services for difficult subjects",
          "Review your study techniques and try different approaches"
        ]
      });
    }
    
    // Check attendance
    const avgAttendance = attendance.length > 0 ? attendance.reduce((sum, course) => {
      const percent = ((Number(course.hoursConducted) - Number(course.hoursAbsent)) / Number(course.hoursConducted)) * 100;
      return sum + percent;
    }, 0) / attendance.length : 0;
    
    if (avgAttendance < 75) {
      recommendations.push({
        area: "Attendance",
        recommendation: "Your attendance is below the required minimum. Focus on improving your attendance.",
        priority: "High",
        color: "text-light-error-color dark:text-dark-error-color",
        details: "Attendance below 75% can result in not being allowed to sit for final exams in many institutions. Additionally, regular attendance is strongly correlated with better academic performance.",
        actionSteps: [
          "Set multiple alarms to wake up for early morning classes",
          "Plan your schedule to reach class at least 10 minutes early",
          "If you have health issues affecting attendance, speak with academic counselors",
          "Use a dedicated calendar app to track class schedules"
        ]
      });
    } else if (avgAttendance < 85) {
      recommendations.push({
        area: "Attendance",
        recommendation: "Your attendance is satisfactory but could be improved.",
        priority: "Medium",
        color: "text-light-warn-color dark:text-dark-warn-color",
        details: "While you're meeting the minimum attendance requirements, higher attendance can lead to better understanding of course material and improved marks.",
        actionSteps: [
          "Identify patterns in the classes you tend to miss",
          "Set personal attendance goals (like 90% for the next month)",
          "Find a study buddy who can help keep you accountable",
          "Review notes from missed classes immediately"
        ]
      });
    }
    
    // Look for courses with poor performance
    const poorPerformanceCourses = performanceData.filter(course => Number(course.performanceScore) < 60);
    if (poorPerformanceCourses.length > 0) {
      recommendations.push({
        area: "Course Focus",
        recommendation: `Focus more attention on courses: ${poorPerformanceCourses.map(c => c.name).join(', ')}`,
        priority: "Medium",
        color: "text-light-warn-color dark:text-dark-warn-color",
        details: `You have ${poorPerformanceCourses.length} courses where your overall performance is below 60%. Focusing extra effort on these specific courses can help balance your academic profile.`,
        actionSteps: [
          "Allocate 25% more study time to these courses",
          "Meet with professors to discuss improvement strategies",
          "Find supplementary learning resources (videos, practice problems)",
          "Form study groups specifically for these courses"
        ]
      });
    }
    
    // Always add a positive recommendation
    recommendations.push({
      area: "Time Management",
      recommendation: "Consider using a study planner to organize your study sessions more effectively.",
      priority: "Low",
      color: "text-light-accent dark:text-dark-accent",
      details: "Even high-performing students can benefit from improved time management. Research shows that structured study planning can increase productivity by up to 30%.",
      actionSteps: [
        "Try digital tools like Notion, Todoist or Google Calendar for planning",
        "Use the Pomodoro technique (25 min work, 5 min break)",
        "Plan your week in advance, allocating specific time blocks for each subject",
        "Schedule regular reviews of previously learned material"
      ]
    });
    
    return recommendations;
  };

  const recommendations = generateRecommendations();

  // Handle click on a recommendation
  const handleRecommendationClick = (rec: RecommendationData) => {
    setSelectedRecommendation(rec);
  };

  // Find the selected skill data
  const selectedSkillData = skillData.find(skill => skill.subject === selectedSkill);

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
                  onClick={(data) => data?.activePayload && handleCourseClick(data.activePayload[0].payload)}
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
                    className="dark:fill-dark-accent cursor-pointer"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-light-color/60 dark:text-dark-color/60 text-center mt-2">
              Click on any bar to see detailed performance information
            </p>
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
                  <RadarChart 
                    outerRadius={90} 
                    data={skillData}
                    onClick={(data) => data?.activePayload && handleSkillClick(data.activePayload[0].payload.subject)}
                  >
                    <PolarGrid />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ 
                        fill: "var(--color-light-color)", 
                        className: "dark:fill-dark-color cursor-pointer" 
                      }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar 
                      name="Your Skills" 
                      dataKey="A" 
                      stroke="var(--color-light-accent)" 
                      fill="var(--color-light-accent)" 
                      fillOpacity={0.6} 
                      className="dark:stroke-dark-accent dark:fill-dark-accent cursor-pointer"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-light-color/60 dark:text-dark-color/60 text-center mt-2">
                Click on any skill to see details and improvement tips
              </p>
            </div>
            
            <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
              <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-3">Performance Trend</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={performanceData} 
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                    onClick={(data) => data?.activePayload && handleCourseClick(data.activePayload[0].payload)}
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
                      className="dark:stroke-dark-error-color cursor-pointer"
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="attendancePercentage" 
                      name="Attendance %" 
                      stroke="var(--color-light-success-color)" 
                      className="dark:stroke-dark-success-color cursor-pointer"
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
                <div 
                  key={index} 
                  className="flex flex-col gap-1 p-2 rounded-lg hover:bg-light-background-dark hover:dark:bg-dark-background-dark cursor-pointer"
                  onClick={() => handleRecommendationClick(rec)}
                >
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
            <p className="text-xs text-light-color/60 dark:text-dark-color/60 text-center mt-4">
              Click on any recommendation to see detailed action steps
            </p>
          </div>
        </div>
        
        {/* Course Performance Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-light-background-normal dark:bg-dark-background-normal rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCourse.name}</h3>
                    <p className="text-sm text-light-accent dark:text-dark-accent">
                      {selectedCourse.courseCode} ({selectedCourse.courseType})
                    </p>
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
                
                {/* Performance metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-4">
                    <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Marks</h4>
                    <p className={`text-2xl font-semibold ${
                      Number(selectedCourse.marksPercentage) >= 75
                        ? "text-light-success-color dark:text-dark-success-color" 
                        : Number(selectedCourse.marksPercentage) >= 60
                          ? "text-light-warn-color dark:text-dark-warn-color"
                          : "text-light-error-color dark:text-dark-error-color"
                    }`}>
                      {selectedCourse.marksPercentage}%
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
                  
                  <div className="bg-light-background-light dark:bg-dark-background-light rounded-lg p-4">
                    <h4 className="text-sm font-medium text-light-accent dark:text-dark-accent mb-1">Overall Performance</h4>
                    <p className={`text-2xl font-semibold ${
                      Number(selectedCourse.performanceScore) >= 75
                        ? "text-light-success-color dark:text-dark-success-color" 
                        : Number(selectedCourse.performanceScore) >= 60
                          ? "text-light-warn-color dark:text-dark-warn-color"
                          : "text-light-error-color dark:text-dark-error-color"
                    }`}>
                      {selectedCourse.performanceScore}%
                    </p>
                  </div>
                </div>

                {/* Performance visualization */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-3">Performance Breakdown</h4>
                  <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Marks ({selectedCourse.marksPercentage}%)</span>
                          <span className="text-sm">70% of overall score</span>
                        </div>
                        <div className="h-2 w-full bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              Number(selectedCourse.marksPercentage) >= 75
                                ? "bg-light-success-color dark:bg-dark-success-color" 
                                : Number(selectedCourse.marksPercentage) >= 60
                                  ? "bg-light-warn-color dark:bg-dark-warn-color"
                                  : "bg-light-error-color dark:bg-dark-error-color"
                            }`}
                            style={{ width: `${selectedCourse.marksPercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Attendance ({selectedCourse.attendancePercentage}%)</span>
                          <span className="text-sm">30% of overall score</span>
                        </div>
                        <div className="h-2 w-full bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              Number(selectedCourse.attendancePercentage) >= 75
                                ? "bg-light-success-color dark:bg-dark-success-color" 
                                : "bg-light-error-color dark:bg-dark-error-color"
                            }`}
                            style={{ width: `${selectedCourse.attendancePercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-light-button/20 dark:border-dark-button/20">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Overall Performance Score</span>
                          <span className="text-sm font-medium">{selectedCourse.performanceScore}%</span>
                        </div>
                        <div className="h-3 w-full bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              Number(selectedCourse.performanceScore) >= 75
                                ? "bg-light-success-color dark:bg-dark-success-color" 
                                : Number(selectedCourse.performanceScore) >= 60
                                  ? "bg-light-warn-color dark:bg-dark-warn-color"
                                  : "bg-light-error-color dark:bg-dark-error-color"
                            }`}
                            style={{ width: `${selectedCourse.performanceScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Improvement suggestions specific to this course */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-3">Improvement Suggestions</h4>
                  <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
                    <ul className="list-disc pl-5 space-y-2">
                      {Number(selectedCourse.marksPercentage) < 60 && (
                        <>
                          <li className="text-sm">Consider scheduling additional study time for this course</li>
                          <li className="text-sm">Meet with your professor during office hours to discuss your performance</li>
                          <li className="text-sm">Form or join a study group with classmates</li>
                        </>
                      )}
                      {Number(selectedCourse.attendancePercentage) < 75 && (
                        <>
                          <li className="text-sm">Your attendance is below the required minimum - prioritize attending all remaining classes</li>
                          <li className="text-sm">If you missed classes due to valid reasons, check if you can apply for attendance consideration</li>
                        </>
                      )}
                      {Number(selectedCourse.attendancePercentage) >= 75 && Number(selectedCourse.marksPercentage) < 75 && (
                        <li className="text-sm">Your attendance is good, but it's not translating to marks - consider reviewing your study techniques</li>
                      )}
                      {Number(selectedCourse.performanceScore) >= 75 && (
                        <li className="text-sm">You're performing well in this course - keep up the good work!</li>
                      )}
                    </ul>
                  </div>
                </div>
                
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
        
        {/* Recommendation Detail Modal */}
        {selectedRecommendation && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-light-background-normal dark:bg-dark-background-normal rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{selectedRecommendation.area}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedRecommendation.color === "text-light-error-color dark:text-dark-error-color" 
                          ? "bg-light-error-background dark:bg-dark-error-background" 
                          : selectedRecommendation.color === "text-light-warn-color dark:text-dark-warn-color"
                          ? "bg-light-warn-background dark:bg-dark-warn-background"
                          : "bg-light-accent/10 dark:bg-dark-accent/10"
                        } ${selectedRecommendation.color}`}>
                          {selectedRecommendation.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-light-accent dark:text-dark-accent mt-1">
                      {selectedRecommendation.recommendation}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedRecommendation(null)}
                    className="text-light-color/60 dark:text-dark-color/60 hover:text-light-accent hover:dark:text-dark-accent"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                {/* Details section */}
                <div className="mt-4 bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Why This Matters</h4>
                  <p className="text-sm text-light-color/70 dark:text-dark-color/70">
                    {selectedRecommendation.details}
                  </p>
                </div>
                
                {/* Action steps */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recommended Action Steps</h4>
                  <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
                    <ol className="list-decimal pl-5 space-y-2">
                      {selectedRecommendation.actionSteps?.map((step, idx) => (
                        <li key={idx} className="text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => setSelectedRecommendation(null)}
                    className="px-4 py-2 bg-light-button dark:bg-dark-button text-light-color dark:text-dark-color rounded-lg hover:bg-light-button/80 hover:dark:bg-dark-button/80 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skill Info Modal */}
        {skillInfoVisible && selectedSkillData && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-light-background-normal dark:bg-dark-background-normal rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedSkillData.subject}</h3>
                    <p className="text-sm text-light-accent dark:text-dark-accent mt-1">
                      Your current level: {selectedSkillData.A.toFixed(1)}%
                    </p>
                  </div>
                  <button 
                    onClick={() => {setSkillInfoVisible(false); setSelectedSkill(null);}}
                    className="text-light-color/60 dark:text-dark-color/60 hover:text-light-accent hover:dark:text-dark-accent"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                {/* Skill description */}
                <div className="mt-4 bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
                  <h4 className="font-medium mb-2">About This Skill</h4>
                  <p className="text-sm text-light-color/70 dark:text-dark-color/70">
                    {selectedSkillData.description}
                  </p>
                </div>
                
                {/* Progress bar */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Your Progress</h4>
                  <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
                    <div className="h-3 w-full bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          selectedSkillData.A >= 75
                            ? "bg-light-success-color dark:bg-dark-success-color" 
                            : selectedSkillData.A >= 60
                              ? "bg-light-warn-color dark:bg-dark-warn-color"
                              : "bg-light-error-color dark:bg-dark-error-color"
                        }`}
                        style={{ width: `${selectedSkillData.A}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
                
                {/* Improvement tips */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Tips to Improve</h4>
                  <div className="bg-light-background-light dark:bg-dark-background-light p-4 rounded-lg">
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedSkillData.tips.map((tip, idx) => (
                        <li key={idx} className="text-sm">{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => {setSkillInfoVisible(false); setSelectedSkill(null);}}
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

export default PerformanceAnalytics;