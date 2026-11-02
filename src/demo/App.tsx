import React, { useState } from 'react';
import { SlidersHorizontalIcon, XIcon } from 'lucide-react';
import {
	LumoraLogin,
	LumoraLoginSkeleton,
	BrandingConfig,
	LumoraAuthConfig,
	TokenStorage,
	usePasskeyRegistration
} from '../index';
import { ColorMode, PlatformId } from '../types';
import CallbackPage from './CallbackPage';

// ?platform=centra|xpdite|polymer and ?mode=dark open the demo in that state
const demoParams = new URLSearchParams(window.location.search);
const demoPlatform = demoParams.get('platform') as PlatformId | null;
// Without ?mode the demo behaves like production: saved choice, else the system setting
const demoColorMode = (demoParams.get('mode') as ColorMode | null) ?? undefined;
// ?overview=1 opens on the ecosystem overview (showOverview)
const demoOverview = demoParams.has('overview');
// ?skeleton=1 shows the loading skeleton instead of the form
const demoSkeleton = demoParams.has('skeleton');

// Demo settings panel styles (the demo's own, not part of the library)
const panelCard =
	'll:rounded-lg ll:border ll:border-[#e5e7eb] ll:bg-white ll:p-6';
const panelTitle = 'll:mb-3 ll:text-[18px] ll:font-semibold';
const fieldClass =
	'll:h-9 ll:w-full ll:rounded-md ll:border ll:border-[#8a939b] ll:px-2.5 ll:text-[14px] ll:outline-none ll:focus:border-[#049586]';
const demoButton =
	'll:inline-flex ll:h-9 ll:items-center ll:justify-center ll:rounded-md ll:bg-[#049586] ll:px-4 ll:text-[14px] ll:font-semibold ll:text-white ll:hover:bg-[#037e72]';

// Labelled text field
const DemoField: React.FC<{
	label: string;
	value: string;
	onChange?: (value: string) => void;
	type?: string;
	readOnly?: boolean;
}> = ({ label, value, onChange, type = 'text', readOnly = false }) => (
	<label className="ll:grid ll:gap-1 ll:text-[13px] ll:font-semibold ll:text-[#55636b]">
		{label}
		<input
			type={type}
			value={value}
			readOnly={readOnly}
			onChange={event => onChange?.(event.target.value)}
			className={fieldClass}
		/>
	</label>
);

// Labelled checkbox
const DemoSwitch: React.FC<{
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
	<label className="ll:flex ll:items-center ll:gap-2 ll:text-[14px]">
		<input
			type="checkbox"
			checked={checked}
			onChange={event => onChange(event.target.checked)}
		/>
		{label}
	</label>
);

