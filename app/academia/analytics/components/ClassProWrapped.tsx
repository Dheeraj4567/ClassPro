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
    // Calculate top performing course
    const topCourse = [...marks].sort((a, b) => {
      const aScore = parseFloat(a.overall.scored || '0');
      const bScore = parseFloat(b.overall.scored || '0');
      return bScore - aScore;
    })[0];

    // Find lowest attendance course
    const lowestAttendance = [...attendance].sort((a, b) => {
      return parseFloat(a.attendancePercentage) - parseFloat(b.attendancePercentage);
    })[0];

    // Calculate average scores
    const avgScore = marks.reduce((acc, mark) => {
      return acc + parseFloat(mark.overall.scored || '0');
    }, 0) / marks.length;

    // Calculate total attendance percentage
    const avgAttendance = attendance.reduce((acc, course) => {
      return acc + parseFloat(course.attendancePercentage);
    }, 0) / attendance.length;

    // Calculate study streak (this would normally come from actual usage data)
    // For demo purposes, we'll generate a random number between 5-20
    const studyStreak = Math.floor(Math.random() * 16) + 5;

    // Determine most active study day/time based on attendance
    // This is simulated data - in a real app, this would use actual app usage patterns
    const daysOfWeek = ['Monday', 'Wednesday', 'Friday'];
    const mostActiveDay = daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)];

    // Create slides array with insights
    const newSlides: WrappedSlide[] = [
      {
        id: 'intro',
        title: 'Your Academic Year in Review',
        subtitle: 'Swipe to see your personalized insights',
        type: 'intro',
        color: 'bg-gradient-to-br from-purple-600 to-blue-500'
      },
      {
        id: 'top-course',
        title: 'Your Top Course',
        subtitle: topCourse ? `${topCourse.courseName} - ${topCourse.overall.scored || 0}/${topCourse.overall.total}` : 'No data available',
        type: 'highlight',
        data: topCourse,
        color: 'bg-gradient-to-br from-green-500 to-teal-400'
      },
      {
        id: 'study-streak',
        title: 'Your Study Streak',
        subtitle: `${studyStreak} Days`,
        type: 'stat',
        data: { studyStreak },
        color: 'bg-gradient-to-br from-orange-500 to-yellow-400'
      },
      {
        id: 'attendance-insight',
        title: 'Attendance Champion',
        subtitle: `${avgAttendance.toFixed(1)}% Average Attendance`,
        type: 'stat',
        data: { avgAttendance },
        color: 'bg-gradient-to-br from-blue-500 to-indigo-600'
      },
      {
        id: 'avg-performance',
        title: 'Overall Performance',
        subtitle: `${avgScore.toFixed(2)} Points Average`,
        type: 'chart',
        data: { avgScore, marks },
        color: 'bg-gradient-to-br from-pink-500 to-rose-400'
      },
      {
        id: 'active-time',
        title: 'Your Study Pattern',
        subtitle: `Most active on ${mostActiveDay}s`,
        type: 'stat',
        data: { mostActiveDay },
        color: 'bg-gradient-to-br from-violet-500 to-purple-400'
      },
      {
        id: 'attendance-challenge',
        title: 'Room for Improvement',
        subtitle: lowestAttendance ? 
          `${lowestAttendance.courseTitle} - ${lowestAttendance.attendancePercentage}% attendance` :
          'Great attendance across all courses!',
        type: 'highlight',
        data: lowestAttendance,
        color: 'bg-gradient-to-br from-red-500 to-orange-400'
      },
      {
        id: 'final',
        title: 'You\'ve Had a Great Semester!',
        subtitle: 'Keep up the good work',
        type: 'final',
        color: 'bg-gradient-to-br from-indigo-600 to-violet-500'
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

  // Render chart based on marks data
  const renderChart = (data: any) => {
    const { marks } = data;
    if (!marks || !marks.length) return null;

    return (
      <div className="w-full h-48 relative flex items-end justify-between mt-4 mb-6 px-4">
        {marks.map((mark: Mark, index: number) => {
          const score = parseFloat(mark.overall.scored || '0');
          const total = parseFloat(mark.overall.total || '100');
          const percentage = (score / total) * 100;
          const height = `${percentage}%`;
          
          return (
            <div key={mark.courseCode} className="flex flex-col items-center">
              <div 
                className="w-4 md:w-6 rounded-t-md bg-white bg-opacity-80" 
                style={{ height, minHeight: '10px' }}
              ></div>
              <span className="text-xs mt-2 text-white rotate-90 md:rotate-0">
                {mark.courseCode.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render stat visualization
  const renderStat = (data: any, type: string) => {
    switch (type) {
      case 'attendance-insight':
        return (
          <div className="flex flex-col items-center justify-center mt-8">
            <div className="relative w-40 h-40 rounded-full border-8 border-white border-opacity-30 flex items-center justify-center">
              <div className="text-white text-5xl font-bold">{data.avgAttendance.toFixed(1)}%</div>
              <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="8" 
                  strokeOpacity="0.2"
                />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="8" 
                  strokeDasharray={`${data.avgAttendance * 2.83} 283`} 
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            <div className="text-white mt-4 opacity-75">Your average attendance</div>
          </div>
        );
      case 'study-streak':
        return (
          <div className="flex flex-col items-center justify-center mt-8">
            <div className="relative flex items-center">
              <span className="text-white text-7xl font-bold">{data.studyStreak}</span>
              <div className="ml-2 flex flex-col">
                <span className="text-white text-xl">days</span>
                <span className="text-white text-xl">streak</span>
              </div>
            </div>
            <div className="flex mt-6">
              {Array(7).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-8 h-8 mx-1 rounded-md ${i < 5 ? 'bg-white bg-opacity-80' : 'bg-white bg-opacity-30'}`}
                ></div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center mt-8">
            <div className="text-white text-6xl font-bold">{data.mostActiveDay}</div>
            <div className="text-white mt-4 opacity-75">is your most productive day</div>
          </div>
        );
    }
  };

  // Render specific highlight visualization
  const renderHighlight = (data: any, slideId: string) => {
    if (slideId === 'top-course' && data) {
      return (
        <div className="flex flex-col items-center justify-center mt-6">
          <div className="w-32 h-32 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-4">
            <span className="text-white text-5xl font-bold">{data.overall?.scored || '?'}</span>
          </div>
          <div className="text-white text-xl text-center max-w-[80%]">{data.courseName}</div>
        </div>
      );
    } else if (slideId === 'attendance-challenge' && data) {
      return (
        <div className="flex flex-col items-center justify-center mt-6">
          <div className="w-32 h-32 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-4">
            <span className="text-white text-5xl font-bold">{data.attendancePercentage}%</span>
          </div>
          <div className="text-white text-xl text-center max-w-[80%]">{data.courseTitle}</div>
        </div>
      );
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
            <div className="text-white opacity-70 mt-auto">{slide.subtitle}</div>
          </div>
        );
      case 'chart':
        return (
          <div className="flex flex-col items-center justify-between h-full py-10 px-6">
            <div className="text-white text-3xl md:text-4xl font-bold text-center">{slide.title}</div>
            {renderChart(slide.data)}
            <div className="text-white opacity-70 mt-4">{slide.subtitle}</div>
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
            <div className="text-white text-4xl md:text-5xl font-bold mb-4">Well Done!</div>
            <div className="text-white text-xl md:text-2xl mb-8">{slide.title}</div>
            <div className="text-white opacity-70 mb-12">{slide.subtitle}</div>
            <button
              onClick={handleCloseWrapped}
              className="px-8 py-3 bg-white text-purple-700 rounded-full font-bold"
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
        className={`group cursor-pointer relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] ${hasViewed ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-green-400 to-blue-500'}`}
        onClick={handleOpenWrapped}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/50" />
          {/* Animated music waves for visual effect */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end h-20">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`mx-1 w-1.5 bg-white rounded-t-md animate-pulse`}
                style={{
                  height: `${(i % 3 + 1) * 20}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s',
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
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
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
          <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-white rounded-full text-xs font-medium text-purple-600">
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
