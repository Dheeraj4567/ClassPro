/**
 * Utilities for sharing ClassPro Wrapped results
 */

import { Mark } from "@/types/Marks";
import { Course } from "@/types/Course";
import { AttendanceCourse } from "@/types/Attendance";

/**
 * Generate an image from the Wrapped results card
 * This is a simplified version - in a real app, this would use canvas or a server-side rendering
 * @param elementId ID of the DOM element to convert to image
 * @returns Promise that resolves to a data URL for the image
 */
export const generateWrappedImage = async (elementId: string): Promise<string | null> => {
  // This is a placeholder implementation
  // In a real implementation, we would use html2canvas or similar library
  // For now, we'll just return a placeholder message
  console.log(`Would generate image from element with ID: ${elementId}`);
  
  // Simulating delay of image generation
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return null to indicate this is just a mock
  return null;
};

/**
 * Share the Wrapped results to social media or via native sharing API
 * @param wrappedData Wrapped data to share
 * @param shareText Text to include in the share
 */
export const shareWrappedResults = async (
  wrappedData: {
    marks: Mark[];
    courses: Course[];
    attendance: AttendanceCourse[];
  },
  shareText: string
): Promise<boolean> => {
  try {
    // Calculate overall average marks
    const overallPercentage = wrappedData.marks.length > 0 
      ? (wrappedData.marks.reduce(
          (acc, mark) => acc + (Number(mark.overall.scored) / Number(mark.overall.total) * 100), 0
        ) / wrappedData.marks.length).toFixed(1) 
      : "N/A";
    
    // Calculate average attendance
    const averageAttendance = wrappedData.attendance.length > 0 
      ? (wrappedData.attendance.reduce(
          (acc, course) => acc + parseFloat(course.attendancePercentage), 0
        ) / wrappedData.attendance.length).toFixed(1) 
      : "N/A";

    // Create share text
    const shareMessage = `${shareText}\n\nMy semester at a glance:\n🎯 Overall Score: ${overallPercentage}%\n📚 Courses: ${wrappedData.courses.length}\n📅 Attendance: ${averageAttendance}%\n\n#ClassProWrapped #AcademicJourney`;

    // Check if the Web Share API is available
    if (navigator.share) {
      await navigator.share({
        title: 'My ClassPro Wrapped',
        text: shareMessage,
        // In a real app, we would include a URL to a shareable version
        url: window.location.origin + '/academia/wrapped'
      });
      
      return true;
    } else {
      // Fallback for browsers that don't support the Web Share API
      // Copy to clipboard
      await navigator.clipboard.writeText(shareMessage);
      
      // Notify user it's copied to clipboard
      return true;
    }
  } catch (error) {
    console.error('Error sharing Wrapped results:', error);
    return false;
  }
};

/**
 * Download the Wrapped results as an image
 * @param elementId ID of the DOM element to convert to image
 */
export const downloadWrappedImage = async (elementId: string): Promise<boolean> => {
  try {
    const imageData = await generateWrappedImage(elementId);
    
    // In a real app, this would create and trigger download of the image
    // For this demo, just log it
    console.log('Would download image data:', !!imageData);
    
    // Mock success for demo purposes
    return true;
  } catch (error) {
    console.error('Error downloading Wrapped image:', error);
    return false;
  }
};
