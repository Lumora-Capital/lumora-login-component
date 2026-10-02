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

	// Logo configuration
	logoHeight: 48,
	logo: 'https://via.placeholder.com/200x80/1976d2/ffffff?text=Lumora',

	// Magic link messaging
	magicLinkTitle: 'Sign In with Email',
	magicLinkDescription:
		'Enter your email address and we will send you a secure, one-time link to sign in. No password needed.',
	magicLinkSuccessTitle: 'Check Your Inbox',
	magicLinkSuccessDescription:
		'We have sent you a sign-in link. Open it on this device to finish signing in. The link expires shortly and can only be used once.'
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
