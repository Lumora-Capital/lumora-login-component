import { useEffect, useRef, useState } from 'react';
import { TokenStorage } from '../lib/tokenStorage';
import { getApiClient } from '../lib/apiClient';
import { authService } from '../services/authService';
import { LumoraAuthTokens, LumoraUser } from '../types';

export interface UseAuthCallbackConfig {
	onSuccess?: (tokens: LumoraAuthTokens, user: LumoraUser) => void;
	onError?: (error: Error) => void;
	redirectPath?: string;
	apiBaseUrl?: string;
	apiKey?: string;
}

/**
 * Hook for handling OAuth and magic link callbacks from Lumora API
 * Extracts tokens and user data from URL parameters and stores them in localStorage
 * 
 * Magic link sign-in:
 * - If a 'magic_token' parameter is present, it is exchanged for tokens via the API
 * 
 * Supports both parameter formats:
 * - access_token / refresh_token (underscore format from API)
 * - accessToken / refreshToken (camelCase format)
 * 
 * If user data is included in the URL, it will be parsed directly.
 * Otherwise, it will fetch user data from the API.
 * 
 * Error handling:
 * - Checks for 'error' parameter in URL
 * - Uses 'message' parameter for detailed error messages if available
 * - Falls back to 'error' parameter value if no message provided
 * 
 * @param config - Configuration object for the callback handler
 * @returns Object with loading state and error state
 */
export const useAuthCallback = (config?: UseAuthCallbackConfig) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	// Guard against double execution (React StrictMode) since magic tokens are single-use
	const hasHandled = useRef(false);
	
	useEffect(() => {
		if (hasHandled.current) {
			return;
		}
		hasHandled.current = true;

		const handleCallback = async () => {
			try {
				// Initialize the API client so profile / magic link calls work on this page
				if (config?.apiBaseUrl) {
					getApiClient(config.apiBaseUrl, config.apiKey);
				}

				// Parse URL parameters sent by Lumora API after OAuth completion
				const params = new URLSearchParams(window.location.search);
				
				// Support both camelCase and underscore formats for compatibility
				let accessToken = params.get('access_token') || params.get('accessToken');
				let refreshToken = params.get('refresh_token') || params.get('refreshToken');
				const magicToken = params.get('magic_token');
				const userParam = params.get('user');
				const errorParam = params.get('error');
				const messageParam = params.get('message');
				
				// Check for error parameter from OAuth flow
				// Support both 'error' and 'message' parameters for detailed error info
				if (errorParam) {
					const errorMessage = messageParam 
						? decodeURIComponent(messageParam) 
						: decodeURIComponent(errorParam);
					throw new Error(errorMessage);
				}
				
				// Exchange a magic link token for authentication tokens
				if (magicToken) {
					const tokens = await authService.verifyMagicLink(magicToken);
					accessToken = tokens.accessToken;
					refreshToken = tokens.refreshToken;
				}
				
				// Validate tokens are present
				if (!accessToken || !refreshToken) {
					throw new Error('Missing authentication tokens in callback URL');
				}
				
				// Store tokens in localStorage
				TokenStorage.setTokens(accessToken, refreshToken);
				
				// Parse user data from URL if available, otherwise fetch from API
				let user: LumoraUser;
				if (userParam) {
					try {
						// Decode and parse the user JSON from URL parameter
						const decodedUser = decodeURIComponent(userParam);
						user = JSON.parse(decodedUser);
					} catch (parseError) {
						console.warn('Failed to parse user from URL, fetching from API:', parseError);
						// Fallback to API call if parsing fails
						user = await authService.getCurrentUser();
					}
				} else {
					// Fetch user profile using the new access token if not in URL
					user = await authService.getCurrentUser();
				}
				
				// Call success callback
				config?.onSuccess?.({ accessToken, refreshToken }, user);
				
				// Security: Clean up URL by removing tokens from address bar
				// Redirect to specified path or default to dashboard
				const redirectPath = config?.redirectPath || '/dashboard';
				window.history.replaceState({}, document.title, redirectPath);
				
				setLoading(false);
			} catch (err) {
				const error = err as Error;
				setError(error);
				config?.onError?.(error);
				setLoading(false);
			}
		};
		
		handleCallback();
	}, [config?.redirectPath]);
	
	return { loading, error };
};
