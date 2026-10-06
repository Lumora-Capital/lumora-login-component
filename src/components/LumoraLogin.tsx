import React, { useState, useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { Box, Alert, Stack, Button } from '@mui/material';
import {
	Google as GoogleIcon,
	MailOutline as MailOutlineIcon,
	Fingerprint as FingerprintIcon
} from '@mui/icons-material';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import {
	LumoraLoginProps,
	LumoraAuthTokens,
	LumoraUser,
	MagicLinkFormData,
	LoginState,
	ErrorState
} from '../types';
import { getBrandingConfig } from '../utils/branding';
import { isSignInBusy } from '../utils/loginState';
import { TokenStorage } from '../lib/tokenStorage';
import { API_CONSTANTS } from '../lib/constants';
import { authService } from '../services/authService';
import { getApiClient } from '../lib/apiClient';

// Import sub-components
import BrandingHeader from './BrandingHeader';
import SignInOptionButton from './SignInOptionButton';
import MicrosoftIcon from './MicrosoftIcon';
import EmailRequestForm from './EmailRequestForm';
import EmailSentSuccess from './EmailSentSuccess';
import LoginContainer from './LoginContainer';

/**
 * Lumora Login Component
 * Provides passwordless authentication UI with Google / Microsoft OAuth,
 * magic link, and passkey sign-in via Lumora API
 */
const LumoraLogin: React.FC<LumoraLoginProps> = ({
	authConfig,
	onLoginSuccess,
	onLoginError,
	enableRecaptcha = false,
	recaptchaSiteKey,
	enableGoogleSignIn = true,
	enableMicrosoftSignIn = false,
	enableMagicLinkSignIn = false,
	enablePasskeySignIn = false,
	showErrors = true,
	branding
}) => {
	// Component state management
	const [loginState, setLoginState] = useState<LoginState>('idle');
	const [error, setError] = useState<ErrorState | null>(null);

	// Passkeys are only offered when the browser supports WebAuthn
	const [isPasskeySupported, setIsPasskeySupported] = useState(false);

	// Get merged branding configuration
	const brandConfig = getBrandingConfig(branding);

	// OAuth and magic link flows land on this frontend route
	const getCallbackUri = () => `${window.location.origin}/callback`;

	// Detect WebAuthn support on the client only
	useEffect(() => {
		setIsPasskeySupported(browserSupportsWebAuthn());
	}, []);

	// Initialize API client on mount
	useEffect(() => {
		try {
			getApiClient(authConfig.apiBaseUrl, authConfig.apiKey);
		} catch (error) {
			console.error('Failed to initialize API client:', error);
		}
	}, [authConfig.apiBaseUrl, authConfig.apiKey]);

	// Validate that at least one sign-in method is enabled
	if (
		!enableGoogleSignIn &&
		!enableMicrosoftSignIn &&
		!enableMagicLinkSignIn &&
		!enablePasskeySignIn
	) {
		throw new Error(
			'At least one sign-in method must be enabled (enableGoogleSignIn, enableMicrosoftSignIn, enableMagicLinkSignIn or enablePasskeySignIn)'
		);
	}

	// Validate reCAPTCHA configuration
	if (enableRecaptcha && !recaptchaSiteKey) {
		throw new Error(
			'recaptchaSiteKey is required when enableRecaptcha is true'
		);
	}

	// Handle reCAPTCHA execution
	const executeRecaptcha = (): Promise<string> => {
		return window.grecaptcha
			.execute(recaptchaSiteKey!, { action: 'login' })
			.catch(() => {
				throw new Error('reCAPTCHA verification failed');
			});
	};

	// Handle reCAPTCHA verification
	const verifyRecaptcha = async (): Promise<string> => {
		if (!enableRecaptcha || !recaptchaSiteKey) {
			return '';
		}

		if (typeof window === 'undefined' || !window.grecaptcha) {
			throw new Error('reCAPTCHA is not loaded');
		}

		return new Promise((resolve, reject) => {
			const handleRecaptchaReady = () => {
				executeRecaptcha().then(resolve).catch(reject);
			};

			window.grecaptcha.ready(handleRecaptchaReady);
		});
	};

	// Store tokens, fetch the user profile and notify the host app
	const completeSignIn = async (tokens: LumoraAuthTokens, signedInUser?: LumoraUser) => {
		// Store tokens in localStorage
		TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);

		// The sign-in response names the user; fetch the profile only when it did not
		const user = signedInUser ?? (await authService.getCurrentUser());

		// Set success state and call success callback
		setLoginState('success');
		onLoginSuccess({ user, tokens });
	};

	// Handle Google / Microsoft OAuth login (redirect to Lumora API)
	const handleOAuthLogin = (provider: 'google' | 'microsoft') => {
		try {
			// Set loading state before redirect
			setLoginState(`${provider}-loading`);
			setError(null);

			const endpoint =
				provider === 'google'
					? API_CONSTANTS.ENDPOINTS.GOOGLE_AUTH
					: API_CONSTANTS.ENDPOINTS.MICROSOFT_AUTH;

			// Small delay to show loading state
			setTimeout(() => {
				// Initiate OAuth flow through Lumora API
				authService.initiateOAuth(
					endpoint,
					getCallbackUri(),
					authConfig.apiBaseUrl
				);
			}, 300);
		} catch (err) {
			const error = err as Error;
			setError({ message: error.message, type: provider });
			setLoginState('error');
			onLoginError(error);
		}
	};

	// Handle passkey sign-in (WebAuthn assertion)
	const handlePasskeyLogin = async () => {
		setLoginState('passkey-loading');
		setError(null);

		try {
			const { tokens, user } = await authService.loginWithPasskey();
			await completeSignIn(tokens, user);
		} catch (err) {
			const error = err as Error;
			setError({ message: error.message, type: 'passkey' });
			setLoginState('error');
			onLoginError(error);
		}
	};

	// Handle navigate to magic link form
	const handleNavigateToMagicLink = () => {
		setError(null);
		setLoginState('magic-link');
	};

	// Handle magic link form submission
	const handleMagicLinkSubmit: SubmitHandler<MagicLinkFormData> = async data => {
		setLoginState('magic-link-loading');
		setError(null);

		try {
			// Verify reCAPTCHA if enabled
			if (enableRecaptcha) {
				await verifyRecaptcha();
			}

			await authService.requestMagicLink(data.email, getCallbackUri());
			setLoginState('magic-link-success');
		} catch (err) {
			const error = err as Error;
			setError({ message: error.message, type: 'magic-link' });
			setLoginState('magic-link');
			onLoginError(error);
		}
	};

	// Handle back to sign in navigation
	const handleBackToSignIn = () => {
		setError(null);
		setLoginState('idle');
	};

	// Load reCAPTCHA script if enabled
	useEffect(() => {
		if (
			enableRecaptcha &&
			recaptchaSiteKey &&
			typeof window !== 'undefined'
		) {
			const script = document.createElement('script');
			script.src = `https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`;
			script.async = true;
			script.defer = true;
			document.head.appendChild(script);
		}
	}, [enableRecaptcha, recaptchaSiteKey]);

	// Render magic link sent screen
	if (loginState === 'magic-link-success') {
		return (
			<LoginContainer brandConfig={brandConfig}>
				<EmailSentSuccess
					brandConfig={brandConfig}
					title={brandConfig.magicLinkSuccessTitle || 'Check Your Email'}
					description={
						brandConfig.magicLinkSuccessDescription ||
						'If this email address belongs to an active account, we have sent it a sign-in link.'
					}
					onBackToLogin={handleBackToSignIn}
				/>
			</LoginContainer>
		);
	}

	// Render magic link request form
	if (loginState === 'magic-link' || loginState === 'magic-link-loading') {
		return (
			<LoginContainer brandConfig={brandConfig}>
				<BrandingHeader brandConfig={brandConfig} />
				<EmailRequestForm
					brandConfig={brandConfig}
					title={brandConfig.magicLinkTitle || 'Sign In with Email'}
					description={
						brandConfig.magicLinkDescription ||
						'Enter your email address and we will send you a one-time link to sign in.'
					}
					submitLabel="Send Sign-In Link"
					isSubmitting={loginState === 'magic-link-loading'}
					error={showErrors ? error : null}
					onSubmit={handleMagicLinkSubmit}
					onBackToLogin={handleBackToSignIn}
					onCloseError={() => setError(null)}
				/>
			</LoginContainer>
		);
	}

	// Passkey button requires browser WebAuthn support
	const showPasskey = enablePasskeySignIn && isPasskeySupported;
	const isBusy = isSignInBusy(loginState);

	// Render main login form
	return (
		<Box>
			<BrandingHeader
				brandConfig={brandConfig}
				title={
					brandConfig.companyName
						? brandConfig.companyName
						: 'Sign In'
				}
				subtitle={brandConfig.tagline}
			/>
			<LoginContainer brandConfig={brandConfig}>
				{showErrors && error && (
					<Alert
						severity="error"
						sx={{ mb: 3 }}
						onClose={() => setError(null)}
					>
						{error.message}
					</Alert>
				)}

				<Stack spacing={3}>
					{showPasskey && (
						<SignInOptionButton
							brandConfig={brandConfig}
							icon={<FingerprintIcon />}
							label="Sign in with a passkey"
							loadingLabel="Waiting for passkey..."
							isLoading={loginState === 'passkey-loading'}
							disabled={isBusy}
							onClick={handlePasskeyLogin}
						/>
					)}

					{enableGoogleSignIn && (
						<SignInOptionButton
							brandConfig={brandConfig}
							icon={<GoogleIcon />}
							label="Continue with Google"
							isLoading={loginState === 'google-loading'}
							disabled={isBusy}
							onClick={() => handleOAuthLogin('google')}
						/>
					)}

					{enableMicrosoftSignIn && (
						<SignInOptionButton
							brandConfig={brandConfig}
							icon={<MicrosoftIcon />}
							label="Continue with Microsoft"
							isLoading={loginState === 'microsoft-loading'}
							disabled={isBusy}
							onClick={() => handleOAuthLogin('microsoft')}
						/>
					)}

					{enableMagicLinkSignIn && (
						<SignInOptionButton
							brandConfig={brandConfig}
							icon={<MailOutlineIcon />}
							label="Email me a sign-in link"
							disabled={isBusy}
							onClick={handleNavigateToMagicLink}
						/>
					)}

					{showErrors && loginState === 'error' && (
						<Button
							fullWidth
							variant="text"
							onClick={handleBackToSignIn}
							sx={{
								mt: 1,
								color: brandConfig.primaryColor,
								textTransform: 'none',
								fontWeight: 500,
								'&:hover': {
									backgroundColor: `${brandConfig.primaryColor}08`
								}
							}}
						>
							Try Again
						</Button>
					)}
				</Stack>
			</LoginContainer>
		</Box>
	);
};

export default LumoraLogin;
