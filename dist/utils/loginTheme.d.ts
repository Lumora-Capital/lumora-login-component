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
export declare const CONTROL_HEIGHT = "ll:h-[50px] ll:short:h-[46px]";
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
 * The theme as CSS variables (--lumora-page-bg, --lumora-accent…), which the stylesheet's colour and
 * font utilities read. Set on the component's root.
 * @param theme - Resolved login theme
 * @returns Variable name → value
 */
export declare const themeVariables: (theme: LoginTheme) => Record<string, string>;
//# sourceMappingURL=loginTheme.d.ts.map