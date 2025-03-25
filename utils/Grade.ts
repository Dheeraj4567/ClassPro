import { grade_points } from "@/types/Grade";

/**
 * Determines the grade based on lost marks
 * @param lostMark Number of marks lost out of 100
 * @returns Grade string (O, A+, A, B+, B, C, F)
 */
export function determineGrade(lostMark: number): string {
  if (lostMark >= 36) return "B";
  if (lostMark >= 27) return "B+";
  if (lostMark >= 18) return "A";
  if (lostMark >= 9) return "A+";
  if (lostMark >= 0) return "O";
  return "C";
} 