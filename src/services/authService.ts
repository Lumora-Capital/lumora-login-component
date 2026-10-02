import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { getApiClient } from '../lib/apiClient';
import { API_CONSTANTS } from '../lib/constants';
import { LumoraAuthTokens, LumoraUser, PasskeyInfo } from '../types';

/**
 * Map a WebAuthn browser error to a user-friendly message
 * @param error - The error thrown by the WebAuthn ceremony
 * @param fallback - Message to use when no specific mapping applies
 * @returns A readable error message
 */
const getPasskeyErrorMessage = (error: any, fallback: string): string => {
	// User dismissed the browser prompt or the operation timed out
	if (error?.name === 'NotAllowedError') {
		return 'Passkey request was cancelled or timed out';
	}
	// The authenticator already holds a credential for this account
	if (error?.name === 'InvalidStateError') {
		return 'A passkey for this account is already registered on this device';
	}
	return error?.response?.data?.message || error?.message || fallback;
};

/**
 * Authentication service for interacting with the Lumora API
 * Provides methods for passwordless sign-in, logout, token refresh, and user management
 */
export const authService = {
	/**
	 * Logout user and invalidate refresh token
	 * @param refreshToken - The refresh token to invalidate
	 * @returns Promise resolving when logout is complete
	 */
	logout: async (refreshToken: string): Promise<void> => {
		try {
			const client = getApiClient();
			await client.post(API_CONSTANTS.ENDPOINTS.LOGOUT, {
				refreshToken
			});
		} catch (error: any) {
			// Log error but don't throw - logout should succeed even if API call fails
			console.error('Logout API call failed:', error);
		}
	},

	/**
	 * Refresh access token using refresh token
	 * @param refreshToken - The refresh token
	 * @returns Promise resolving to new authentication tokens
	 */
	refresh: async (refreshToken: string): Promise<LumoraAuthTokens> => {
		try {
			const client = getApiClient();
			const response = await client.post(API_CONSTANTS.ENDPOINTS.REFRESH, {
				refreshToken
			});

			return {
				accessToken: response.data.accessToken,
				refreshToken: response.data.refreshToken
			};
		} catch (error: any) {
			throw new Error(
				error.response?.data?.message || 
				error.message || 
				'Token refresh failed'
			);
		}
	},

	/**
	 * Get current user profile
	 * @returns Promise resolving to user profile
	 */
	getCurrentUser: async (): Promise<LumoraUser> => {
		try {
			const client = getApiClient();
			const response = await client.get(API_CONSTANTS.ENDPOINTS.USER_ME);
			// GET /auth/me answers { success, data: { ...user } }
			const profile = response.data?.data ?? response.data;

			return {
				id: profile.id,
				email: profile.email,
				name: profile.name,
				profilePicture: profile.profilePicture,
				role: profile.role
			};
		} catch (error: any) {
			throw new Error(
				error.response?.data?.message || 
				error.message || 
				'Failed to fetch user profile'
			);
		}
	},

	/**
	 * Initiate an OAuth flow (Google, Microsoft) by redirecting to Lumora API
	 * @param endpoint - The provider's OAuth start endpoint on the Lumora API
	 * @param redirectUri - The URI to redirect to after OAuth completion
	 * @param apiBaseUrl - The base URL of the Lumora API
	 */
	initiateOAuth: (endpoint: string, redirectUri: string, apiBaseUrl: string): void => {
		// Add prompt=select_account to force the provider to show account selection
		const authUrl = `${apiBaseUrl}${endpoint}?redirect_uri=${encodeURIComponent(redirectUri)}&prompt=select_account`;
		window.location.href = authUrl;
	},

	/**
	 * Request a one-time sign-in link to be emailed to the user
	 * @param email - User's email address
	 * @param redirectUri - Frontend URI the emailed link should point to
	 * @returns Promise resolving when the request has been accepted
	 */
	requestMagicLink: async (email: string, redirectUri: string): Promise<void> => {
		try {
			const client = getApiClient();
			await client.post(API_CONSTANTS.ENDPOINTS.MAGIC_LINK_REQUEST, {
				email,
				redirectUri
			});
		} catch (error: any) {
			throw new Error(
				error.response?.data?.message ||
				error.message ||
				'Failed to send sign-in link'
			);
		}
	},

	/**
	 * Exchange a magic link token for authentication tokens
	 * @param token - The one-time token from the emailed link
	 * @returns Promise resolving to authentication tokens
	 */
	verifyMagicLink: async (token: string): Promise<LumoraAuthTokens> => {
		try {
			const client = getApiClient();
			const response = await client.post(API_CONSTANTS.ENDPOINTS.MAGIC_LINK_VERIFY, {
				token
			});

			return {
				accessToken: response.data.accessToken,
				refreshToken: response.data.refreshToken
			};
		} catch (error: any) {
			throw new Error(
				error.response?.data?.message ||
				error.message ||
				'Sign-in link is invalid or has expired'
			);
		}
	},

	/**
	 * Sign in with a passkey (discoverable credential, no email required)
	 * @returns Promise resolving to authentication tokens
	 */
	loginWithPasskey: async (): Promise<{ tokens: LumoraAuthTokens; user?: LumoraUser }> => {
		try {
			const client = getApiClient();

			// Get a WebAuthn challenge from the API
			const optionsResponse = await client.post(API_CONSTANTS.ENDPOINTS.PASSKEY_LOGIN_OPTIONS);
			const { challengeId, options } = optionsResponse.data;

			// Prompt the user to pick a passkey via the browser / OS
			const assertion = await startAuthentication({ optionsJSON: options });

			// Send the signed assertion back to the API for verification. With credentials, so the
			// browser keeps the shared-session cookie the API sets here (sign-in to sibling Lumora apps).
			const verifyResponse = await client.post(
				API_CONSTANTS.ENDPOINTS.PASSKEY_LOGIN_VERIFY,
				{ challengeId, response: assertion },
				{ withCredentials: true }
			);

			return {
				tokens: {
					accessToken: verifyResponse.data.accessToken,
					refreshToken: verifyResponse.data.refreshToken
				},
				user: verifyResponse.data.user
			};
		} catch (error: any) {
			throw new Error(getPasskeyErrorMessage(error, 'Passkey sign-in failed'));
		}
	},

	/**
	 * Register a new passkey for the currently signed-in user
	 * @param name - Optional friendly name for the passkey (e.g. "MacBook Pro")
	 * @returns Promise resolving to the stored passkey info
	 */
	registerPasskey: async (name?: string): Promise<PasskeyInfo> => {
		try {
			const client = getApiClient();

			// Get registration options for the authenticated user
			const optionsResponse = await client.post(API_CONSTANTS.ENDPOINTS.PASSKEY_REGISTER_OPTIONS);
			const { challengeId, options } = optionsResponse.data;

			// Ask the browser / OS to create a new passkey
			const attestation = await startRegistration({ optionsJSON: options });

			// Send the new credential to the API for verification and storage
			const verifyResponse = await client.post(API_CONSTANTS.ENDPOINTS.PASSKEY_REGISTER_VERIFY, {
				challengeId,
				response: attestation,
				name
			});

			return verifyResponse.data;
		} catch (error: any) {
			throw new Error(getPasskeyErrorMessage(error, 'Passkey registration failed'));
		}
	}
};
