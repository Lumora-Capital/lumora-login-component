import React, { useState, useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { Box, Alert, Button, CircularProgress, Divider } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import {
	LumoraLoginProps,
	LumoraAuthTokens,
	LumoraUser,
	MagicLinkFormData,
	LoginState,
	ErrorState,
	PlatformId
} from '../types';
import { getBrandingConfig } from '../utils/branding';
import { CONTROL_HEIGHT, focusRing, getLoginTheme } from '../utils/loginTheme';
import { THEME_TRANSITION } from '../utils/motion';
import { DEFAULT_PLATFORM, PlatformStorage } from '../lib/platforms';
import { useColorMode } from '../hooks/useColorMode';
import { isSignInBusy } from '../utils/loginState';
import { TokenStorage } from '../lib/tokenStorage';
import { API_CONSTANTS } from '../lib/constants';
import { authService } from '../services/authService';
import { getApiClient } from '../lib/apiClient';

// Import sub-components
import BrandingHeader from './BrandingHeader';
import SignInOptionButton from './SignInOptionButton';
import MicrosoftIcon from './MicrosoftIcon';
import MagicLinkForm from './MagicLinkForm';
import EmailSentSuccess from './EmailSentSuccess';
import LoginContainer from './LoginContainer';
import PlatformSelector from './PlatformSelector';
import HeroPanel from './HeroPanel';
import FirstTimeCard from './FirstTimeCard';
import LoginFooter from './LoginFooter';

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
	defaultPlatform,
	showOverview = false,
	showPlatformSelector = false,
	onPlatformChange,
	platformAssets,
	defaultColorMode,
	onColorModeChange,
	branding
}) => {
	// Component state management
	const [loginState, setLoginState] = useState<LoginState>('idle');
	const [error, setError] = useState<ErrorState | null>(null);

	// Passkeys are only offered when the browser supports WebAuthn
	const [isPasskeySupported, setIsPasskeySupported] = useState(false);

	// The selected platform: the host's default, else the user's last choice, else Centra.
	// With showOverview the page opens on the ecosystem overview instead, with none selected.
	// Without the selector the page is always Centra.
	const getStartPlatform = (): PlatformId | null => {
		if (!showPlatformSelector) {
			return DEFAULT_PLATFORM;
		}
		return showOverview
			? null
			: (defaultPlatform ?? PlatformStorage.get() ?? DEFAULT_PLATFORM);
	};
	const [platform, setPlatform] = useState<PlatformId | null>(
		getStartPlatform
	);

	// Turning showOverview on later returns to the overview; turning it off selects the starting
	// platform again (set during render, so the hero never draws the stale state)
	const [overviewShown, setOverviewShown] = useState(showOverview);
	if (overviewShown !== showOverview) {
		setOverviewShown(showOverview);
		setPlatform(getStartPlatform());
	}

	// Where a sign-in lands: the selected platform, else (on the overview) Centra
	const landingPlatform = platform ?? DEFAULT_PLATFORM;

	// Store it (the starting one too), so the callback page can send the user there after an
	// OAuth or magic link redirect
	useEffect(() => {
		PlatformStorage.set(landingPlatform);
	}, [landingPlatform]);
	const { colorMode, toggleColorMode } = useColorMode(
		defaultColorMode,
		onColorModeChange
	);

	// Get merged branding configuration and the colours it resolves to
	const brandConfig = getBrandingConfig(branding);
	const theme = getLoginTheme(brandConfig, colorMode, platform);

	// OAuth and magic link flows land on this frontend route
	const getCallbackUri = () => `${window.location.origin}/callback`;

	// Back from the provider's page (e.g. the user cancelled): the browser restores this page
	// from its back-forward cache as it was left, so the button would stay on "Signing in..."
	useEffect(() => {
		const handlePageShow = (event: PageTransitionEvent) => {
			if (event.persisted) {
				setLoginState(state =>
					state === 'google-loading' || state === 'microsoft-loading'
						? 'idle'
						: state
				);
			}
		};
		window.addEventListener('pageshow', handlePageShow);
		return () => window.removeEventListener('pageshow', handlePageShow);
	}, []);

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
	const completeSignIn = async (
		tokens: LumoraAuthTokens,
		signedInUser?: LumoraUser
	) => {
		// Store tokens in localStorage
		TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);

		// The sign-in response names the user; fetch the profile only when it did not
		const user = signedInUser ?? (await authService.getCurrentUser());

		// Set success state and call success callback
		setLoginState('success');
		onLoginSuccess({ user, tokens, platform: landingPlatform });
	};

	// Switch platform. Clearing it (clicking the selected one) is only offered with showOverview,
	// and returns to the overview
	const handlePlatformChange = (nextPlatform: PlatformId | null) => {
		setPlatform(nextPlatform);
		if (nextPlatform) {
			onPlatformChange?.(nextPlatform);
		}
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

	// Handle magic link form submission
	const handleMagicLinkSubmit: SubmitHandler<
		MagicLinkFormData
	> = async data => {
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
			setLoginState('error');
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

	// Passkey button requires browser WebAuthn support
	const showPasskey = enablePasskeySignIn && isPasskeySupported;
	const isBusy = isSignInBusy(loginState);
	const showProviders = enableGoogleSignIn || enableMicrosoftSignIn;
	const showEmailMethods = enableMagicLinkSignIn || showPasskey;

	// Right-hand hero follows the selected platform
	const hero = (
		<HeroPanel
			theme={theme}
			platform={platform}
			platformAssets={platformAssets}
		/>
	);
	const mobileHero = (
		<HeroPanel
			theme={theme}
			platform={platform}
			platformAssets={platformAssets}
			compact
		/>
	);

	// Render magic link sent screen
	if (loginState === 'magic-link-success') {
		return (
			<LoginContainer
				theme={theme}
				hero={hero}
				mobileHero={mobileHero}
				footer={<LoginFooter brandConfig={brandConfig} theme={theme} />}
			>
				<BrandingHeader
					brandConfig={brandConfig}
					theme={theme}
					showWelcome={false}
					onToggleColorMode={toggleColorMode}
				/>
				<Box sx={{ pt: 6 }}>
					<EmailSentSuccess
						theme={theme}
						title={
							brandConfig.magicLinkSuccessTitle ||
							'Check your inbox'
						}
						description={
							brandConfig.magicLinkSuccessDescription ||
							'If this email address belongs to an active account, we have sent it a sign-in link.'
						}
						onBackToLogin={handleBackToSignIn}
					/>
				</Box>
			</LoginContainer>
		);
	}

	// Render main login form
	return (
		<LoginContainer
			theme={theme}
			hero={hero}
			mobileHero={mobileHero}
			footer={<LoginFooter brandConfig={brandConfig} theme={theme} />}
		>
			<BrandingHeader
				brandConfig={brandConfig}
				theme={theme}
				onToggleColorMode={toggleColorMode}
			/>

			{showPlatformSelector && (
				<PlatformSelector
					theme={theme}
					value={platform}
					platformAssets={platformAssets}
					disabled={isBusy}
					allowClear={showOverview}
					onChange={handlePlatformChange}
				/>
			)}

			{showErrors && error && (
				<Alert
					severity="error"
					onClose={() => setError(null)}
					sx={{
						borderRadius: '10px',
						border: `1px solid ${theme.errorBorder}`,
						backgroundColor: theme.errorBg,
						color: theme.errorText,
						fontFamily: theme.bodyFont,
						fontSize: 15,
						transition: THEME_TRANSITION,
						'& .MuiAlert-icon': { color: theme.errorIcon },
						'& .MuiAlert-action .MuiIconButton-root': {
							color: theme.errorText
						}
					}}
				>
					{error.message}
				</Alert>
			)}

			{/* Google / Microsoft side by side */}
			{showProviders && (
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns:
							enableGoogleSignIn && enableMicrosoftSignIn
								? '1fr 1fr'
								: '1fr',
						gap: 1.5
					}}
				>
					{enableGoogleSignIn && (
						<SignInOptionButton
							theme={theme}
							icon={<GoogleIcon />}
							label="Google"
							ariaLabel="Continue with Google"
							isLoading={loginState === 'google-loading'}
							disabled={isBusy}
							onClick={() => handleOAuthLogin('google')}
						/>
					)}

					{enableMicrosoftSignIn && (
						<SignInOptionButton
							theme={theme}
							icon={<MicrosoftIcon monochrome />}
							label="Microsoft"
							ariaLabel="Continue with Microsoft"
							isLoading={loginState === 'microsoft-loading'}
							disabled={isBusy}
							onClick={() => handleOAuthLogin('microsoft')}
						/>
					)}
				</Box>
			)}

			{showProviders && showEmailMethods && (
				<Divider
					sx={{
						fontFamily: theme.bodyFont,
						fontSize: 16,
						color: theme.label,
						transition: THEME_TRANSITION,
						'&::before, &::after': {
							borderColor: theme.divider,
							transition: THEME_TRANSITION
						}
					}}
				>
					or use your work email
				</Divider>
			)}

			{enableMagicLinkSignIn && (
				<MagicLinkForm
					theme={theme}
					isSubmitting={loginState === 'magic-link-loading'}
					disabled={isBusy}
					onSubmit={handleMagicLinkSubmit}
				/>
			)}

			{showPasskey && (
				<Button
					fullWidth
					variant="outlined"
					onClick={handlePasskeyLogin}
					disabled={isBusy}
					startIcon={
						loginState === 'passkey-loading' ? (
							<CircularProgress size={16} color="inherit" />
						) : undefined
					}
					sx={{
						...CONTROL_HEIGHT,
						borderRadius: '10px',
						borderWidth: 1.5,
						borderColor: theme.accent,
						backgroundColor: theme.surface,
						color: theme.accent,
						fontFamily: theme.headingFont,
						fontWeight: 600,
						fontSize: 13,
						letterSpacing: '0.14em',
						transition: THEME_TRANSITION,
						'&:hover': {
							borderWidth: 1.5,
							borderColor: theme.accentHover,
							backgroundColor: `${theme.accent}0f`
						},
						'&.Mui-disabled': {
							borderWidth: 1.5,
							borderColor: theme.border,
							color: theme.muted
						},
						...focusRing(theme)
					}}
				>
					{loginState === 'passkey-loading'
						? 'Waiting for passkey...'
						: 'Sign in with passkey'}
				</Button>
			)}

			{showErrors && loginState === 'error' && (
				<Button
					variant="text"
					onClick={handleBackToSignIn}
					sx={{
						alignSelf: 'center',
						mt: -1.5,
						color: theme.accent,
						fontFamily: theme.headingFont,
						textTransform: 'none',
						fontWeight: 600,
						...focusRing(theme)
					}}
				>
					Try Again
				</Button>
			)}

			{brandConfig.firstTimeSteps &&
				brandConfig.firstTimeSteps.length > 0 && (
					<FirstTimeCard
						theme={theme}
						title={brandConfig.firstTimeTitle || 'First time here?'}
						steps={brandConfig.firstTimeSteps}
					/>
				)}
		</LoginContainer>
	);
};

export default LumoraLogin;
