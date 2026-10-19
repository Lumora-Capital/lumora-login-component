export interface BrandingConfig {
    logo?: string | React.ReactNode;
    logoHeight?: number;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonTextColor?: string;
    headingFontFamily?: string;
    bodyFontFamily?: string;
    companyName?: string;
    welcomeTitle?: string;
    welcomeTitleAccent?: string;
    welcomeTitleColor?: string;
    welcomeTitleAccentColor?: string;
    tagline?: string;
    firstTimeTitle?: string;
    firstTimeSteps?: string[];
    securityNote?: string;
    supportLabel?: string;
    supportUrl?: string;
    copyright?: string;
    copyrightHolder?: string;
    copyrightUrl?: string;
    magicLinkSuccessTitle?: string;
    magicLinkSuccessDescription?: string;
}
export type PlatformId = 'centra' | 'xpdite' | 'polymer';
export type ColorMode = 'light' | 'dark';
export interface PlatformAssets {
    logo?: React.ReactNode;
    screenshot?: string;
    screenshotDark?: string;
    overviewScreenshot?: string;
    overviewScreenshotDark?: string;
}
export interface LumoraAuthConfig {
    apiBaseUrl: string;
    apiKey?: string;
}
export interface LumoraAuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface LumoraUser {
    id: string;
    email: string;
    name?: string;
    profilePicture?: string;
    role?: string;
}
export interface GoogleOAuthResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
}
export interface LumoraLoginProps {
    authConfig: LumoraAuthConfig;
    onLoginSuccess: (response: {
        user: LumoraUser;
        tokens: LumoraAuthTokens;
        platform: PlatformId;
    }) => void;
    onLoginError: (error: Error) => void;
    enableRecaptcha?: boolean;
    recaptchaSiteKey?: string;
    enableGoogleSignIn?: boolean;
    enableMicrosoftSignIn?: boolean;
    enableMagicLinkSignIn?: boolean;
    enablePasskeySignIn?: boolean;
    showErrors?: boolean;
    showPlatformSelector?: boolean;
    defaultPlatform?: PlatformId;
    showOverview?: boolean;
    onPlatformChange?: (platform: PlatformId) => void;
    platformAssets?: Partial<Record<PlatformId, PlatformAssets>>;
    defaultColorMode?: ColorMode;
    onColorModeChange?: (mode: ColorMode) => void;
    branding?: BrandingConfig;
}
export interface MagicLinkFormData {
    email: string;
}
export interface PasskeyInfo {
    id: string;
    name?: string;
    createdAt?: string;
}
export type LoginState = 'idle' | 'google-loading' | 'microsoft-loading' | 'passkey-loading' | 'success' | 'error' | 'magic-link-loading' | 'magic-link-success';
export interface ErrorState {
    message: string;
    type: 'google' | 'microsoft' | 'magic-link' | 'passkey' | 'network' | 'recaptcha';
}
declare global {
    interface Window {
        grecaptcha: {
            ready: (callback: () => void) => void;
            execute: (siteKey: string, options: {
                action: string;
            }) => Promise<string>;
        };
    }
}
//# sourceMappingURL=index.d.ts.map