import { ColorMode } from '../types';
/**
 * Colour mode of the login page.
 * The user's saved choice wins, then the host's default, then the operating system,
 * which first-time visitors follow live until they use the toggle.
 * @param defaultColorMode - Mode the host wants when the user has not chosen one
 * @param onColorModeChange - Called when the user flips the toggle
 * @returns The current mode and a function that flips it
 */
export declare const useColorMode: (defaultColorMode?: ColorMode, onColorModeChange?: (mode: ColorMode) => void) => {
    colorMode: ColorMode;
    toggleColorMode: () => void;
};
//# sourceMappingURL=useColorMode.d.ts.map