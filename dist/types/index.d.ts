export interface BrandingConfig {
    logo?: string | React.ReactNode;
    logoHeight?: number;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonTextColor?: string;
    companyName?: string;
    tagline?: string;
    magicLinkTitle?: string;
    magicLinkDescription?: string;
    magicLinkSuccessTitle?: string;
    magicLinkSuccessDescription?: string;
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
    }) => void;
    onLoginError: (error: Error) => void;
    enableRecaptcha?: boolean;
    recaptchaSiteKey?: string;
    enableGoogleSignIn?: boolean;
    enableMicrosoftSignIn?: boolean;
    enableMagicLinkSignIn?: boolean;
    enablePasskeySignIn?: boolean;
    showErrors?: boolean;
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
export type LoginState = 'idle' | 'google-loading' | 'microsoft-loading' | 'passkey-loading' | 'success' | 'error' | 'magic-link' | 'magic-link-loading' | 'magic-link-success';
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