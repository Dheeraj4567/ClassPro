import React, { ComponentProps, useCallback } from "react";
import { strongHaptics } from "@/utils/haptics";

export default function Button({
	children,
	onClick,
	...props
}: ComponentProps<"button">) {
	// Enhanced click handler with haptic feedback
	const handleClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			// Don't provide haptic feedback if button is disabled
			if (!props.disabled) {
				// Use strong haptic feedback for important form actions
				strongHaptics();
			}
			
			// Call the original onClick handler if it exists
			onClick?.(event);
		},
		[onClick, props.disabled]
	);
	
	return (
		<button
			{...props}
			onClick={handleClick}
			className={`${props.className?.includes("w-") ? "" : "w-fit"} px-4 py-2 rounded-xl font-medium transition-all duration-150 transform text-light-background-dark dark:bg-dark-accent bg-light-accent ${
				props.className
			} dark:text-dark-background-dark ${
				props.disabled
					? "opacity-70 cursor-not-allowed"
					: "hover:scale-95 active:scale-90 hover:shadow-lg hover:opacity-80"
			}`}
		>
			{children}
		</button>
	);
}
