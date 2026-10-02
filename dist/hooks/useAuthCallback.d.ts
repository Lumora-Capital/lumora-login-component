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
export declare const useAuthCallback: (config?: UseAuthCallbackConfig) => {
    loading: boolean;
    error: Error | null;
};
//# sourceMappingURL=useAuthCallback.d.ts.map