import { ColorMode } from '../types';

// Storage key for the colour mode the user picked with the toggle
const COLOR_MODE_STORAGE_KEY = 'lumora_color_mode';

// Media query that matches when the operating system is set to dark mode
export const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Read the operating system's colour mode
 * @returns 'dark' when the system prefers dark, otherwise 'light'
 */
export const getSystemColorMode = (): ColorMode => {
	if (typeof window === 'undefined' || !window.matchMedia) {
		return 'light';
	}
	return window.matchMedia(SYSTEM_DARK_QUERY).matches ? 'dark' : 'light';
};

/**
 * Remembers the colour mode the user chose with the toggle, so it survives reloads.
 * Nothing is stored until the user toggles: first-time visitors follow the system.
 */
export const ColorModeStorage = {
	/**
	 * Get the stored colour mode
	 * @returns The user's choice, or null when they never toggled
	 */
	get: (): ColorMode | null => {
		try {
			const value = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
			return value === 'light' || value === 'dark' ? value : null;
		} catch {
			return null;
		}
	},

	/**
	 * Store the user's colour mode
	 * @param mode - Light or dark
	 */
	set: (mode: ColorMode): void => {
		try {
			localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
		} catch {
			// Storage can be blocked (private mode); the choice then lasts only for this page
		}
	},

	/**
	 * Forget the user's choice, so the page follows the system again
	 */
	clear: (): void => {
		try {
			localStorage.removeItem(COLOR_MODE_STORAGE_KEY);
		} catch {
			// Nothing stored when storage is blocked
		}
	}
};
