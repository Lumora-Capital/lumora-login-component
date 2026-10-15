import { BrandingConfig } from '../types';

/**
 * Default branding configuration for LumoraLogin component
 * Provides sensible defaults for all branding properties
 */
export const getDefaultBranding = (): BrandingConfig => ({
	// Company branding
	companyName: 'Lumora Capital',
	// Title reads "<welcomeTitle> <welcomeTitleAccent>", each part in its own colour (light mode)
	welcomeTitle: 'Welcome to',
	welcomeTitleAccent: 'Lumora.',
	welcomeTitleColor: '#072d29',
	welcomeTitleAccentColor: '#049586',
	tagline: 'One Lumora account for Centra, XPdite and Polymer.',

	// Visual styling (light mode; dark mode keeps primaryColor and draws its own neutrals)
	primaryColor: '#4a9d8a',
	secondaryColor: '#3d8676',
	backgroundColor: '#edf3f5',
	textColor: '#12332d',
	// Text on filled buttons, which are drawn in primaryColor. Set, not left to the host theme's
	// contrastText, which could be dark text on a dark brand colour.
	buttonTextColor: '#ffffff',

	// Fonts are not loaded by the component: the host page loads them, and these fall back
	headingFontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif",
	bodyFontFamily: "'Source Sans 3', 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",

	// Logo configuration: with no custom logo the built-in Lumora Capital logo is drawn
	logoHeight: 32,

	// "First time here?" card
	firstTimeTitle: 'First time here?',
	firstTimeSteps: [
		'Sign in with your work account.',
		'See every platform you can open.',
		'Switch any time, without signing in again.'
	],

	// Footer
	securityNote: 'Authorised users only. Sign-ins are logged.',
	// The address itself is shown, so people can copy it without opening a mail app
	supportLabel: 'contact@lumora.capital',
	supportUrl: 'mailto:contact@lumora.capital',
	// Footer reads "© <year> <holder>", with only the holder linked
	copyright: `© ${new Date().getFullYear()}`,
	copyrightHolder: 'Lumora Capital Solutions',
	copyrightUrl: 'https://lumora.capital/',

	// Magic link messaging
	magicLinkSuccessTitle: 'Check your inbox',
	// Sent only to an active account, and the API answers the same either way so the form cannot
	// reveal who has one: say so, rather than promising an email that may never come.
	magicLinkSuccessDescription:
		'If this email address belongs to an active account, we have sent it a sign-in link. The link works once and expires shortly. Nothing arrived? Check your spam folder, or contact your administrator.'
});

/**
 * Merges custom branding configuration with default values
 * @param customBranding - Custom branding configuration to merge
 * @returns Complete branding configuration with defaults applied
 */
export const getBrandingConfig = (
	customBranding?: BrandingConfig
): BrandingConfig => ({
	...getDefaultBranding(),
	...customBranding
});
