import type { Day } from "@/types/Calendar";
import { ImageResponse } from "next/og";
import { fetchCalendar } from "@/hooks/fetchCalendar";
import { NextRequest } from "next/server";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const monthIndex = parseInt(searchParams.get("month") || "0");

		const { calendar } = await fetchCalendar();
		const month = calendar[monthIndex]?.month || calendar[0]?.month;
		const days = calendar[monthIndex]?.days || calendar[0]?.days;

		const geist = await fetch(
			new URL("../../../public/fonts/Geist.ttf", import.meta.url),
		).then((res) => res.arrayBuffer());

		const getFirstDayIndex = () => weekdays.indexOf(days[0]?.day);

		return new ImageResponse(
			(
				<div tw="bg-[#0a0d12] flex flex-col items-center justify-center h-screen w-screen">

					<div
						tw="my-8 flex items-baseline min-w-[220px] justify-start ml-48 w-full"
					>
						<h1 tw="font-semibold text-[#FFF] mt-3 text-6xl">
							{months[monthIndex]}
						</h1>
						<p tw="text-3xl text-[#FFF] -mt-2 font-medium md:font-semibold ml-2 opacity-60">
							20{month.split("'")[1]}
						</p>
					</div>

					<div tw="max-w-[2000px] flex text-center font-bold bg-[#06090d]">
						{weekdays.map((weekday) => (
							<div
								key={weekday}
								tw="w-[285px] h-[56px] text-lg p-2 font-medium text-center text-white flex items-center justify-center"
							>
								{weekday}
							</div>
						))}
					</div>
					<div tw="bg-[#0a0d12] text-center flex flex-row flex-wrap max-w-[2000px] w-screen">
						{Array.from({ length: getFirstDayIndex() }, (_, index) => (
							<div tw="flex w-[285px] h-[370px] border-[#1E232B] border opacity-20" key={`empty-${index}`} />
						))}
						{days
							.filter((a: any) => a.dayOrder.length <= 1)
							.map((day, index: number) => (
								<DayCell key={index} day={day} />
							))}
					</div>
				</div>
			),
			{
				width: 2100,
				height: 2500,
				fonts: [
					{
						name: "Geist",
						data: geist,
						style: "normal",
					},
				],
				headers: {
					"Cache-Control": "public, max-age=7200, stale-while-revalidate=86400",
					"CDN-Cache-Control": "max-age=7200",
					"Vercel-CDN-Cache-Control": "max-age=7200",
				},
			},
		);
	} catch (err: any) {
		console.warn(err);
		return new Response(
			JSON.stringify({
				error: err.stack,
			}),
			{
				status: 500,
				statusText: "Server Error",
				headers: {
					"Cache-Control": "no-cache",
				},
			},
		);
	}
}

function DayCell({ day }: { day: Day }) {
	const isErrorDay = day?.dayOrder === "-";

	return (
		<div
			aria-label={day.date}
			title={`${day.date} - Day Order: ${day.dayOrder}`}
			tw={
				`${isErrorDay ? "bg-[#1D0C0C]" : ""} flex max-w-[285px] h-[370px] w-full flex-col justify-between border m-0 border-[#1E232B] p-4 items-end`
			}
		>
			<DateDisplay
				date={day.date}
				day={day?.day}
				isToday={false}
				isErrorDay={isErrorDay}
			/>
			<EventDisplay holiday={day.event || ""} isErrorDay={isErrorDay} />
			<DayOrderDisplay dayOrder={day.dayOrder} isToday={false} />
		</div>
	);
}

interface DateDisplayProps {
	date: string;
	day: string;
	isToday: boolean;
	isErrorDay: boolean;
}

const DateDisplay: React.FC<DateDisplayProps> = ({
	date,
	isErrorDay,
}) => (
	<div tw="flex flex-col">
		<h3
			tw={`text-4xl font-bold ${
				isErrorDay ? "text-[#FF6B6B]" : "text-white"
			}`}
		>
			{date}
		</h3>
	</div>
);

interface EventDisplayProps {
	holiday: string | null;
	isErrorDay: boolean;
}

const EventDisplay: React.FC<EventDisplayProps> = ({
	holiday,
	isErrorDay,
}) => {
	if (!holiday) return null;
	return (
		<p
			tw={`text-sm ${
				isErrorDay ? "text-[#FF6B6B]" : "text-[#7DD3FC]"
			} px-2 py-1 rounded border-l-2 ${
				isErrorDay ? "border-[#FF6B6B]" : "border-[#7DD3FC]"
			} bg-opacity-20 max-w-[250px]`}
		>
			{holiday.replaceAll(",", ", ")}
		</p>
	);
};

interface DayOrderDisplayProps {
	dayOrder: string;
	isToday: boolean;
}

const DayOrderDisplay: React.FC<DayOrderDisplayProps> = ({
	dayOrder,
}) => {
	if (dayOrder === "-") return null;
	return (
		<h2 tw="text-right text-2xl font-bold text-white">
			Day Order {dayOrder}
		</h2>
	);
};

export const runtime = "edge";