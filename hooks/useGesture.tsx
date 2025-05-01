import { useEffect, useRef, useCallback } from "react";

interface UseGesturesProps {
	onSwipeLeft: () => void;
	onSwipeRight: () => void;
}

export function useGestures({ onSwipeLeft, onSwipeRight }: UseGesturesProps) {
	// Use refs to store touch positions to prevent re-renders
	const touchStartXRef = useRef(0);
	const touchEndXRef = useRef(0);
	// Track whether gesture is in progress to prevent multiple triggers
	const isGestureInProgressRef = useRef(false);
	
	// Memoize functions to prevent recreating them on every render
	const handleGesture = useCallback(() => {
		if (isGestureInProgressRef.current) {
			return;
		}
		
		isGestureInProgressRef.current = true;
		
		const screenWidth = window.innerWidth;
		// Make threshold smaller for better responsiveness (1/4 instead of 1/3)
		const swipeThreshold = screenWidth / 4;
		
		if (touchEndXRef.current < touchStartXRef.current - swipeThreshold) {
			requestAnimationFrame(onSwipeLeft);
		} else if (touchEndXRef.current > touchStartXRef.current + swipeThreshold) {
			requestAnimationFrame(onSwipeRight);
		}
		
		// Reset after a short delay to prevent multiple triggers
		setTimeout(() => {
			isGestureInProgressRef.current = false;
		}, 300);
	}, [onSwipeLeft, onSwipeRight]);

	const startTouch = useCallback((event: TouchEvent) => {
		touchStartXRef.current = event.changedTouches[0].screenX;
	}, []);

	const stopTouch = useCallback((event: TouchEvent) => {
		touchEndXRef.current = event.changedTouches[0].screenX;
		handleGesture();
	}, [handleGesture]);

	useEffect(() => {
		// Use passive event listeners for better performance
		window.addEventListener("touchstart", startTouch, { passive: true });
		window.addEventListener("touchend", stopTouch, { passive: true });

		return () => {
			window.removeEventListener("touchstart", startTouch);
			window.removeEventListener("touchend", stopTouch);
		};
	}, [startTouch, stopTouch]);
}
