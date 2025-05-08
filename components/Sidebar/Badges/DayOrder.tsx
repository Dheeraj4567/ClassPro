import { fetchCalendar } from "@/hooks/fetchCalendar";
import React from "react";

// Helper function to parse various day order string formats
const parseDayOrderStatus = (dayOrderStr: string | undefined): string => {
	if (!dayOrderStr) return "1"; // Default for undefined or empty string

	const lowerDayOrderStr = dayOrderStr.toLowerCase();
	if (lowerDayOrderStr === "holiday" || dayOrderStr === "-") {
		return "Holiday";
	}

	// Extracts trailing digits, e.g., "2" from "Day-2", "DO-2", or "Order 2"
	const match = dayOrderStr.match(/(\d+)$/);
	if (match && match[1]) {
		const numStr = match[1];
		// Ensure it's a simple number string after extraction
		if (!isNaN(Number(numStr))) {
			return numStr;
		}
	}

	// If the string itself is a number
	if (!isNaN(Number(dayOrderStr))) {
		return dayOrderStr;
	}

	// Fallback for unparseable formats like "Day Order ---" or other non-numeric, non-holiday text
	return "1";
};

export default async function DayOrder({
	mini,
	...props
}: {
	mini?: boolean;
	className?: string;
}) {
	const calendarData = await fetchCalendar();
	const { today, calendar } = calendarData;

	let determinedDayOrder: string | null = null;

	// 1. Try to get day order from the detailed calendar data for today
	if (calendar && calendar.length > 0) {
		const currentDate = new Date();
		const currentMonthIndex = currentDate.getMonth();
		const currentDayOfMonth = currentDate.getDate();

		const currentMonthData = calendar.find(month => {
			const monthName = month.month.split("'")[0].trim().toLowerCase();
			const monthMap: { [key: string]: number } = {
				"january": 0, "february": 1, "march": 2, "april": 3, "may": 4, "june": 5,
				"july": 6, "august": 7, "september": 8, "october": 9, "november": 10, "december": 11
			};
			return monthMap[monthName] === currentMonthIndex;
		});

		if (currentMonthData) {
			const currentDayData = currentMonthData.days.find(d =>
				parseInt(d.date) === currentDayOfMonth
			);

			if (currentDayData && typeof currentDayData.dayOrder === 'string') {
				determinedDayOrder = parseDayOrderStatus(currentDayData.dayOrder);
			}
		}
	}

	// 2. If not found or inconclusive (i.e., resulted in "1") from specific calendar data, try `today.dayOrder`
	if (!determinedDayOrder || determinedDayOrder === "1") {
		if (today?.dayOrder) {
			const dayOrderFromTodayObject = parseDayOrderStatus(today.dayOrder);
			// Use today.dayOrder if it's more specific than "1", or if calendar data wasn't found at all
			if (dayOrderFromTodayObject !== "1" || !determinedDayOrder) {
				determinedDayOrder = dayOrderFromTodayObject;
			}
		}
	}

	// 3. Default to "1" if still not determined or remains "1" from parsing
	if (!determinedDayOrder) {
		determinedDayOrder = "1";
	}

	const isHoliday = determinedDayOrder === "Holiday";
	// displayDay will be the number string (e.g., "2") or "1" if not a holiday.
	const displayDay = isHoliday ? "Holiday" : determinedDayOrder;

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
					title={`Day: ${displayDay}`}
					className={`${mini ? "flex h-6 w-2 items-center justify-center text-sm" : "text-base"} font-medium text-light-accent dark:text-dark-accent`}
				>
					{mini ? "" : "Day: "}
					{displayDay}
				</span>
			)}
		</div>
	);
}
