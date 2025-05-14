import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { mediumHaptics } from "@/utils/haptics";

export default function OpenButton({
	mobile,
	isOpen,
	onClick,
	anchor,
}: {
	mobile?: boolean;
	isOpen: boolean;
	onClick: () => void;
	anchor?: boolean;
}) {
	// Enhanced click handler with haptic feedback
	const handleClick = () => {
		// Provide haptic feedback when toggling sidebar
		mediumHaptics();
		
		// Call the original onClick handler
		onClick();
	};
	
	return mobile ? (
		<button
			type="button"
			name="Open navbar"
			className={`fixed z-10 bottom-5 rounded-full p-3 lg:hidden ${isOpen ? "right-5 bg-light-error-background dark:bg-dark-error-background" : "right-5 bg-transparent"}`}
			onClick={handleClick}
		>
			{isOpen ? (
				<FaAnglesLeft className="text-xl text-light-error-color dark:text-dark-error-color" />
			) : (
				<FaAnglesRight className="text-xl text-light-color dark:text-dark-color" />
			)}
		</button>
	) : (
		<button
			type="button"
			name="Open navbar"
			className={`fixed bottom-20 hidden rounded-full p-3 lg:block ${anchor ? "right-5 bg-light-error-background dark:bg-dark-error-background" : "right-7 bg-transparent"}`}
			onClick={handleClick}
		>
			<FaAnglesLeft
				className={`transition-all duration-150 text-xl ${anchor ? "text-light-error-color dark:text-dark-error-color" : "rotate-180 text-light-color dark:text-dark-color"}`}
			/>
		</button>
	);
}
