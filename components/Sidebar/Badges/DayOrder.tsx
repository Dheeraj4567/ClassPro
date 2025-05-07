import { fetchCalendar } from "@/hooks/fetchCalendar";
import React from "react";

export default async function DayOrder({
	mini,
	...props
}: {
	mini?: boolean;
	className?: string;
}) {
	// Get the complete calendar data to ensure consistency
	const calendarData = await fetchCalendar();
	const { today, calendar } = calendarData;

	// First approach: Extract day order from the format (e.g., "DO-5" → "5")
	let dayOrder = today?.dayOrder;
	let day = dayOrder;
	
	// Handle "DO-X" format
	// Ensure dayOrder is a valid number or fallback to a default value
	if (dayOrder?.includes("DO-") || dayOrder?.includes("-")) {
		const parts = dayOrder.split("-");
		if (parts.length === 2 && parts[1] && !isNaN(Number(parts[1]))) {
			day = parts[1]; // Extract the number after the hyphen
		} else {
			day = "1"; // Fallback to a default day order if parsing fails
		}
	}
	
	// Double-check against calendar data for current date
	// This ensures consistency with what's displayed in the calendar page
	if (calendar && calendar.length > 0) {
		const currentDate = new Date();
		const currentMonth = currentDate.getMonth();
		const currentDay = currentDate.getDate();
		
		// Find the current month in calendar data
		const currentMonthData = calendar.find(month => {
			// Extract month name from calendar data format (e.g., "May '24")
			const monthName = month.month.split("'")[0].trim();
			const monthIndex = [
				"January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			].indexOf(monthName);
			return monthIndex === currentMonth;
		});
		
		if (currentMonthData) {
			// Find the current day in the month data
			const currentDayData = currentMonthData.days.find(d => 
				parseInt(d.date) === currentDay
			);
			
			// If found in calendar, use that day order for consistency
			if (currentDayData && currentDayData.dayOrder) {
				// Only update if it's not a holiday indicator
				if (currentDayData.dayOrder !== "-" && !isNaN(Number(currentDayData.dayOrder))) {
					day = currentDayData.dayOrder;
				} else {
					day = "1"; // Fallback to a default day order if invalid
				}
			}
		}
	}
	
	// Final determination if it's a holiday
	const isHoliday = !day || day === "-";

	return (
		<div
			role="banner"
			className={`w-fit cursor-default rounded-full px-3 py-1 ${
				isHoliday
					? "bg-light-error-background dark:bg-dark-error-background"
					: "bg-light-side dark:bg-dark-side"
			} ${props.className}`}
		>
			{isHoliday ? (
				<span
					aria-hidden="true"
					// biome-ignore lint/style/useNamingConvention: <explanation>
					style={{ WebkitUserSelect: "none" }}
					title={"Holiday"}
					className="select-none text-md font-medium text-light-error-color dark:text-dark-error-color"
				>
					{mini ? "H" : "Holiday"}
				</span>
			) : (
				<span
					title={`Day Order: ${day}`}
					className={`${mini ? "flex h-6 w-2 items-center justify-center text-sm" : "text-base"} font-medium text-light-accent dark:text-dark-accent`}
				>
					{mini ? "" : "Day Order: "}
					{day}
				</span>
			)}
		</div>
	);
}
