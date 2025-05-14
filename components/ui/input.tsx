import * as React from "react";
import { cn } from "@/lib/utils";
import { lightHaptics } from "@/utils/haptics";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type, onFocus, onBlur, ...props }, ref) => {
		// Enhanced focus handler with haptic feedback
		const handleFocus = React.useCallback(
			(event: React.FocusEvent<HTMLInputElement>) => {
				// Provide light haptic feedback on input focus
				lightHaptics();
				
				// Call the original onFocus handler if it exists
				onFocus?.(event);
			},
			[onFocus]
		);
		
		// Enhanced blur handler with haptic feedback
		const handleBlur = React.useCallback(
			(event: React.FocusEvent<HTMLInputElement>) => {
				// Provide light haptic feedback on input blur
				lightHaptics();
				
				// Call the original onBlur handler if it exists
				onBlur?.(event);
			},
			[onBlur]
		);
		
		return (
			<input
				type={type}
				className={cn(
					"flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-800 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300",
					className,
				)}
				ref={ref}
				onFocus={handleFocus}
				onBlur={handleBlur}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
