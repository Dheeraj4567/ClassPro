import { NextResponse } from 'next/server';
import { Mark, Marks, TestPerformance } from '@/types/Marks';
import { Course } from '@/types/Course';
import { AttendanceCourse } from '@/types/Attendance';

/**
 * API endpoint to fetch all data needed for ClassPro Wrapped
 * This combines marks, courses, and attendance data in a single request
 * to make the frontend implementation simpler and more efficient
 * 
 * If the user is not authenticated, it will redirect to login
 */
export async function GET() {
  // In a real implementation, we would check authentication
  // const session = await getServerSession(authOptions);
  
  // if (!session) {
  //   return NextResponse.redirect(new URL('/auth/login', request.url));
  // }

  // Mock data for ClassPro Wrapped
  // In a real implementation, this would be fetched from a database
  const marks: Mark[] = [
    {
      courseCode: "CSE101",
      courseName: "Introduction to Computer Science",
      courseType: "Theory",
      overall: { scored: "82", total: "100" },
      testPerformance: [
        { test: "Continuous", marks: { scored: "40", total: "50" } },
        { test: "Term", marks: { scored: "42", total: "50" } }
      ]
    },
    {
      courseCode: "MAT202",
      courseName: "Advanced Mathematics",
      courseType: "Theory",
      overall: { scored: "75", total: "100" },
      testPerformance: [
        { test: "Continuous", marks: { scored: "35", total: "50" } },
        { test: "Term", marks: { scored: "40", total: "50" } }
      ]
    },
    {
      courseCode: "ENG303",
      courseName: "Technical Writing",
      courseType: "Theory",
      overall: { scored: "91", total: "100" },
      testPerformance: [
        { test: "Continuous", marks: { scored: "45", total: "50" } },
        { test: "Term", marks: { scored: "46", total: "50" } }
      ]
    },
    {
      courseCode: "PHY101",
      courseName: "Physics Fundamentals",
      courseType: "Theory",
      overall: { scored: "78", total: "100" },
      testPerformance: [
        { test: "Continuous", marks: { scored: "38", total: "50" } },
        { test: "Term", marks: { scored: "40", total: "50" } }
      ]
    }
  ];

  const courses: Course[] = [
    { 
      code: "CSE101", 
      title: "Introduction to Computer Science", 
      credit: "4", 
      slot: "A",
      academicYear: "2024-25",
      category: "Core",
      courseCategory: "Regular",
      faculty: "Dr. Smith",
      room: "CS101",
      slotType: "Theory",
      type: "Regular"
    },
    { 
      code: "MAT202", 
      title: "Advanced Mathematics", 
      credit: "4", 
      slot: "B",
      academicYear: "2024-25",
      category: "Core",
      courseCategory: "Regular",
      faculty: "Dr. Johnson",
      room: "MA203",
      slotType: "Theory",
      type: "Regular"
    },
    { 
      code: "ENG303", 
      title: "Technical Writing", 
      credit: "3", 
      slot: "C",
      academicYear: "2024-25",
      category: "Elective",
      courseCategory: "Regular",
      faculty: "Prof. Williams",
      room: "EN105",
      slotType: "Theory",
      type: "Regular"
    },
    { 
      code: "PHY101", 
      title: "Physics Fundamentals", 
      credit: "4", 
      slot: "D",
      academicYear: "2024-25",
      category: "Core",
      courseCategory: "Regular",
      faculty: "Dr. Brown",
      room: "PH201",
      slotType: "Theory",
      type: "Regular"
    }
  ];

  const attendance: AttendanceCourse[] = [
    { 
      courseCode: "CSE101", 
      courseTitle: "Introduction to Computer Science", 
      attendancePercentage: "92", 
      hoursAbsent: "4", 
      hoursConducted: "50",
      category: "Theory",
      facultyName: "Dr. Smith",
      slot: "A"
    },
    { 
      courseCode: "MAT202", 
      courseTitle: "Advanced Mathematics", 
      attendancePercentage: "86", 
      hoursAbsent: "7", 
      hoursConducted: "50",
      category: "Theory",
      facultyName: "Dr. Johnson",
      slot: "B"
    },
    { 
      courseCode: "ENG303", 
      courseTitle: "Technical Writing", 
      attendancePercentage: "95", 
      hoursAbsent: "2", 
      hoursConducted: "40",
      category: "Theory",
      facultyName: "Prof. Williams",
      slot: "C"
    },
    { 
      courseCode: "PHY101", 
      courseTitle: "Physics Fundamentals", 
      attendancePercentage: "78", 
      hoursAbsent: "11", 
      hoursConducted: "50",
      category: "Theory",
      facultyName: "Dr. Brown",
      slot: "D"
    }
  ];

  return NextResponse.json({
    marks,
    courses,
    attendance
  });
}
