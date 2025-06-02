"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mark } from '@/types/Marks';
import { Course } from '@/types/Course';
import { AttendanceCourse } from '@/types/Attendance';
import { lightHaptics, mediumHaptics, strongHaptics } from '@/utils/haptics';
import dynamic from 'next/dynamic';

// Lazily load the ClassProWrapped component
const ClassProWrapped = dynamic(() => import('@/app/academia/analytics/components/ClassProWrapped'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-t-light-accent dark:border-t-dark-accent border-light-background-light dark:border-dark-background-dark rounded-full animate-spin"></div>
      <p className="mt-4 text-light-color dark:text-dark-color">Loading your semester story...</p>
    </div>
  ),
});

// Tabs for the Wrapped experience
const TABS = [
  { id: 'story', label: 'Your Story', icon: '📚' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'insights', label: 'Insights', icon: '💡' },
  { id: 'share', label: 'Share', icon: '🔗' },
];

export default function WrappedPage() {
  // Initialize with empty arrays, data will come from useWrappedData hook
  const [marks, setMarks] = useState<Mark[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<AttendanceCourse[]>([]);
  // This component receives data that has already been cached
  // after the last working day, ensuring the data doesn't change
  const [activeTab, setActiveTab] = useState('story');
  const [isLoading, setIsLoading] = useState(true);
  const [showStartButton, setShowStartButton] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Simulate loading for a smoother experience
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  // Fetch wrapped data from API
  useEffect(() => {
    const fetchWrappedData = async () => {
      try {
        const response = await fetch('/api/wrapped');
        if (response.ok) {
          const data = await response.json();
          if (data.marks) setMarks(data.marks);
          if (data.courses) setCourses(data.courses);
          if (data.attendance) setAttendance(data.attendance);
        }
      } catch (error) {
        console.error("Failed to fetch wrapped data:", error);
      }
    };
    
    fetchWrappedData();
  }, []);

  // Start the experience
  const startExperience = () => {
    mediumHaptics();
    setShowStartButton(false);
    setHasStarted(true);
  };

  // Tab change handler with haptic feedback
  const handleTabChange = (tabId: string) => {
    lightHaptics();
    setActiveTab(tabId);
  };

  // Confetti animation for the share tab
  const renderConfetti = () => {
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 8 + 5;
      const color = [
        'bg-blue-500', 'bg-pink-500', 'bg-yellow-500', 
        'bg-green-500', 'bg-purple-500', 'bg-orange-400'
      ][Math.floor(Math.random() * 6)];
      
      return (
        <motion.div
          key={i}
          className={`absolute rounded-sm ${color}`}
          initial={{ 
            top: "50%",
            left: "50%",
            width: size,
            height: size,
            opacity: 0
          }}
          animate={{ 
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: [0, 1, 1, 0.5, 0],
            y: [0, -100 - Math.random() * 300],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: Math.random() * 360
          }}
          transition={{ 
            duration: 4 + Math.random() * 2,
            delay: Math.random() * 0.5,
            repeat: Infinity,
            repeatDelay: 5
          }}
        />
      );
    });
  };

  // If loading, show a loading animation
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-20 h-20 border-4 border-t-white border-white/30 rounded-full animate-spin mb-6"></div>
        <h1 className="text-2xl font-bold mb-2">Loading ClassPro Wrapped</h1>
        <p className="text-white/70">Your semester story is being crafted...</p>
      </div>
    );
  }

  // If showing the start button
  if (showStartButton) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-500 z-0">
          {/* Background music waves animation */}
          <div className="absolute bottom-0 left-0 w-full h-40 flex justify-center items-end overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="mx-1 w-2 bg-white/40 rounded-t-md"
                initial={{ height: 10 }}
                animate={{ 
                  height: [
                    10 + Math.random() * 30,
                    40 + Math.random() * 60,
                    10 + Math.random() * 30
                  ] 
                }}
                transition={{
                  duration: 1.2 + Math.random(),
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: i * 0.05
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-white">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">ClassPro Wrapped</h1>
            <p className="text-xl mb-8 max-w-lg">Your academic journey from this semester, beautifully visualized</p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={startExperience}
              className="px-8 py-4 bg-white text-purple-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Start Your Experience
            </motion.button>
          </motion.div>
          
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute bottom-8 text-sm text-white/70 text-center"
          >
            <p>Available for a limited time only</p>
            <p className="mt-1">Swipe through to see your personalized insights</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-light-background-normal dark:bg-dark-background-normal">
      {/* Main content area */}
      <div className="w-full min-h-screen">
        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'story' && (
            <motion.div
              key="story"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <div className="w-full h-full">
                {/* Story tab just shows the original ClassProWrapped component */}
                <ClassProWrapped 
                  marks={marks}
                  courses={courses}
                  attendance={attendance}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-6 text-light-color dark:text-dark-color">Your Semester by the Numbers</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Attendance Card */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
                  <h3 className="text-xl font-semibold mb-2">Attendance</h3>
                  <div className="text-4xl font-bold mb-3">
                    {attendance.length > 0 
                      ? `${(attendance.reduce((acc, course) => acc + parseFloat(course.attendancePercentage), 0) / attendance.length).toFixed(1)}%` 
                      : "N/A"}
                  </div>
                  <p className="text-white/70 text-sm">Your average attendance this semester</p>
                </div>

                {/* Performance Card */}
                <div className="bg-gradient-to-br from-pink-500 to-rose-400 p-6 rounded-xl shadow-lg text-white">
                  <h3 className="text-xl font-semibold mb-2">Average Score</h3>
                  <div className="text-4xl font-bold mb-3">
                    {marks.length > 0 
                      ? `${(marks.reduce((acc, mark) => acc + (Number(mark.overall.scored) / Number(mark.overall.total) * 100), 0) / marks.length).toFixed(1)}%` 
                      : "N/A"}
                  </div>
                  <p className="text-white/70 text-sm">Your average marks across all courses</p>
                </div>

                {/* Courses Card */}
                <div className="bg-gradient-to-br from-green-500 to-teal-400 p-6 rounded-xl shadow-lg text-white">
                  <h3 className="text-xl font-semibold mb-2">Course Load</h3>
                  <div className="text-4xl font-bold mb-3">
                    {courses.length}
                  </div>
                  <p className="text-white/70 text-sm">Number of courses this semester</p>
                </div>

                {/* Hours Card */}
                <div className="bg-gradient-to-br from-yellow-500 to-amber-400 p-6 rounded-xl shadow-lg text-white">
                  <h3 className="text-xl font-semibold mb-2">Hours Spent</h3>
                  <div className="text-4xl font-bold mb-3">
                    {attendance.length > 0 
                      ? `${attendance.reduce((acc, course) => acc + Number(course.hoursConducted), 0)} hrs` 
                      : "N/A"}
                  </div>
                  <p className="text-white/70 text-sm">Total class hours this semester</p>
                </div>
              </div>

              {/* Achievement Section */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-light-color dark:text-dark-color">Your Achievements</h3>
                <div className="space-y-4">
                  {/* Achievement items - these would typically be generated from actual data */}
                  <div className="flex items-center p-4 bg-light-background-light dark:bg-dark-background-light rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-2xl mr-4">
                      🏆
                    </div>
                    <div>
                      <h4 className="font-semibold text-light-color dark:text-dark-color">Perfect Attendance</h4>
                      <p className="text-sm text-light-color/70 dark:text-dark-color/70">
                        You had 100% attendance in {attendance.filter(c => parseFloat(c.attendancePercentage) >= 95).length} courses
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-light-background-light dark:bg-dark-background-light rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl mr-4">
                      🌟
                    </div>
                    <div>
                      <h4 className="font-semibold text-light-color dark:text-dark-color">Academic Excellence</h4>
                      <p className="text-sm text-light-color/70 dark:text-dark-color/70">
                        You scored above 90% in {marks.filter(m => (Number(m.overall.scored) / Number(m.overall.total)) * 100 >= 90).length} courses
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-6 text-light-color dark:text-dark-color">Academic Insights</h2>
              
              {/* Top Performance Analysis */}
              <div className="mb-8 p-6 bg-light-background-light dark:bg-dark-background-light rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-light-color dark:text-dark-color">Your Top Course</h3>
                {marks.length > 0 ? (
                  <div>
                    {(() => {
                      const topCourse = [...marks].sort((a, b) => {
                        const aScore = (Number(a.overall.scored) / Number(a.overall.total)) * 100;
                        const bScore = (Number(b.overall.scored) / Number(b.overall.total)) * 100;
                        return bScore - aScore;
                      })[0];
                      
                      const score = (Number(topCourse.overall.scored) / Number(topCourse.overall.total)) * 100;
                      
                      return (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-400 rounded-lg flex items-center justify-center text-3xl text-white font-bold">
                            {score.toFixed(0)}%
                          </div>
                          <div>
                            <h4 className="font-semibold text-xl text-light-color dark:text-dark-color">{topCourse.courseName}</h4>
                            <p className="text-light-color/70 dark:text-dark-color/70">
                              You scored {topCourse.overall.scored}/{topCourse.overall.total} in this course
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-light-color/70 dark:text-dark-color/70">No course data available</p>
                )}
              </div>
              
              {/* Improvement Areas */}
              <div className="mb-8 p-6 bg-light-background-light dark:bg-dark-background-light rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-light-color dark:text-dark-color">Areas for Improvement</h3>
                {marks.length > 0 ? (
                  <div>
                    {(() => {
                      const weakestCourse = [...marks].sort((a, b) => {
                        const aScore = (Number(a.overall.scored) / Number(a.overall.total)) * 100;
                        const bScore = (Number(b.overall.scored) / Number(b.overall.total)) * 100;
                        return aScore - bScore;
                      })[0];
                      
                      const score = (Number(weakestCourse.overall.scored) / Number(weakestCourse.overall.total)) * 100;
                      
                      return (
                        <div>
                          <div className="mb-4">
                            <h4 className="font-semibold text-light-color dark:text-dark-color">{weakestCourse.courseName}</h4>
                            <div className="mt-2 h-2 bg-light-background-dark dark:bg-dark-background-dark rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-light-warn-color dark:bg-dark-warn-color"
                                style={{ width: `${Math.max(5, score)}%` }}
                              />
                            </div>
                            <p className="mt-1 text-sm text-light-color/70 dark:text-dark-color/70">
                              {score.toFixed(1)}% - Focus on improving this course next semester
                            </p>
                          </div>
                          
                          <div className="mt-4 p-4 bg-light-background-normal dark:bg-dark-background-normal rounded-lg border border-light-border dark:border-dark-border">
                            <h5 className="font-medium text-light-color dark:text-dark-color mb-2">Personalized Tip:</h5>
                            <p className="text-sm text-light-color/70 dark:text-dark-color/70">
                              Consider forming a study group for this course or visiting your professor during office hours to improve your understanding.
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-light-color/70 dark:text-dark-color/70">No course data available</p>
                )}
              </div>
              
              {/* Study Patterns */}
              <div className="p-6 bg-light-background-light dark:bg-dark-background-light rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-light-color dark:text-dark-color">Your Study Patterns</h3>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    // This would normally use actual data - using random for demo
                    const intensity = Math.random();
                    // Give weekend days lower intensity on average
                    const adjustedIntensity = i >= 5 ? intensity * 0.5 : intensity;
                    
                    return (
                      <div key={day} className="flex flex-col items-center">
                        <div className="text-xs mb-2 text-light-color/70 dark:text-dark-color/70">{day}</div>
                        <div 
                          className={`w-full aspect-square rounded-sm ${
                            adjustedIntensity > 0.7 
                              ? 'bg-green-500' 
                              : adjustedIntensity > 0.4
                                ? 'bg-green-300'
                                : adjustedIntensity > 0.2
                                  ? 'bg-green-200'
                                  : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        ></div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-light-color/70 dark:text-dark-color/70">
                  You're most productive in the middle of the week. Consider spreading your study sessions more evenly.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'share' && (
            <motion.div
              key="share"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 max-w-4xl mx-auto relative overflow-hidden"
            >
              {/* Confetti animation in the background */}
              {renderConfetti()}
              
              <h2 className="text-2xl font-bold mb-6 text-light-color dark:text-dark-color">Share Your Results</h2>
              
              <div className="bg-light-background-light dark:bg-dark-background-light p-6 rounded-xl shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4 text-light-color dark:text-dark-color">Your ClassPro Wrapped Summary</h3>
                
                {/* Summary card that would be shared */}
                <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-2xl font-bold">My Academic Year</h4>
                      <p className="text-white/70">ClassPro Wrapped 2025</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        {marks.length > 0 
                          ? `${(marks.reduce((acc, mark) => acc + (Number(mark.overall.scored) / Number(mark.overall.total) * 100), 0) / marks.length).toFixed(0)}%` 
                          : "N/A"}
                      </div>
                      <p className="text-white/70 text-sm">Overall Score</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-lg font-semibold">{courses.length} Courses</div>
                      <div className="text-white/70 text-sm">Completed</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {attendance.length > 0 
                          ? `${(attendance.reduce((acc, course) => acc + parseFloat(course.attendancePercentage), 0) / attendance.length).toFixed(0)}%` 
                          : "N/A"}
                      </div>
                      <div className="text-white/70 text-sm">Attendance</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/20 pt-4 mt-2">
                    <p className="text-center font-medium">
                      {marks.length > 0 && (
                        <>Top Course: {
                          [...marks].sort((a, b) => {
                            const aScore = Number(a.overall.scored);
                            const bScore = Number(b.overall.scored);
                            return bScore - aScore;
                          })[0]?.courseName || 'N/A'
                        }</>
                      )}
                    </p>
                  </div>
                </div>
                
                <div id="wrapped-share-card" className="relative">
                  {/* This div is used as a target for image generation when sharing */}
                </div>
                
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <button 
                    onClick={async () => { 
                      lightHaptics();
                      const { downloadWrappedImage } = await import('@/utils/sharing');
                      
                      // Start the download process
                      const success = await downloadWrappedImage('wrapped-share-card');
                      
                      // Show feedback to user
                      if (success) {
                        alert('Your Wrapped image has been downloaded!');
                      } else {
                        alert('Sorry, there was an issue downloading your image.');
                      }
                    }}
                    className="px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <span>Download Image</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path>
                    </svg>
                  </button>
                  
                  <button 
                    onClick={async () => { 
                      lightHaptics();
                      const { shareWrappedResults } = await import('@/utils/sharing');
                      
                      // Prepare the wrapped data
                      const wrappedData = {
                        marks,
                        courses,
                        attendance
                      };
                      
                      // Share the results
                      const success = await shareWrappedResults(
                        wrappedData, 
                        'Check out my semester results with ClassPro Wrapped!'
                      );
                      
                      // Show feedback
                      if (success) {
                        if ('share' in navigator) {
                          // Web Share API was used
                        } else {
                          // Fallback to clipboard
                          alert('Share text copied to clipboard!');
                        }
                      } else {
                        alert('Sorry, there was an issue sharing your results.');
                      }
                    }}
                    className="px-4 py-2 bg-light-background-dark dark:bg-dark-background-dark text-light-color dark:text-dark-color rounded-md flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <span>Share</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-light-color/70 dark:text-dark-color/70 mb-2">
                  Thank you for using ClassPro this semester!
                </p>
                <p className="text-sm text-light-color/50 dark:text-dark-color/50">
                  Your Wrapped will be available for a limited time only.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tab navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-light-background-light/95 dark:bg-dark-background-dark/95 backdrop-blur-md border-t border-light-border/20 dark:border-dark-border/20 z-40 px-2 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center px-3 py-1 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'text-light-accent dark:text-dark-accent bg-light-background-normal/30 dark:bg-dark-background-normal/30'
                  : 'text-light-color/60 dark:text-dark-color/60'
              }`}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
