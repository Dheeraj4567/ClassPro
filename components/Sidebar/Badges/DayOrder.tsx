import { fetchCalendar } from "@/hooks/fetchCalendar";
import React from "react";

// Helper function to parse various day order string formats
const parseDayOrderStatus = (dayOrderStr: string | undefined): string => {
	// Default for undefined, null, or empty/whitespace string
	if (!dayOrderStr || dayOrderStr.trim() === "") {
		return "1";
	}

	const trimmedDayOrderStr = dayOrderStr.trim();
	const lowerTrimmedDayOrderStr = trimmedDayOrderStr.toLowerCase();

	// Explicit holiday markers
	if (lowerTrimmedDayOrderStr === "holiday" || trimmedDayOrderStr === "-") {
		return "Holiday";
	}

	// If the string contains "---" or "null", treat as holiday or non-operational day
	if (trimmedDayOrderStr.includes("---") || 
	    trimmedDayOrderStr.includes("null") ||
	    trimmedDayOrderStr.includes("undefined")) {
		return "Holiday";
	}

	// Extracts trailing digits, e.g., "2" from "Day-2", "DO-2", or "Order 2"
	const match = trimmedDayOrderStr.match(/(\d+)$/);
	if (match && match[1]) {
		const numStr = match[1];
		// Ensure it's a simple number string after extraction
		if (!isNaN(Number(numStr))) {
			return numStr;
		}
	}

	// If the string itself is a number (e.g., "1", "2")
	// Ensure it's not an empty string, which Number("") treats as 0.
	// The initial check `dayOrderStr.trim() === ""` handles empty strings.
	if (!isNaN(Number(trimmedDayOrderStr))) {
		return trimmedDayOrderStr;
	}

	// Fallback for other unparseable formats
	console.log('Unparseable day order:', dayOrderStr);
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

	// 2. If not found or inconclusive (e.g., resulted in "1" or "Holiday" but today.dayOrder might be more specific numeric)
	//    from specific calendar data, try `today.dayOrder`.
	//    Prioritize a numeric day order from `today.dayOrder` if `determinedDayOrder` is not already a specific number.
	if (!determinedDayOrder || determinedDayOrder === "1" || determinedDayOrder === "Holiday") {
		if (today?.dayOrder) {
			const dayOrderFromTodayObject = parseDayOrderStatus(today.dayOrder);
			// If today.dayOrder gives a specific number, it might be more accurate or an override
			if (dayOrderFromTodayObject !== "Holiday" && dayOrderFromTodayObject !== "1") {
				determinedDayOrder = dayOrderFromTodayObject;
			} else if (!determinedDayOrder || determinedDayOrder === "1") {
				// If determinedDayOrder was not set, or was "1", accept today.dayOrder's value (which could be "1" or "Holiday")
				determinedDayOrder = dayOrderFromTodayObject;
			}
			// If determinedDayOrder was "Holiday", and today.dayOrder is also "Holiday" or "1", determinedDayOrder remains "Holiday".
		}
	}

	// 3. Default to "1" if still not determined (should be rare after the above)
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
