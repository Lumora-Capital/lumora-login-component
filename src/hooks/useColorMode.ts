import { useEffect, useState } from 'react';
import { ColorMode } from '../types';
import {
	ColorModeStorage,
	SYSTEM_DARK_QUERY,
	getSystemColorMode
} from '../lib/colorMode';

/**
 * Colour mode of the login page.
 * The user's saved choice wins, then the host's default, then the operating system,
 * which first-time visitors follow live until they use the toggle.
 * @param defaultColorMode - Mode the host wants when the user has not chosen one
 * @param onColorModeChange - Called when the user flips the toggle
 * @returns The current mode and a function that flips it
 */
export const useColorMode = (
	defaultColorMode?: ColorMode,
	onColorModeChange?: (mode: ColorMode) => void
) => {
	// Whether the user has picked a mode with the toggle (now or on an earlier visit)
	const [hasChosen, setHasChosen] = useState(
		() => ColorModeStorage.get() !== null
	);
	const [colorMode, setColorMode] = useState<ColorMode>(
		() => ColorModeStorage.get() ?? defaultColorMode ?? getSystemColorMode()
	);

	// Follow system changes (e.g. macOS auto dark mode at sunset) until the user chooses
	const followsSystem = !hasChosen && !defaultColorMode;
	useEffect(() => {
		if (
			!followsSystem ||
			typeof window === 'undefined' ||
			!window.matchMedia
		) {
			return;
		}

		const query = window.matchMedia(SYSTEM_DARK_QUERY);
		const handleChange = (event: MediaQueryListEvent) =>
			setColorMode(event.matches ? 'dark' : 'light');

		query.addEventListener('change', handleChange);
		return () => query.removeEventListener('change', handleChange);
	}, [followsSystem]);

	// Flip the mode and remember it as the user's choice
	const toggleColorMode = () => {
		const nextMode: ColorMode = colorMode === 'dark' ? 'light' : 'dark';
		// No view transition here: its page snapshots made the dashboard images blink on
		// GPU-rendered Chrome. LoginContainer switches the colours in one frame (MODE_SWITCH_TRANSITION).
		setColorMode(nextMode);
		setHasChosen(true);

		ColorModeStorage.set(nextMode);
		onColorModeChange?.(nextMode);
	};

	return { colorMode, toggleColorMode };
};
