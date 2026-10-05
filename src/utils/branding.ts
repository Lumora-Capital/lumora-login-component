import { BrandingConfig } from '../types';

/**
 * Default branding configuration for LumoraLogin component
 * Provides sensible defaults for all branding properties
 */
export const getDefaultBranding = (): BrandingConfig => ({
	// Company branding
	companyName: 'Lumora',
	tagline: 'Secure authentication made simple',

	// Visual styling
	primaryColor: '#1976d2',
	secondaryColor: '#42a5f5',
	backgroundColor: '#ffffff',
	textColor: '#333333',
	// Text on filled buttons, which are drawn in primaryColor. Set, not left to the host theme's
	// contrastText, which could be dark text on a dark brand colour.
	buttonTextColor: '#ffffff',

	// Logo configuration
	logoHeight: 48,
	logo: 'https://via.placeholder.com/200x80/1976d2/ffffff?text=Lumora',

	// Magic link messaging
	magicLinkTitle: 'Sign In with Email',
	magicLinkDescription:
		'Enter your email address and we will send you a secure, one-time link to sign in. No password needed.',
	magicLinkSuccessTitle: 'Check Your Inbox',
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