// Main demo application component
const App: React.FC = () => {
	// Check if on callback route
	const isCallbackRoute =
		window.location.pathname === '/auth/callback' ||
		window.location.pathname === '/callback';

	// If on callback route, show the callback page
	if (demoSkeleton) {
		return (
			<LumoraLoginSkeleton
				defaultPlatform={demoPlatform ?? undefined}
				defaultColorMode={demoColorMode}
			/>
		);
	}

	if (isCallbackRoute) {
		return <CallbackPage />;
	}

	// State for all LumoraLogin props
	const [enableGoogleSignIn, setEnableGoogleSignIn] = useState(true);
	const [enableMicrosoftSignIn, setEnableMicrosoftSignIn] = useState(true);
	const [enableMagicLinkSignIn, setEnableMagicLinkSignIn] = useState(true);
	const [enablePasskeySignIn, setEnablePasskeySignIn] = useState(true);
	const [showOverview, setShowOverview] = useState(demoOverview);

	// Auto-detect configuration from environment variables
	const apiBaseUrl =
		import.meta.env.VITE_API_URL ||
		import.meta.env.API_URL ||
		'https://dev.api.lumora.capital';

	const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;

	// Auto-detect redirect URI: current origin + /auth/callback

	// API configuration (auto-detected, no user input needed)
	const authConfig: LumoraAuthConfig = {
		apiBaseUrl,
		apiKey
	};

	// State for branding configuration
	const [branding, setBranding] = useState<BrandingConfig>({
		companyName: 'Lumora Capital',
		tagline: 'One Lumora account for Centra, XPdite and Polymer.'
	});

	// Demo settings drawer
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	// State for demo feedback
	const [lastAction, setLastAction] = useState<string>('');
	const [loginAttempts, setLoginAttempts] = useState(0);
	const [isSignedIn, setIsSignedIn] = useState(TokenStorage.hasTokens());

	// Passkey registration for the signed-in user
	const passkey = usePasskeyRegistration(authConfig);

	// Register a passkey on this device for the current user
	const handleRegisterPasskey = async () => {
		const result = await passkey.registerPasskey('Demo passkey');
		if (result) {
			setLastAction(
				'✅ Passkey registered! You can now sign in with it.'
			);
		}
	};

	// Handle successful login
	const handleLoginSuccess = (response: unknown) => {
		const responseData = response as {
			user?: { email?: string; name?: string };
			tokens?: { accessToken: string };
		};
		setLastAction(
			`✅ Login successful! User: ${
				responseData.user?.name || responseData.user?.email || 'N/A'
			}`
		);
		setLoginAttempts(prev => prev + 1);
		setIsSettingsOpen(true);
		setIsSignedIn(true);
		console.log('Login successful:', response);
	};

	// Handle login errors
	const handleLoginError = (error: Error) => {
		setLastAction(`❌ Login failed: ${error.message}`);
		setIsSettingsOpen(true);
		console.error('Login error:', error);
	};

	// Reset demo state
	const resetDemo = () => {
		setLastAction('');
		setLoginAttempts(0);
	};

	// Update branding configuration
	const updateBranding = (updates: Partial<BrandingConfig>) => {
		setBranding((prev: BrandingConfig) => ({ ...prev, ...updates }));
	};

	// Render the demo
	return (
		<>
			{/* Full-page login */}
			<LumoraLogin
				authConfig={authConfig}
				onLoginSuccess={handleLoginSuccess}
				onLoginError={handleLoginError}
				enableGoogleSignIn={enableGoogleSignIn}
				enableMicrosoftSignIn={enableMicrosoftSignIn}
				enableMagicLinkSignIn={enableMagicLinkSignIn}
				enablePasskeySignIn={enablePasskeySignIn}
				defaultPlatform={demoPlatform ?? undefined}
				showOverview={showOverview}
				defaultColorMode={demoColorMode}
				// Overview art served from public/platform-dashboards; the platform dashboards are built in
				platformAssets={{
					centra: {
						overviewScreenshot:
							'/platform-dashboards/uncut/centra-uncut.svg',
						overviewScreenshotDark:
							'/platform-dashboards/uncut/centra-uncut-dark.svg'
					},
					xpdite: {
						overviewScreenshot:
							'/platform-dashboards/uncut/xpdite-uncut.svg',
						overviewScreenshotDark:
							'/platform-dashboards/uncut/xpdite-uncut-dark.svg'
					},
					polymer: {
						overviewScreenshot:
							'/platform-dashboards/uncut/polymer-uncut.svg',
						overviewScreenshotDark:
							'/platform-dashboards/uncut/polymer-uncut-dark.svg'
					}
				}}
				onPlatformChange={platform =>
					setLastAction(`Platform: ${platform}`)
				}
				branding={branding}
			/>

			{/* Opens the demo settings */}
			<button
				type="button"
				aria-label="Demo settings"
				onClick={() => setIsSettingsOpen(true)}
				className="ll:fixed ll:right-6 ll:bottom-6 ll:inline-flex ll:size-12 ll:items-center ll:justify-center ll:rounded-full ll:bg-[#049586] ll:text-white ll:shadow-lg ll:hover:bg-[#037e72]"
			>
				<SlidersHorizontalIcon className="ll:size-5" />
			</button>

			{isSettingsOpen && (
				<div
					className="ll:fixed ll:inset-0 ll:z-50 ll:flex ll:justify-end ll:bg-black/30"
					onClick={() => setIsSettingsOpen(false)}
				>
					<div
						role="dialog"
						aria-label="Demo settings"
						onClick={event => event.stopPropagation()}
						className="ll:flex ll:h-full ll:w-full ll:max-w-[480px] ll:flex-col ll:gap-4 ll:overflow-y-auto ll:bg-[#f4f2f0] ll:p-6 ll:font-[Source_Sans_3,Arial,sans-serif] ll:text-[#1a1a1a]"
					>
						<div className="ll:flex ll:items-center ll:justify-between">
							<h2 className="ll:text-[22px] ll:font-semibold">
								Demo settings
							</h2>
							<button
								type="button"
								aria-label="Close settings"
								onClick={() => setIsSettingsOpen(false)}
							>
								<XIcon className="ll:size-5" />
							</button>
						</div>

						{/* Status */}
						<div className={panelCard}>
							<h3 className={panelTitle}>Status</h3>
							<p className="ll:text-[14px]">
								Login attempts: {loginAttempts} ·{' '}
								{isSignedIn ? 'Signed in' : 'Signed out'}
							</p>
							{lastAction && (
								<p className="ll:mt-2 ll:text-[14px]">
									{lastAction}
								</p>
							)}
							{isSignedIn && passkey.isSupported && (
								<div className="ll:mt-3 ll:grid ll:gap-2">
									{passkey.error && (
										<p className="ll:text-[14px] ll:text-[#c62828]">
											{passkey.error.message}
										</p>
									)}
									<button
										type="button"
										className={demoButton}
										onClick={handleRegisterPasskey}
										disabled={passkey.loading}
									>
										{passkey.loading
											? 'Registering...'
											: 'Register a passkey on this device'}
									</button>
								</div>
							)}
							<button
								type="button"
								className={`${demoButton} ll:mt-3`}
								onClick={resetDemo}
							>
								Reset demo
							</button>
						</div>

						{/* API */}
						<div className={panelCard}>
							<h3 className={panelTitle}>API configuration</h3>
							<div className="ll:grid ll:gap-3">
								<DemoField
									label="API Base URL"
									value={authConfig.apiBaseUrl}
									readOnly
								/>
								<DemoField
									label="API Key"
									value={
										authConfig.apiKey
											? '••••••••'
											: 'Not set'
									}
									readOnly
								/>
							</div>
						</div>

						{/* Sign-in methods */}
						<div className={panelCard}>
							<h3 className={panelTitle}>Sign-in methods</h3>
							<div className="ll:grid ll:gap-2">
								<DemoSwitch
									label="Enable Google Sign In"
									checked={enableGoogleSignIn}
									onChange={setEnableGoogleSignIn}
								/>
								<DemoSwitch
									label="Enable Microsoft Sign In"
									checked={enableMicrosoftSignIn}
									onChange={setEnableMicrosoftSignIn}
								/>
								<DemoSwitch
									label="Enable Magic Link Sign In"
									checked={enableMagicLinkSignIn}
									onChange={setEnableMagicLinkSignIn}
								/>
								<DemoSwitch
									label="Enable Passkey Sign In"
									checked={enablePasskeySignIn}
									onChange={setEnablePasskeySignIn}
								/>
								<DemoSwitch
									label="Show Overview (no platform selected)"
									checked={showOverview}
									onChange={setShowOverview}
								/>
							</div>
						</div>

						{/* Branding */}
						<div className={panelCard}>
							<h3 className={panelTitle}>Branding</h3>
							<div className="ll:grid ll:gap-3">
								<DemoField
									label="Company Name"
									value={branding.companyName ?? ''}
									onChange={companyName =>
										updateBranding({ companyName })
									}
								/>
								<DemoField
									label="Tagline"
									value={branding.tagline ?? ''}
									onChange={tagline =>
										updateBranding({ tagline })
									}
								/>
								<DemoField
									label="Primary Color"
									type="color"
									value={branding.primaryColor ?? '#4a9d8a'}
									onChange={primaryColor =>
										updateBranding({ primaryColor })
									}
								/>
								<DemoField
									label="Secondary Color"
									type="color"
									value={branding.secondaryColor ?? '#3d8676'}
									onChange={secondaryColor =>
										updateBranding({ secondaryColor })
									}
								/>
								<DemoField
									label="Logo URL"
									value={(branding.logo as string) ?? ''}
									onChange={logo =>
										updateBranding({
											logo: logo || undefined
										})
									}
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default App;
