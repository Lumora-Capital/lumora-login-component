import { useEffect, useState } from 'react';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { authService } from '../services/authService';
import { getApiClient } from '../lib/apiClient';
import { LumoraAuthConfig, PasskeyInfo } from '../types';

/**
 * Hook for registering a passkey for the currently signed-in user
 * Requires the user to be authenticated (access token in storage)
 *
 * @param authConfig - Authentication configuration used to initialize the API client
 * @returns Registration function plus loading, error and browser support state
 */
export const usePasskeyRegistration = (authConfig?: LumoraAuthConfig) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [isSupported, setIsSupported] = useState(false);

	// Detect WebAuthn support on the client only
	useEffect(() => {
		setIsSupported(browserSupportsWebAuthn());
	}, []);

	/**
	 * Create and store a new passkey on this device
	 * @param name - Optional friendly name for the passkey
	 * @returns The stored passkey info, or null if registration failed
	 */
	const registerPasskey = async (name?: string): Promise<PasskeyInfo | null> => {
		setLoading(true);
		setError(null);

		try {
			// Ensure the API client exists when used outside LumoraLogin
			if (authConfig?.apiBaseUrl) {
				getApiClient(authConfig.apiBaseUrl, authConfig.apiKey);
			}
			return await authService.registerPasskey(name);
		} catch (err) {
			setError(err as Error);
			return null;
		} finally {
			setLoading(false);
		}
	};

	return { registerPasskey, loading, error, isSupported };
};
