import { LoginState } from '../types';

// Login states during which every sign-in control should be disabled
const BUSY_STATES: LoginState[] = ['google-loading', 'microsoft-loading', 'passkey-loading'];

/**
 * Check whether a sign-in attempt is currently in progress
 * @param loginState - The current login state
 * @returns True if any sign-in method is busy
 */
export const isSignInBusy = (loginState: LoginState): boolean => BUSY_STATES.includes(loginState);
