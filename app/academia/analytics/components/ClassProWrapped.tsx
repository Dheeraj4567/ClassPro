"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mark } from '@/types/Marks';
import { Course } from '@/types/Course';
import { AttendanceCourse } from '@/types/Attendance';
import { motion, AnimatePresence } from 'framer-motion';
import { lightHaptics, mediumHaptics, strongHaptics } from '@/utils/haptics';
import { useMobileView } from './MobileContext';

interface ClassProWrappedProps {
  marks?: Mark[];
  courses?: Course[];
  attendance?: AttendanceCourse[];
}

// Define slide types for the wrapped experience
type WrappedSlide = {
  id: string;
  title: string;
  subtitle?: string;
  type: 'intro' | 'stat' | 'chart' | 'highlight' | 'final';
  data?: any;
  color: string;
};

const ClassProWrapped = React.forwardRef<{ setIsOpen: (isOpen: boolean) => void }, ClassProWrappedProps>(
  ({ marks = [], courses = [], attendance = [] }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState<WrappedSlide[]>([]);
  const [hasViewed, setHasViewed] = useState(false);
  
  // Expose setIsOpen method to parent components through the forwarded ref
  React.useImperativeHandle(ref, () => ({
    setIsOpen: (open: boolean) => {
      if (open) {
        handleOpenWrapped();
      } else {
        handleCloseWrapped();
      }
    }
  }));
  const { isMobileView } = useMobileView();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const slideRef = useRef<HTMLDivElement>(null);

  // Generate insights from user data
  useEffect(() => {
    if (marks.length && courses.length && attendance.length) {
      generateInsights();
    }
  }, [marks, courses, attendance]);

  const generateInsights = () => {
    // Calculate top performing course with detailed analysis
    const coursesWithScores = marks.map(mark => ({
      ...mark,
      scorePercentage: (parseFloat(mark.overall.scored || '0') / parseFloat(mark.overall.total || '100')) * 100
    })).sort((a, b) => b.scorePercentage - a.scorePercentage);
    
    const topCourse = coursesWithScores[0];
    const weakestCourse = coursesWithScores[coursesWithScores.length - 1];

    // Find attendance insights
    const attendanceWithDetails = attendance.map(course => ({
      ...course,
      percentage: parseFloat(course.attendancePercentage)
    })).sort((a, b) => b.percentage - a.percentage);
    
    const bestAttendanceCourse = attendanceWithDetails[0];
    const worstAttendanceCourse = attendanceWithDetails[attendanceWithDetails.length - 1];

    // Calculate comprehensive averages
    const avgScore = coursesWithScores.reduce((acc, course) => acc + course.scorePercentage, 0) / coursesWithScores.length;
    const avgAttendance = attendanceWithDetails.reduce((acc, course) => acc + course.percentage, 0) / attendanceWithDetails.length;

    // Generate more realistic study streak based on attendance patterns
    const attendanceConsistency = attendanceWithDetails.filter(course => course.percentage >= 75).length;
    const studyStreak = Math.min(Math.max(attendanceConsistency * 3 + Math.floor(avgScore / 10), 5), 30);

    // Determine study patterns based on actual data
    const strongSubjects = coursesWithScores.filter(course => course.scorePercentage >= 80).length;
    const improvementNeeded = coursesWithScores.filter(course => course.scorePercentage < 60).length;

    // Calculate grade distribution
    const gradeDistribution = {
      excellent: coursesWithScores.filter(course => course.scorePercentage >= 90).length,
      good: coursesWithScores.filter(course => course.scorePercentage >= 75 && course.scorePercentage < 90).length,
      average: coursesWithScores.filter(course => course.scorePercentage >= 60 && course.scorePercentage < 75).length,
      needsWork: coursesWithScores.filter(course => course.scorePercentage < 60).length
    };

    // Generate semester insights
    const semesterGrade = avgScore >= 90 ? 'Outstanding' : 
                         avgScore >= 80 ? 'Excellent' : 
                         avgScore >= 70 ? 'Good' : 
                         avgScore >= 60 ? 'Satisfactory' : 'Needs Improvement';

    const attendanceGrade = avgAttendance >= 90 ? 'Excellent' : 
                           avgAttendance >= 80 ? 'Good' : 
                           avgAttendance >= 75 ? 'Satisfactory' : 'Poor';

    // Create slides array with enhanced insights
    const newSlides: WrappedSlide[] = [
      {
        id: 'intro',
        title: 'Your Academic Year in Review',
        subtitle: 'Discover your learning journey and achievements',
        type: 'intro',
        color: 'bg-light-accent dark:bg-dark-accent'
      },
      {
        id: 'semester-overview',
        title: 'Semester Performance',
        subtitle: `${semesterGrade} • ${avgScore.toFixed(1)}% Average`,
        type: 'stat',
        data: { 
          avgScore, 
          semesterGrade,
          totalCourses: courses.length,
          gradeDistribution 
        },
        color: avgScore >= 80 ? 'bg-green-600 dark:bg-green-700' : 
               avgScore >= 70 ? 'bg-blue-600 dark:bg-blue-700' : 'bg-orange-600 dark:bg-orange-700'
      },
      {
        id: 'top-course',
        title: 'Academic Excellence',
        subtitle: topCourse ? 
          `${topCourse.courseName} • ${topCourse.scorePercentage.toFixed(1)}%` : 
          'No top course data available',
        type: 'highlight',
        data: { 
          ...topCourse, 
          improvement: strongSubjects,
          totalCourses: courses.length 
        },
        color: 'bg-emerald-600 dark:bg-emerald-700'
      },
      {
        id: 'attendance-champion',
        title: 'Attendance Excellence',
        subtitle: `${attendanceGrade} • ${avgAttendance.toFixed(1)}% Average`,
        type: 'stat',
        data: { 
          avgAttendance, 
          attendanceGrade,
          bestCourse: bestAttendanceCourse,
          consistency: attendanceConsistency
        },
        color: avgAttendance >= 85 ? 'bg-blue-600 dark:bg-blue-700' : 
               avgAttendance >= 75 ? 'bg-cyan-600 dark:bg-cyan-700' : 'bg-yellow-600 dark:bg-yellow-700'
      },
      {
        id: 'study-consistency',
        title: 'Study Consistency',
        subtitle: `${studyStreak} Day Learning Streak`,
        type: 'stat',
        data: { 
          studyStreak, 
          consistentCourses: attendanceConsistency,
          totalCourses: courses.length 
        },
        color: 'bg-purple-600 dark:bg-purple-700'
      },
      {
        id: 'performance-chart',
        title: 'Course Performance Overview',
        subtitle: `${strongSubjects} strong subjects out of ${courses.length}`,
        type: 'chart',
        data: { 
          avgScore, 
          marks: coursesWithScores,
          gradeDistribution,
          strongSubjects
        },
        color: 'bg-indigo-600 dark:bg-indigo-700'
      },
      {
        id: 'growth-opportunity',
        title: improvementNeeded > 0 ? 'Growth Opportunities' : 'Consistent Excellence',
        subtitle: improvementNeeded > 0 ? 
          `${improvementNeeded} subject${improvementNeeded > 1 ? 's' : ''} to focus on` :
          'Outstanding performance across all subjects!',
        type: 'highlight',
        data: { 
          weakestCourse, 
          improvementNeeded,
          worstAttendanceCourse: worstAttendanceCourse?.percentage < 75 ? worstAttendanceCourse : null
        },
        color: improvementNeeded > 0 ? 'bg-red-600 dark:bg-red-700' : 'bg-green-600 dark:bg-green-700'
      },
      {
        id: 'final-celebration',
        title: 'Semester Complete!',
        subtitle: `You've shown ${semesterGrade.toLowerCase()} academic performance`,
        type: 'final',
        data: {
          semesterGrade,
          avgScore,
          avgAttendance,
          achievements: {
            topScore: topCourse?.scorePercentage.toFixed(1),
            bestAttendance: bestAttendanceCourse?.percentage.toFixed(1),
            consistency: studyStreak
          }
        },
        color: 'bg-gradient-to-br from-light-accent to-blue-600 dark:from-dark-accent dark:to-blue-700'
      },
    ];

    setSlides(newSlides);
  };

  const handleOpenWrapped = () => {
    lightHaptics();
    setIsOpen(true);
    setHasViewed(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind the modal
  };

  const handleCloseWrapped = () => {
    mediumHaptics();
    setIsOpen(false);
    setCurrentSlideIndex(0);
    document.body.style.overflow = '';
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      lightHaptics();
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      // On last slide, provide stronger haptic feedback
      strongHaptics();
      handleCloseWrapped();
    }
  };

  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      lightHaptics();
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  // Touch swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    
    // Detect swipe (with threshold of 50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped left
        goToNextSlide();
      } else {
        // Swiped right
        goToPrevSlide();
      }
    }
  };

  // Render enhanced chart based on marks data
  const renderChart = (data: any) => {
    const { marks, gradeDistribution, strongSubjects } = data;
    if (!marks || !marks.length) return null;

    return (
      <div className="w-full mt-6 mb-6">
        {/* Performance bars */}
        <div className="w-full h-48 relative flex items-end justify-between px-4 mb-6">
          {marks.slice(0, 6).map((mark: any, index: number) => {
            const percentage = mark.scorePercentage;
            const height = `${Math.max(percentage, 5)}%`;
            const barColor = percentage >= 90 ? 'bg-green-400' : 
                            percentage >= 75 ? 'bg-blue-400' : 
                            percentage >= 60 ? 'bg-yellow-400' : 'bg-red-400';
            
            return (
              <div key={mark.courseCode} className="flex flex-col items-center flex-1 max-w-[60px]">
                <div 
                  className={`w-full rounded-t-md ${barColor} bg-opacity-90 transition-all duration-500`}
                  style={{ height, minHeight: '10px' }}
                ></div>
                <div className="text-white text-xs mt-2 text-center">
                  <div className="font-semibold">{percentage.toFixed(0)}%</div>
                  <div className="opacity-75 truncate w-full">
                    {mark.courseCode.split(' ')[0]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance summary */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-4 text-center text-white">
            <div>
              <div className="text-2xl font-bold text-green-300">{strongSubjects}</div>
              <div className="text-sm opacity-75">Strong Subjects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-300">{marks.length}</div>
              <div className="text-sm opacity-75">Total Courses</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render stat visualization with enhanced data
  const renderStat = (data: any, slideId: string) => {
    switch (slideId) {
      case 'semester-overview':
        return (
          <div className="flex flex-col items-center justify-center mt-8">
            <div className="relative w-48 h-48 rounded-full border-8 border-white border-opacity-30 flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="text-white text-4xl font-bold">{data.avgScore.toFixed(1)}%</div>
                <div className="text-white text-sm opacity-75">{data.semesterGrade}</div>
              </div>
              <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="6" 
                  strokeOpacity="0.2"
                />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="6" 
                  strokeDasharray={`${data.avgScore * 2.83} 283`} 
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="text-white">
                <div className="text-2xl font-bold">{data.gradeDistribution.excellent}</div>
                <div className="text-sm opacity-75">Excellent (90%+)</div>
              </div>
              <div className="text-white">
                <div className="text-2xl font-bold">{data.gradeDistribution.good}</div>
                <div className="text-sm opacity-75">Good (75-89%)</div>
              </div>
            </div>
          </div>
        );
      case 'attendance-champion':
        return (
          <div className="flex flex-col items-center justify-center mt-8">
            <div className="relative w-44 h-44 rounded-full border-8 border-white border-opacity-30 flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="text-white text-5xl font-bold">{data.avgAttendance.toFixed(0)}%</div>
                <div className="text-white text-sm opacity-75">{data.attendanceGrade}</div>
              </div>
              <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="42" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="8" 
                  strokeOpacity="0.2"
                />
                <circle 
                  cx="50" cy="50" r="42" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="8" 
                  strokeDasharray={`${data.avgAttendance * 2.64} 264`} 
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            {data.bestCourse && (
              <div className="text-white text-center mt-4">
                <div className="text-lg font-semibold">{data.bestCourse.courseTitle}</div>
                <div className="text-sm opacity-75">Best attendance: {data.bestCourse.percentage.toFixed(1)}%</div>
              </div>
            )}
          </div>
        );
      case 'study-consistency':
        return (
          <div className="flex flex-col items-center justify-center mt-8">
            <div className="relative flex items-center mb-6">
              <span className="text-white text-8xl font-bold">{data.studyStreak}</span>
              <div className="ml-3 flex flex-col">
                <span className="text-white text-2xl font-semibold">days</span>
                <span className="text-white text-lg opacity-75">streak</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center max-w-xs">
              {Array(Math.min(data.studyStreak, 14)).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className="w-6 h-6 m-1 rounded-md bg-white bg-opacity-80"
                ></div>
              ))}
              {data.studyStreak > 14 && (
                <div className="text-white text-sm opacity-75 mt-2">
                  +{data.studyStreak - 14} more days
                </div>
              )}
            </div>
            <div className="text-white text-center mt-4">
              <div className="text-sm opacity-75">
                {data.consistentCourses}/{data.totalCourses} courses with 75%+ attendance
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Render enhanced highlight visualization
  const renderHighlight = (data: any, slideId: string) => {
    if (slideId === 'top-course' && data) {
      return (
        <div className="flex flex-col items-center justify-center mt-6">
          <div className="w-36 h-36 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-6 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-white text-4xl font-bold">{data.scorePercentage?.toFixed(1) || '?'}%</div>
              <div className="text-white text-xs opacity-75">Top Score</div>
            </div>
          </div>
          <div className="text-white text-center max-w-[85%]">
            <div className="text-xl font-semibold mb-2">{data.courseName || 'Course Name'}</div>
            {data.improvement > 0 && (
              <div className="text-sm opacity-75">
                {data.improvement} out of {data.totalCourses} subjects performing well
              </div>
            )}
          </div>
        </div>
      );
    } else if (slideId === 'growth-opportunity' && data) {
      if (data.improvementNeeded === 0) {
        // Excellent performance across all subjects
        return (
          <div className="flex flex-col items-center justify-center mt-6">
            <div className="w-36 h-36 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-6 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-white text-6xl">🏆</div>
              </div>
            </div>
            <div className="text-white text-center max-w-[85%]">
              <div className="text-lg font-semibold mb-2">Outstanding Achievement!</div>
              <div className="text-sm opacity-75">
                Consistent excellence across all subjects
              </div>
            </div>
          </div>
        );
      } else {
        // Show improvement opportunity
        return (
          <div className="flex flex-col items-center justify-center mt-6">
            <div className="w-36 h-36 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-6 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-white text-4xl font-bold">{data.weakestCourse?.scorePercentage?.toFixed(1) || '?'}%</div>
                <div className="text-white text-xs opacity-75">Focus Area</div>
              </div>
            </div>
            <div className="text-white text-center max-w-[85%]">
              <div className="text-lg font-semibold mb-2">{data.weakestCourse?.courseName || 'Subject'}</div>
              <div className="text-sm opacity-75 mb-4">
                Room for improvement in this subject
              </div>
              {data.worstAttendanceCourse && (
                <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-sm">
                    <div className="font-medium">{data.worstAttendanceCourse.courseTitle}</div>
                    <div className="opacity-75">{data.worstAttendanceCourse.percentage.toFixed(1)}% attendance</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  // Progress indicator
  const ProgressIndicator = () => {
    return (
      <div className="flex justify-center mt-4">
        {slides.map((_, index) => (
          <div 
            key={index} 
            className={`w-2 h-2 mx-1 rounded-full ${
              index === currentSlideIndex ? 'bg-white' : 'bg-white bg-opacity-30'
            }`}
          ></div>
        ))}
      </div>
    );
  };

  // Render appropriate slide content
  const renderSlideContent = (slide: WrappedSlide) => {
    switch(slide.type) {
      case 'intro':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="text-white text-4xl md:text-5xl font-bold mb-4">ClassPro Wrapped</div>
            <div className="text-white text-xl md:text-2xl mb-8">{slide.title}</div>
            <div className="text-white opacity-70">{slide.subtitle}</div>
            <div className="mt-12 animate-bounce">
              <svg className="w-8 h-8 text-white" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>
        );
      case 'stat':
        return (
          <div className="flex flex-col items-center justify-between h-full py-10 px-6">
            <div className="text-white text-3xl md:text-4xl font-bold text-center">{slide.title}</div>
            {renderStat(slide.data, slide.id)}
            <div className="text-white opacity-70 mt-auto text-center">{slide.subtitle}</div>
          </div>
        );
      case 'chart':
        return (
          <div className="flex flex-col items-center justify-between h-full py-10 px-6">
            <div className="text-white text-3xl md:text-4xl font-bold text-center">{slide.title}</div>
            {renderChart(slide.data)}
            <div className="text-white opacity-70 mt-4 text-center">{slide.subtitle}</div>
          </div>
        );
      case 'highlight':
        return (
          <div className="flex flex-col items-center justify-between h-full py-10 px-6">
            <div className="text-white text-3xl md:text-4xl font-bold text-center">{slide.title}</div>
            {renderHighlight(slide.data, slide.id)}
            <div className="text-white opacity-70 mt-auto">{slide.subtitle}</div>
          </div>
        );
      case 'final':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="text-white text-4xl md:text-5xl font-bold mb-4">Semester Complete!</div>
            <div className="text-white text-xl md:text-2xl mb-8">{slide.title}</div>
            
            {slide.data?.achievements && (
              <div className="bg-white bg-opacity-10 rounded-xl p-6 mb-8 backdrop-blur-sm max-w-md">
                <div className="grid grid-cols-3 gap-4 text-white">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">{slide.data.achievements.topScore}%</div>
                    <div className="text-xs opacity-75">Top Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-300">{slide.data.achievements.bestAttendance}%</div>
                    <div className="text-xs opacity-75">Best Attendance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-300">{slide.data.achievements.consistency}</div>
                    <div className="text-xs opacity-75">Day Streak</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-white opacity-70 mb-8">{slide.subtitle}</div>
            <button
              onClick={handleCloseWrapped}
              className="px-8 py-3 bg-white dark:bg-light-color text-light-accent dark:text-dark-accent rounded-full font-bold hover:bg-opacity-90 transition-all duration-200 shadow-lg"
            >
              Close Wrapped
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (!marks.length || !courses.length || !attendance.length) {
    return null;
  }

  return (
    <>
      <div 
        className={`group cursor-pointer relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] ${hasViewed ? 'bg-light-accent dark:bg-dark-accent' : 'bg-light-accent dark:bg-dark-accent'} border border-light-background-darker dark:border-dark-background-darker`}
        onClick={handleOpenWrapped}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/20" />
          {/* Animated stats visualization for visual effect */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end h-16 px-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`mx-1 w-2 bg-white dark:bg-light-color rounded-t-md animate-pulse`}
                style={{
                  height: `${(i % 3 + 1) * 15}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s',
                }}
              ></div>
            ))}
          </div>
        </div>
        <div className="relative z-10 p-6 flex justify-between items-center">
          <div>
            <h3 className="text-white text-xl font-semibold">Your ClassPro Wrapped</h3>
            <p className="text-white text-sm opacity-80">
              {hasViewed ? 'Revisit your semester analytics' : 'NEW! See your semester in review'}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.5 5L15.5 12L8.5 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        {!hasViewed && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-white dark:bg-light-color rounded-full text-xs font-medium text-light-accent dark:text-dark-accent">
            NEW
          </div>
        )}
      </div>

      {/* Full-screen modal for wrapped experience */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 w-full h-full"
          >
            <div className="absolute inset-0 bg-black">
              <div 
                ref={slideRef}
                className="w-full h-full"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {slides.length > 0 && (
                  <motion.div
                    key={currentSlideIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`w-full h-full ${slides[currentSlideIndex].color}`}
                  >
                    {renderSlideContent(slides[currentSlideIndex])}
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-between px-6">
                  <button
                    onClick={goToPrevSlide}
                    disabled={currentSlideIndex === 0}
                    className={`w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center ${
                      currentSlideIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
                    }`}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  
                  <ProgressIndicator />
                  
                  <button
                    onClick={goToNextSlide}
                    className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>

                {/* Close button */}
                <button
                  onClick={handleCloseWrapped}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
                >
                  <svg className="w-6 h-6 text-white" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
});

// Type assertion to properly handle the forwardRef component with displayName
export default React.memo(ClassProWrapped) as unknown as React.ForwardRefExoticComponent<
  ClassProWrappedProps & React.RefAttributes<{ setIsOpen: (isOpen: boolean) => void }>
>;
