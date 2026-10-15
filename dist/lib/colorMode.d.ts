import { ColorMode } from '../types';
export declare const COLOR_MODE_STORAGE_KEY = "lumora_color_mode";
export declare const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";
/**
 * Read the operating system's colour mode
 * @returns 'dark' when the system prefers dark, otherwise 'light'
 */
export declare const getSystemColorMode: () => ColorMode;
/**
 * Remembers the colour mode the user chose with the toggle, so it survives reloads.
 * Nothing is stored until the user toggles: first-time visitors follow the system.
 */
export declare const ColorModeStorage: {
    /**
     * Get the stored colour mode
     * @returns The user's choice, or null when they never toggled
     */
    get: () => ColorMode | null;
    /**
     * Store the user's colour mode
     * @param mode - Light or dark
     */
    set: (mode: ColorMode) => void;
    /**
     * Forget the user's choice, so the page follows the system again
     */
    clear: () => void;
};
//# sourceMappingURL=colorMode.d.ts.map