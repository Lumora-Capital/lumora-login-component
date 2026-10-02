// Export the main component
export { default as LumoraLogin } from './components/LumoraLogin';

// Export branding utilities
export { getDefaultBranding, getBrandingConfig } from './utils/branding';

// Export hooks
export { useAuthCallback } from './hooks/useAuthCallback';
export { useLogout } from './hooks/useLogout';
export { usePasskeyRegistration } from './hooks/usePasskeyRegistration';

// Export utilities
export { TokenStorage } from './lib/tokenStorage';

// Export all TypeScript types
export type {
	LumoraLoginProps,
	LoginState,
	ErrorState,
	BrandingConfig,
	GoogleOAuthResponse,
	LumoraAuthConfig,
	LumoraAuthTokens,
	LumoraUser,
	PasskeyInfo
} from './types';
