import { BrandingConfig, ColorMode, PlatformId } from '../types';
import { LUMORA_DARK_PALETTE, getPlatform } from '../lib/platforms';

// Colours and fonts the login page is drawn with, resolved for one colour mode
export interface LoginTheme {
	mode: ColorMode;
	// Left panel background
	pageBg: string;
	// Cards, inputs and outlined buttons
	surface: string;
	border: string;
	// Headings and strong text
	heading: string;
	// Welcome title: the lead words, then the accented part ("Lumora.")
	welcomeTitle: string;
	welcomeAccent: string;
	// Body copy
	text: string;
	// Line under the welcome title
	tagline: string;
	// Section labels ("Where would you like to start?"), the divider text and the footer
	label: string;
	// Input placeholder: lighter than typed text (#555555) yet still 4.5:1 on white
	placeholder: string;
	// Lines of the "or use your work email" divider, and the step number rings
	divider: string;
	// Lumora green text: "First time here?" step numbers and the IT support link
	brandText: string;
	// "A Lumora Capital ecosystem" label on the overview hero
	eyebrow: string;
	// Lumora Capital logo in the header
	logo: string;
	// Error message: background, border, text and icon
	errorBg: string;
	errorBorder: string;
	errorText: string;
	errorIcon: string;
	// Description under the overview headline
	heroText: string;
	// Overview headline: "One sign-in." and the accented "Every platform."
	heroHeadline: string;
	heroHeadlineAccent: string;
	// Labels, footer and helper text
	muted: string;
	// Default (no platform) hero background and its grid lines
	heroBg: string;
	heroGrid: string;
	// Accent for filled buttons, the passkey outline and links
	accent: string;
	accentHover: string;
	buttonText: string;
	headingFont: string;
	bodyFont: string;
}

// Laptop-height screens: spacing tightens so the sign-in panel fits without scrolling
export const SHORT_SCREEN = '@media (max-height: 920px)';

// Shadow under raised cards (platform selector)
export const CARD_SHADOW = '0 1px 2px rgba(18, 51, 45, 0.06), 0 8px 24px rgba(18, 51, 45, 0.06)';

/**
 * Resolve the page colours for a colour mode and the selected platform
 * @param brandConfig - Merged branding configuration
 * @param mode - Light or dark
 * @param platform - The selected platform, which takes over the accent colour
 * @returns The resolved theme
 */
export const getLoginTheme = (
	brandConfig: BrandingConfig,
	mode: ColorMode,
	platform: PlatformId | null
): LoginTheme => {
	const isDark = mode === 'dark';

	// A selected platform's colour replaces the brand accent
	const platformConfig = platform ? getPlatform(platform) : null;
	const accent = platformConfig
		? isDark
			? platformConfig.colorOnDark
			: platformConfig.uiColor
		: brandConfig.primaryColor!;

	// Dark neutrals are tinted with the selected platform's colour
	const dark = platformConfig ? platformConfig.dark : LUMORA_DARK_PALETTE;

	return {
		mode,
		pageBg: isDark ? dark.pageBg : brandConfig.backgroundColor!,
		surface: isDark ? dark.surface : '#ffffff',
		border: isDark ? dark.border : '#d8e1e2',
		heading: isDark ? dark.heading : brandConfig.textColor!,
		// The branding colours are near-black greens, so dark mode uses the light heading and a mint
		welcomeTitle: isDark ? dark.heading : brandConfig.welcomeTitleColor!,
		// Dark mode matches the logo's brighter teal
		welcomeAccent: isDark ? '#0aa898' : brandConfig.welcomeTitleAccentColor!,
		text: isDark ? dark.text : '#3b4d49',
		tagline: isDark ? dark.text : '#555555',
		label: isDark ? dark.text : '#555555',
		placeholder: isDark ? dark.muted : '#767676',
		divider: isDark ? dark.border : '#c8cccf',
		// Lumora green; its mint version in dark mode, where #03463f would not show
		brandText: isDark ? '#45b39d' : '#03463f',
		// #41746e is too dim on the dark hero (3:1), so dark mode lifts it to a lighter teal
		eyebrow: isDark ? '#6fa59c' : '#41746e',
		// Brand teal; a brighter teal in dark mode so the small "CAPITAL" line stays legible
		logo: isDark ? '#0aa898' : '#049586',
		// MUI's default alert is a light pink block, which clashes with the dark page
		errorBg: isDark ? 'rgba(209, 67, 67, 0.14)' : '#fdeeee',
		errorBorder: isDark ? 'rgba(239, 107, 107, 0.35)' : '#f3c4c4',
		errorText: isDark ? '#f3b9b9' : '#8a1f1f',
		errorIcon: isDark ? '#ef6b6b' : '#d14343',
		heroText: isDark ? dark.text : '#464646',
		// #02453e would vanish on the dark hero; #05a393 reads on both
		heroHeadline: isDark ? dark.heading : '#02453e',
		heroHeadlineAccent: '#05a393',
		muted: isDark ? dark.muted : '#5d6e6a',
		heroBg: isDark ? dark.heroBg : '#f6f7f4',
		heroGrid: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(18, 51, 45, 0.06)',
		accent,
		// Hover darkens the accent slightly
		accentHover: platformConfig ? `color-mix(in srgb, ${accent} 85%, #000)` : brandConfig.secondaryColor!,
		// Dark mode's bright accents fail with white text (about 3:1); dark text passes (5:1+)
		buttonText: isDark ? '#04201c' : brandConfig.buttonTextColor!,
		headingFont: brandConfig.headingFontFamily!,
		bodyFont: brandConfig.bodyFontFamily!
	};
};

/**
 * Keyboard focus ring for buttons, in the accent colour
 * @param theme - Resolved login theme
 * @returns sx rule for MUI's focus-visible state
 */
export const focusRing = (theme: LoginTheme) => ({
	'&.Mui-focusVisible': {
		outline: `2px solid ${theme.accent}`,
		outlineOffset: 2
	}
});

/**
 * Background image for the faint square grid drawn behind the hero
 * @param lineColor - Colour of the grid lines
 * @returns CSS background-image value
 */
export const gridBackground = (lineColor: string): string =>
	`linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`;
