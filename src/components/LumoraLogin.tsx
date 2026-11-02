import React, { useState, useEffect, useRef } from 'react';
import { SubmitHandler } from 'react-hook-form';
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
import { getLoginTheme, themeVariables } from '../utils/loginTheme';
import { THEME_TRANSITION_CLASS } from '../utils/motion';
import { cn } from '../lib/utils';
import { DEFAULT_PLATFORM, PlatformStorage } from '../lib/platforms';
import { useColorMode } from '../hooks/useColorMode';
import { isSignInBusy } from '../utils/loginState';
import { TokenStorage } from '../lib/tokenStorage';
import { API_CONSTANTS } from '../lib/constants';
import { authService } from '../services/authService';
import { getApiClient } from '../lib/apiClient';

// Import sub-components
import { Alert } from './ui/alert';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import GoogleIcon from './GoogleIcon';
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
	branding,
	animateEntrance = true,
	className
}) => {
	// Only the first screen can stand in for a skeleton; a later one (the link sent) animates in
	const isFirstScreen = useRef(true);
	useEffect(() => {
		isFirstScreen.current = false;
	}, []);
	const skipEntrance = !animateEntrance && isFirstScreen.current;

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

	// The page palette as CSS variables on the root, and its mode for the stylesheet
	const containerProps = {
		mode: colorMode,
		style: themeVariables(theme) as React.CSSProperties,
		className
	};

	// Render magic link sent screen
	if (loginState === 'magic-link-success') {
		return (
			<LoginContainer
				{...containerProps}
				hero={hero}
				mobileHero={mobileHero}
				skipEntrance={skipEntrance}
				footer={<LoginFooter brandConfig={brandConfig} />}
			>
				<BrandingHeader
					brandConfig={brandConfig}
					theme={theme}
					showWelcome={false}
					onToggleColorMode={toggleColorMode}
				/>
				<div className="ll:pt-12">
					<EmailSentSuccess
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
				</div>
			</LoginContainer>
		);
	}

	// Render main login form
	return (
		<LoginContainer
			{...containerProps}
			hero={hero}
			mobileHero={mobileHero}
			skipEntrance={skipEntrance}
			footer={<LoginFooter brandConfig={brandConfig} />}
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
				<Alert onClose={() => setError(null)}>{error.message}</Alert>
			)}

			{/* Google / Microsoft side by side */}
			{showProviders && (
				<div
					className={cn(
						'll:grid ll:gap-3',
						enableGoogleSignIn && enableMicrosoftSignIn
							? 'll:grid-cols-2'
							: 'll:grid-cols-1'
					)}
				>
					{enableGoogleSignIn && (
						<SignInOptionButton
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
							icon={<MicrosoftIcon monochrome />}
							label="Microsoft"
							ariaLabel="Continue with Microsoft"
							isLoading={loginState === 'microsoft-loading'}
							disabled={isBusy}
							onClick={() => handleOAuthLogin('microsoft')}
						/>
					)}
				</div>
			)}

			{showProviders && showEmailMethods && (
				<div
					role="separator"
					className={cn(
						'll:flex ll:items-center ll:gap-4 ll:font-body ll:text-[16px] ll:whitespace-nowrap ll:text-label',
						"ll:before:h-px ll:before:flex-1 ll:before:bg-divider ll:before:content-[''] ll:after:h-px ll:after:flex-1 ll:after:bg-divider ll:after:content-['']",
						THEME_TRANSITION_CLASS
					)}
				>
					or use your work email
				</div>
			)}

			{enableMagicLinkSignIn && (
				<MagicLinkForm
					isSubmitting={loginState === 'magic-link-loading'}
					disabled={isBusy}
					onSubmit={handleMagicLinkSubmit}
				/>
			)}

			{showPasskey && (
				<Button
					variant="outline-accent"
					onClick={handlePasskeyLogin}
					disabled={isBusy}
				>
					{loginState === 'passkey-loading' && (
						<Spinner label={null} />
					)}
					{loginState === 'passkey-loading'
						? 'Waiting for passkey...'
						: 'Sign in with passkey'}
				</Button>
			)}

			{showErrors && loginState === 'error' && (
				<Button
					variant="ghost"
					size="auto"
					onClick={handleBackToSignIn}
					className="ll:-mt-3 ll:self-center"
				>
					Try Again
				</Button>
			)}

			{brandConfig.firstTimeSteps &&
				brandConfig.firstTimeSteps.length > 0 && (
					<FirstTimeCard
						title={brandConfig.firstTimeTitle || 'First time here?'}
						steps={brandConfig.firstTimeSteps}
					/>
				)}
		</LoginContainer>
	);
};

export default LumoraLogin;
