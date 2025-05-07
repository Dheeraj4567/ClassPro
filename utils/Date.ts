export function isDateInRange(date: Date, range: DateRange) {
	return date >= range.from && date <= range.to;
}

export function isDateInRanges(date: Date, ranges: DateRange[]) {
	return ranges.some((range) => isDateInRange(date, range));
}

export type DateRange = {
	from: Date;
	to: Date;
};

export function getYesterday(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
}

export function getTomorrow(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
}
