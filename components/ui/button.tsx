import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { lightHaptics } from "@/utils/haptics";

const buttonBaseClasses =
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-neutral-300";

export const buttonVariantClasses = {
	default:
		"bg-neutral-900 text-neutral-50 shadow-sm hover:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90",
	destructive:
		"bg-red-500 text-neutral-50 shadow-xs hover:bg-red-500/90 dark:bg-red-900 dark:text-neutral-50 dark:hover:bg-red-900/90",
	outline:
		"border border-neutral-200 bg-white shadow-xs hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
	secondary:
		"bg-neutral-100 text-neutral-900 shadow-xs hover:bg-neutral-100/80 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800/80",
	ghost: "hover:bg-neutral-100 dark:hover:bg-neutral-800",
	link: "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50",
};

const buttonSizeClasses = {
	default: "h-9 px-4 py-2",
	sm: "h-8 rounded-md px-3 text-xs",
	lg: "h-10 rounded-md px-8",
	icon: "h-9 w-9",
};

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: keyof typeof buttonVariantClasses;
	size?: keyof typeof buttonSizeClasses;
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant = "default",
			size = "default",
			asChild = false,
			onClick,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";
		
		// Enhanced onClick handler with haptic feedback
		const handleClick = React.useCallback(
			(event: React.MouseEvent<HTMLButtonElement>) => {
				// Provide haptic feedback on button press
				lightHaptics();
				
				// Call the original onClick handler if it exists
				onClick?.(event);
			},
			[onClick]
		);
		
		return (
			<Comp
				className={cn(
					buttonBaseClasses,
					buttonVariantClasses[variant],
					buttonSizeClasses[size],
					className,
				)}
				onClick={handleClick}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button };
