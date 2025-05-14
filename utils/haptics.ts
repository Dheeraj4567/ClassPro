// Haptic feedback utilities for enhancing mobile experience

/**
 * Provides a light haptic feedback (20ms) for UI elements like buttons, tabs, etc.
 * Intended for frequent interactions.
 */
export const lightHaptics = () => {
  if (typeof window !== 'undefined' && navigator.vibrate && typeof navigator.vibrate === 'function') {
    navigator.vibrate(20);
  }
};

/**
 * Provides a medium haptic feedback (40ms) for significant interactions like
 * toggling important settings, confirming actions, etc.
 */
export const mediumHaptics = () => {
  if (typeof window !== 'undefined' && navigator.vibrate && typeof navigator.vibrate === 'function') {
    navigator.vibrate(40);
  }
};

/**
 * Provides a strong haptic feedback (70ms) for important actions like
 * form submissions, critical changes, etc.
 */
export const strongHaptics = () => {
  if (typeof window !== 'undefined' && navigator.vibrate && typeof navigator.vibrate === 'function') {
    navigator.vibrate(70);
  }
};

/**
 * Provides a pattern-based haptic feedback for success notifications
 * Pattern is a short double-pulse (success pattern)
 */
export const successHaptics = () => {
  if (typeof window !== 'undefined' && navigator.vibrate && typeof navigator.vibrate === 'function') {
    navigator.vibrate([30, 50, 30]);
  }
};

/**
 * Provides a pattern-based haptic feedback for error notifications
 * Pattern is a longer double-pulse (warning pattern)
 */
export const errorHaptics = () => {
  if (typeof window !== 'undefined' && navigator.vibrate && typeof navigator.vibrate === 'function') {
    navigator.vibrate([60, 50, 60]);
  }
};

/**
 * Returns a debounced haptic feedback function
 * @param hapticFn - The haptic feedback function to debounce
 * @param delay - Debounce delay in milliseconds
 */
export const debounceHaptics = (hapticFn: () => void, delay = 300) => {
  let timeout: NodeJS.Timeout;
  
  return () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      hapticFn();
    }, delay);
  };
};
