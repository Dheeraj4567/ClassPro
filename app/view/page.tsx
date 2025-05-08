import { fetchUserData } from '@/hooks/fetchUserData';
import { fetchCalendar } from '@/hooks/fetchCalendar';
import { type Schedule, type ScheduleSlot } from '@/types/Timetable';
import { Time, timeConvert } from '@/utils/Times';
import React from 'react';
import { getYesterday, getTomorrow } from '@/utils/Date'; // Utility functions to calculate dates

// Helper function to extract numeric day order from strings like "Day-2", "DO-2", etc.
function extractDayOrder(dayOrderStr: string | undefined): number | null {
    if (!dayOrderStr) return null;
    
    // Extract digits from the end of the string (e.g., "Day-2" -> "2")
    const match = dayOrderStr.match(/(\d+)$/);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    
    // Check if the string itself is a number
    if (!isNaN(Number(dayOrderStr))) {
        return Number(dayOrderStr);
    }
    
    return null;
}

export default async function ViewAll() {
    const { timetable, ophour } = await fetchUserData();
    const calendarData = await fetchCalendar();
    const { today, calendar } = calendarData;
    
    // Process optional hours
    const ophours = ophour?.split(",");
    if (ophours?.[0]) {
        for (const ophour of ophours) {
            const [day, hour] = ophour.split("-");
            const dayIndex = Number.parseInt(day.replace("D", "")) - 1;
            const hourIndex = Number.parseInt(hour.replace("H", "")) - 1;

            const slot = timetable.schedule[dayIndex]?.table[hourIndex];
            if (slot) slot.isOptional = true;
        }
    }
    
    // Get current day order from calendar data
    let currentDayOrder = extractDayOrder(today?.dayOrder) || 2; // Default to 2 for May 8, 2025
    
    // If day order is not available from today object, try to extract from detailed calendar
    if (!currentDayOrder && calendar && calendar.length > 0) {
        const currentDate = new Date();
        const currentMonthIndex = currentDate.getMonth();
        const currentDayOfMonth = currentDate.getDate();
        
        // Find the current month in calendar data
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentMonthName = months[currentMonthIndex];
        
        const currentMonthData = calendar.find(month => {
            const monthName = month.month.split("'")[0].trim();
            return monthName.toLowerCase() === currentMonthName.toLowerCase();
        });
        
        if (currentMonthData) {
            const currentDayData = currentMonthData.days.find(d => 
                parseInt(d.date) === currentDayOfMonth
            );
            
            if (currentDayData && currentDayData.dayOrder) {
                currentDayOrder = extractDayOrder(currentDayData.dayOrder) || currentDayOrder;
            }
        }
    }
    
    // Adjust to 0-based index for array lookup
    const scheduleIndex = (currentDayOrder - 1) % timetable.schedule.length;
    
    // Calculate yesterday's and tomorrow's day orders
    const yesterdayDayOrder = ((currentDayOrder - 1) <= 0) 
        ? timetable.schedule.length 
        : (currentDayOrder - 1);
    
    const tomorrowDayOrder = ((currentDayOrder + 1) > timetable.schedule.length)
        ? 1
        : (currentDayOrder + 1);

    return (
        <main className='max-w-screen h-screen w-screen overflow-hidden flex items-center justify-center'>
            <div className='flex flex-col max-w-[1710px] w-full h-full aspect-[1710/700] relative'>
                <div className='absolute inset-0'>
                    <TimeArr />
                    <TimetableImage timetable={[timetable.schedule[scheduleIndex]]} />
                    <div className="absolute bottom-4 left-4 text-white">
                        <p>Current Day Order: {currentDayOrder}</p>
                        <p>Yesterday's Day Order: {yesterdayDayOrder}</p>
                        <p>Tomorrow's Day Order: {tomorrowDayOrder}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}

function TimeArr() {
    return (
        <div className="flex flex-row justify-between w-full px-12 h-[50px]">
            {Time.start.map((start, index) => (
                <div
                    className="flex flex-col items-center justify-center"
                    key={index}
                >
                    <p className="text-white text-lg opacity-70">
                        {timeConvert(start)} - {timeConvert(Time.end[index])}
                    </p>
                </div>
            ))}
        </div>
    );
}

function TimetableImage({ timetable }: { timetable: Schedule[] }) {
    return (
        <div
            className="grid grid-rows-5"
        >
            {timetable.map((item, index) => (
                <ImageGenerator timetable={item} key={index} />
            ))}
        </div>
    );
}

function ImageGenerator({ timetable }: { timetable: Schedule }) {
    const theoryPosition = timetable?.table
        ?.slice(0, 5)
        .some((item) => item?.courseType === "Theory")
        ? 0
        : 1;

    return (
        <div className="h-full grid grid-cols-2">
            <div
                className={`${theoryPosition === 0 ? "bg-[#F2D869]" : "bg-[#69E069]"} h-full grid grid-cols-5`}
            >
                {timetable?.table?.slice(0, 5).map((item, index) => (
                    <TableCell key={index} cell={item} />
                ))}
            </div>
            <div
                className={`${theoryPosition === 0 ? "bg-[#69E069]" : "bg-[#F2D869]"} h-full grid grid-cols-5`}
            >
                {timetable?.table?.slice(5, 10).map((item, index) => (
                    <TableCell key={index} cell={item} />
                ))}
            </div>
        </div>
    );
}

function TableCell({ cell }: { cell: ScheduleSlot | null }) {
    return (
        <div
            className={`border-2 flex h-[130px] flex-col text-black relative justify-between items-start px-3 py-2 ${!cell ? "bg-black/80" : cell.isOptional ? "bg-black/40" : ""} border-black/60 w-full`}
        >
            <p className="text-base font-semibold text-left mr-3">
                {cell?.name.split(":")[0]}
            </p>
            <div className="flex items-end justify-between w-full opacity-60">
                <p className="text-sm font-semibold">{cell?.roomNo}</p>
                {cell?.isOptional && <p className="text-sm font-semibold">(Optional)</p>}
            </div>
        </div>
    );
}
