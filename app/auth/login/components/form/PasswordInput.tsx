"use client";

import React, {
	useState,
	type Dispatch,
	type SetStateAction,
	type KeyboardEvent,
	useCallback
} from "react";
import { BsEyeSlashFill, BsEyeFill } from "react-icons/bs";
import { lightHaptics } from "@/utils/haptics";

export default function PasswordInput({
	password,
	setPassword,
}: {
	password: string;
	setPassword: Dispatch<SetStateAction<string>>;
}) {
	const [visible, setVisible] = useState(false);

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") return setVisible(false);
		if (e.altKey) {
			setVisible((prev) => !prev);
		}
	};

	// Handle toggle visibility with haptic feedback
	const handleToggleVisibility = useCallback(() => {
		// Provide haptic feedback when toggling password visibility
		lightHaptics();
		setVisible((e) => !e);
	}, []);

	return (
		<>
			<input
				type={visible ? "text" : "password"}
				value={password}
				onKeyDown={handleKeyDown}
				className={"rounded-2xl rounded-tl-[6px] rounded-tr-[6px] dark:bg-dark-input bg-light-input px-6 py-3 font-sans font-medium text-light-color dark:text-dark-color"}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Passw*rd"
			/>
			{password && (
				<button
					type="button"
					tabIndex={-1}
					onKeyDown={handleKeyDown}
					className="absolute bottom-[16px] right-0 pr-4 text-right text-light-accent dark:text-dark-accent"
					onClick={handleToggleVisibility}
				>
					{visible ? <BsEyeSlashFill /> : <BsEyeFill />}
				</button>
			)}
		</>
	);
}
