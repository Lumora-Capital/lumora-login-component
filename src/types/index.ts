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

// Lumora platforms a user can choose to start in
export type PlatformId = 'centra' | 'xpdite' | 'polymer';

// Light or dark appearance of the login page
export type ColorMode = 'light' | 'dark';

// Host-supplied artwork for a platform; anything left out falls back to a placeholder
export interface PlatformAssets {
	logo?: React.ReactNode;
	// Dashboard shown when this platform is selected (cropped to the hero)
	screenshot?: string;
	// Dashboard for dark mode; without one, dark mode also shows `screenshot`
	screenshotDark?: string;
	// Whole window for the overview stack, with its shadow built in; used when all three have one
	overviewScreenshot?: string;
	// Overview window for dark mode; without one, dark mode also shows `overviewScreenshot`
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
	// Add other user fields based on API response
}

export interface GoogleOAuthResponse {
	access_token: string;
	expires_in: number;
	scope: string;
	token_type: string;
}

export interface LumoraLoginProps {
	// Required API configuration
	authConfig: LumoraAuthConfig;
	
	// Success/Error callbacks
	onLoginSuccess: (response: {
		user: LumoraUser;
		tokens: LumoraAuthTokens;
		platform: PlatformId;
	}) => void;
	onLoginError: (error: Error) => void;
	
	// Feature toggles
	enableRecaptcha?: boolean;
	recaptchaSiteKey?: string;
	enableGoogleSignIn?: boolean;
	enableMicrosoftSignIn?: boolean;
	enableMagicLinkSignIn?: boolean;
	enablePasskeySignIn?: boolean;

	// false when the host shows onLoginError itself (e.g. a snackbar): the component then draws no
	// error alert and no "Try Again", so the message is not shown twice
	showErrors?: boolean;
	
	// Platform selection ("Where would you like to start?")
	// Show the platform selector. Off by default: the page is then always Centra, and
	// defaultPlatform, showOverview and the user's last choice are ignored.
	showPlatformSelector?: boolean;
	// Platform selected on load; without one, the user's last choice, else Centra
	defaultPlatform?: PlatformId;
	// Open on the ecosystem overview with no platform selected (defaultPlatform and the last
	// choice are then ignored). Clicking the selected platform returns to it. A sign-in made
	// there lands in Centra.
	showOverview?: boolean;
	onPlatformChange?: (platform: PlatformId) => void;
	platformAssets?: Partial<Record<PlatformId, PlatformAssets>>;

	// Appearance
	defaultColorMode?: ColorMode;
	onColorModeChange?: (mode: ColorMode) => void;

	// Styling
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

export type LoginState =
	| 'idle'
	| 'google-loading'
	| 'microsoft-loading'
	| 'passkey-loading'
	| 'success'
	| 'error'
	| 'magic-link-loading'
	| 'magic-link-success';

export interface ErrorState {
	message: string;
	type:
		| 'google'
		| 'microsoft'
		| 'magic-link'
		| 'passkey'
		| 'network'
		| 'recaptcha';
}

// Global reCAPTCHA types
declare global {
	interface Window {
		grecaptcha: {
			ready: (callback: () => void) => void;
			execute: (
				siteKey: string,
				options: { action: string }
			) => Promise<string>;
		};
	}
}
