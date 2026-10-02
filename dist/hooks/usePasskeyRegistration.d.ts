import { LumoraAuthConfig, PasskeyInfo } from '../types';
/**
 * Hook for registering a passkey for the currently signed-in user
 * Requires the user to be authenticated (access token in storage)
 *
 * @param authConfig - Authentication configuration used to initialize the API client
 * @returns Registration function plus loading, error and browser support state
 */
export declare const usePasskeyRegistration: (authConfig?: LumoraAuthConfig) => {
    registerPasskey: (name?: string) => Promise<PasskeyInfo | null>;
    loading: boolean;
    error: Error | null;
    isSupported: boolean;
};
//# sourceMappingURL=usePasskeyRegistration.d.ts.map