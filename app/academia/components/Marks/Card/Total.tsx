import React from "react";
import type { Overall } from "@/types/Marks";

import { MarkDisplay } from "./MarkElement";
import { FaCalculator } from "react-icons/fa";

interface TotalProps {
	overall?: Overall;
	graph?: boolean;
	calculate?: boolean;
	setCalculate?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TotalSection({ overall, graph, calculate, setCalculate }: TotalProps) {
	if (!overall) {
		const percent = "0.00";
		return (
			<div className="ml-2 mt-3 flex flex-col gap-2 relative">
				<div
					title="Total"
					aria-label="Total"
					role="alert"
					className={"flex items-center justify-between gap-2 border-t-2 border-dashed border-dark-background-light pt-4"}
				>
					<div className="flex flex-row items-center gap-4">
						<h2>Total</h2>

						{graph && (
							<div
								className={`${Number(percent.split(".")[0]) <= 75 ? "bg-light-warn-background text-light-warn-color dark:bg-dark-warn-background dark:text-dark-warn-color" : Number(percent) < 50 ? "bg-light-error-background text-light-error-color dark:bg-dark-error-background dark:text-dark-error-color" : "bg-light-success-background text-light-success-color dark:bg-dark-success-background dark:text-dark-success-color"} rounded-md px-2 py-0.5`}
							>
								<p className="text-xs font-semibold">{percent}%</p>
							</div>
						)}
					</div>
					<MarkDisplay
						marks={{
							marks: "0.00",
							total: "0",
						}}
					/>
				</div>
			</div>
		);
	}

	const percent = (
		(Number.parseFloat(overall.marks ?? "0") / Number.parseFloat(overall.total ?? "1")) *
		100
	).toFixed(1);

	return (
		<div className="ml-2 mt-3 flex flex-col gap-2 relative">
			<div
				title="Total"
				aria-label="Total"
				role="alert"
				className={"flex items-center justify-between gap-2 border-t-2 border-dashed border-dark-background-light pt-4"}
			>
				<div className="flex flex-row items-center gap-4">
					<h2>Total</h2>

					{graph && (
						<div
							className={`${Number(percent.split(".")[0]) <= 75 ? "bg-light-warn-background text-light-warn-color dark:bg-dark-warn-background dark:text-dark-warn-color" : Number(percent) < 50 ? "bg-light-error-background text-light-error-color dark:bg-dark-error-background dark:text-dark-error-color" : "bg-light-success-background text-light-success-color dark:bg-dark-success-background dark:text-dark-success-color"} rounded-md px-2 py-0.5`}
						>
							<p className="text-xs font-semibold">{percent}%</p>
						</div>
					)}
				</div>
				<div className="flex items-center gap-2">
					{setCalculate && (
						<button
							onClick={() => setCalculate(!calculate)}
							className={`flex items-center justify-center p-2 rounded-full shadow-md ${
								calculate
									? "bg-light-error-color text-light-background-light dark:bg-dark-error-color dark:text-dark-background-light"
									: "bg-light-background-light text-light-accent dark:bg-dark-background-light dark:text-dark-accent"
							}`}
						>
							<span className="flex items-center justify-center">
									{calculate ? "×" : <FaCalculator size={12} />}
							</span>
						</button>
					)}
					<MarkDisplay marks={overall} />
				</div>
			</div>
		</div>
	);
}
