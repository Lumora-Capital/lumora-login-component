import { LumoraAuthTokens, LumoraUser, PasskeyInfo } from '../types';
/**
 * Authentication service for interacting with the Lumora API
 * Provides methods for passwordless sign-in, logout, token refresh, and user management
 */
export declare const authService: {
    /**
     * Logout user and invalidate refresh token
     * @param refreshToken - The refresh token to invalidate
     * @returns Promise resolving when logout is complete
     */
    logout: (refreshToken: string) => Promise<void>;
    /**
     * Refresh access token using refresh token
     * @param refreshToken - The refresh token
     * @returns Promise resolving to new authentication tokens
     */
    refresh: (refreshToken: string) => Promise<LumoraAuthTokens>;
    /**
     * Get current user profile
     * @returns Promise resolving to user profile
     */
    getCurrentUser: () => Promise<LumoraUser>;
    /**
     * Initiate an OAuth flow (Google, Microsoft) by redirecting to Lumora API
     * @param endpoint - The provider's OAuth start endpoint on the Lumora API
     * @param redirectUri - The URI to redirect to after OAuth completion
     * @param apiBaseUrl - The base URL of the Lumora API
     */
    initiateOAuth: (endpoint: string, redirectUri: string, apiBaseUrl: string) => void;
    /**
     * Request a one-time sign-in link to be emailed to the user
     * @param email - User's email address
     * @param redirectUri - Frontend URI the emailed link should point to
     * @returns Promise resolving when the request has been accepted
     */
    requestMagicLink: (email: string, redirectUri: string) => Promise<void>;
    /**
     * Exchange a magic link token for authentication tokens
     * @param token - The one-time token from the emailed link
     * @returns Promise resolving to authentication tokens
     */
    verifyMagicLink: (token: string) => Promise<LumoraAuthTokens>;
    /**
     * Sign in with a passkey (discoverable credential, no email required)
     * @returns Promise resolving to authentication tokens
     */
    loginWithPasskey: () => Promise<LumoraAuthTokens>;
    /**
     * Register a new passkey for the currently signed-in user
     * @param name - Optional friendly name for the passkey (e.g. "MacBook Pro")
     * @returns Promise resolving to the stored passkey info
     */
    registerPasskey: (name?: string) => Promise<PasskeyInfo>;
};
//# sourceMappingURL=authService.d.ts.map