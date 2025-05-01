import React, { type ComponentProps, memo } from "react";
import { Link as Alink } from "next-view-transitions";
import type NextLink from "next/link";
import { usePathname } from "next/navigation";

function SidebarLink({
	children,
	...props
}: ComponentProps<typeof NextLink>) {
	const pathname = usePathname();
	const isActive = props.href === pathname;
	
	return (
		<Alink
			tabIndex={0}
			{...props}
			className={`font-semibold ${
				isActive 
					? "bg-light-side text-light-accent dark:bg-dark-side dark:text-dark-accent" 
					: props.className 
						? props.className 
						: "hover:bg-light-side hover:text-light-accent hover:opacity-70 dark:hover:bg-dark-side dark:hover:text-dark-accent"
			} text-color flex flex-row-reverse items-center justify-between rounded-xl px-4 py-2 text-lg transition duration-150 hover:scale-[0.98]`}
		>
			{children}
		</Alink>
	);
}

// Memoize the SidebarLink to prevent unnecessary re-renders
export default memo(SidebarLink);
