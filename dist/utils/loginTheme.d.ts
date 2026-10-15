import { BrandingConfig, ColorMode, PlatformId } from '../types';
export interface LoginTheme {
    mode: ColorMode;
    pageBg: string;
    surface: string;
    border: string;
    heading: string;
    welcomeTitle: string;
    welcomeAccent: string;
    text: string;
    tagline: string;
    label: string;
    placeholder: string;
    divider: string;
    brandText: string;
    eyebrow: string;
    logo: string;
    errorBg: string;
    errorBorder: string;
    errorText: string;
    errorIcon: string;
    heroText: string;
    heroHeadline: string;
    heroHeadlineAccent: string;
    muted: string;
    heroBg: string;
    heroGrid: string;
    accent: string;
    accentHover: string;
    buttonText: string;
    headingFont: string;
    bodyFont: string;
}
export declare const SHORT_SCREEN = "@media (max-height: 920px)";
export declare const CONTROL_HEIGHT: {
    readonly height: 50;
    readonly "@media (max-height: 920px)": {
        readonly height: 46;
    };
};
export declare const CARD_SHADOW = "0 1px 2px rgba(18, 51, 45, 0.06), 0 8px 24px rgba(18, 51, 45, 0.06)";
/**
 * Resolve the page colours for a colour mode and the selected platform
 * @param brandConfig - Merged branding configuration
 * @param mode - Light or dark
 * @param platform - The selected platform, which takes over the accent colour
 * @returns The resolved theme
 */
export declare const getLoginTheme: (brandConfig: BrandingConfig, mode: ColorMode, platform: PlatformId | null) => LoginTheme;
/**
 * Keyboard focus ring for buttons, in the accent colour
 * @param theme - Resolved login theme
 * @returns sx rule for MUI's focus-visible state
 */
export declare const focusRing: (theme: LoginTheme) => {
    '&.Mui-focusVisible': {
        outline: string;
        outlineOffset: number;
    };
};
/**
 * Background image for the faint square grid drawn behind the hero
 * @param lineColor - Colour of the grid lines
 * @returns CSS background-image value
 */
export declare const gridBackground: (lineColor: string) => string;
//# sourceMappingURL=loginTheme.d.ts.map