import { ColorMode, PlatformId } from '../types';
export interface DarkPalette {
    pageBg: string;
    surface: string;
    border: string;
    heading: string;
    text: string;
    muted: string;
    heroBg: string;
}
export interface PlatformConfig {
    id: PlatformId;
    name: string;
    area: string;
    headline: string;
    headlineAccent: string;
    description: string;
    color: string;
    uiColor: string;
    colorOnDark: string;
    frameColor: string;
    accent: string;
    dark: DarkPalette;
    loadScreenshot: (mode: ColorMode) => Promise<string>;
}
export declare const LUMORA_DARK_PALETTE: DarkPalette;
/**
 * The three Lumora platforms, in the order the selector shows them.
 * The host can replace a built-in dashboard through the `platformAssets` prop.
 */
export declare const PLATFORMS: PlatformConfig[];
export declare const DEFAULT_PLATFORM: PlatformId;
/**
 * Look up a platform's configuration by id
 * @param id - The platform id
 * @returns The platform configuration
 */
export declare const getPlatform: (id: PlatformId) => PlatformConfig;
export declare const PLATFORM_STORAGE_KEY = "lumora_platform";
/**
 * Remembers the chosen platform across the OAuth / magic link redirect,
 * so the callback page knows where to send the user
 */
export declare const PlatformStorage: {
    /**
     * Get the stored platform
     * @returns The platform id or null when none was chosen
     */
    get: () => PlatformId | null;
    /**
     * Store the chosen platform, or clear it when null
     * @param platform - The platform id or null
     */
    set: (platform: PlatformId | null) => void;
};
//# sourceMappingURL=platforms.d.ts.map