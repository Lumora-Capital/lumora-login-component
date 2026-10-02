import React, { useState } from 'react';
import {
	CssBaseline,
	ThemeProvider,
	createTheme,
	Box,
	Typography,
	FormControlLabel,
	Switch,
	Paper,
	TextField,
	Button,
	Alert,
	Card,
	CardContent
} from '@mui/material';
import {
	LumoraLogin,
	BrandingConfig,
	LumoraAuthConfig,
	TokenStorage,
	usePasskeyRegistration
} from '../index';
import CallbackPage from './CallbackPage';

// Create Material-UI theme for the demo
const theme = createTheme({
	palette: {
		mode: 'light'
	}
});

// Main demo application component
const App: React.FC = () => {
	// Check if on callback route
	const isCallbackRoute =
		window.location.pathname === '/auth/callback' ||
		window.location.pathname === '/callback';

	// If on callback route, show the callback page
	if (isCallbackRoute) {
		return (
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<CallbackPage />
			</ThemeProvider>
		);
	}

	// State for all LumoraLogin props
	const [enableGoogleSignIn, setEnableGoogleSignIn] = useState(true);
	const [enableMicrosoftSignIn, setEnableMicrosoftSignIn] = useState(true);
	const [enableMagicLinkSignIn, setEnableMagicLinkSignIn] = useState(true);
	const [enablePasskeySignIn, setEnablePasskeySignIn] = useState(true);

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
		apiKey,
	};

	// State for branding configuration
	const [branding, setBranding] = useState<BrandingConfig>({
		companyName: 'Lumora',
		tagline: 'Secure authentication made simple',
		primaryColor: '#1976d2',
		secondaryColor: '#42a5f5',
		backgroundColor: '#ffffff',
		textColor: '#333333',
		logoHeight: 48,
		logo: null
	});

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
			setLastAction('✅ Passkey registered! You can now sign in with it.');
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
		setIsSignedIn(true);
		console.log('Login successful:', response);
	};

	// Handle login errors
	const handleLoginError = (error: Error) => {
		setLastAction(`❌ Login failed: ${error.message}`);
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
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box
				sx={{
					minHeight: '100vh',
					backgroundColor: '#f5f5f5',
					padding: 3
				}}
			>
				<Box
					sx={{
						maxWidth: '1400px',
						margin: '0 auto',
						display: 'grid',
						gridTemplateColumns: {
							xs: '1fr',
							md: 'minmax(400px, 600px) 1fr'
						},
						gap: 3,
						alignItems: 'start'
					}}
				>
					{/* Left Column: Login Component */}
					<Box>
						<LumoraLogin
							authConfig={authConfig}
							onLoginSuccess={handleLoginSuccess}
							onLoginError={handleLoginError}
							enableGoogleSignIn={enableGoogleSignIn}
							enableMicrosoftSignIn={enableMicrosoftSignIn}
							enableMagicLinkSignIn={enableMagicLinkSignIn}
							enablePasskeySignIn={enablePasskeySignIn}
							branding={branding}
						/>
					</Box>

					{/* Right Column: Configuration & Info */}
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 3
						}}
					>
						{/* Demo Info */}
						<Paper sx={{ padding: 3 }}>
							<Typography
								variant="h5"
								gutterBottom
								sx={{ fontWeight: 600 }}
							>
								Lumora Login Component Demo
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ mb: 2 }}
							>
								This demo showcases the Lumora Login Component
								using the Lumora Capital API for authentication.
							</Typography>

							<Alert severity="success" sx={{ mb: 2 }}>
								✅ Connected to: {authConfig.apiBaseUrl}
							</Alert>

							{lastAction && (
								<Alert
									severity={
										lastAction.includes('successful') ||
										lastAction.includes('✅')
											? 'success'
											: 'error'
									}
									sx={{ mt: 2 }}
									onClose={resetDemo}
								>
									{lastAction}
								</Alert>
							)}

							<Box sx={{ mt: 2 }}>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									Login Attempts: {loginAttempts}
								</Typography>
							</Box>

							{/* Passkey registration requires a signed-in user */}
							{isSignedIn && passkey.isSupported && (
								<Box sx={{ mt: 2 }}>
									{passkey.error && (
										<Alert severity="error" sx={{ mb: 2 }}>
											{passkey.error.message}
										</Alert>
									)}
									<Button
										variant="outlined"
										onClick={handleRegisterPasskey}
										disabled={passkey.loading}
									>
										{passkey.loading
											? 'Waiting for passkey...'
											: 'Register a passkey on this device'}
									</Button>
								</Box>
							)}
						</Paper>

						{/* API Configuration - Auto-detected */}
						<Paper sx={{ padding: 3 }}>
							<Typography
								variant="h6"
								gutterBottom
								sx={{ fontWeight: 600 }}
							>
								API Configuration
							</Typography>

							<Alert severity="info" sx={{ mb: 2 }}>
								Configuration auto-detected from environment
								variables
							</Alert>

							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									gap: 2
								}}
							>
								<TextField
									label="API Base URL"
									value={authConfig.apiBaseUrl}
									fullWidth
									size="small"
									disabled
									helperText="From VITE_API_URL or API_URL env variable"
								/>

								<TextField
									label="API Key"
									value={
										authConfig.apiKey
											? '••••••••••••••••'
											: 'Not set'
									}
									fullWidth
									size="small"
									disabled
									helperText="From VITE_API_KEY or API_KEY env variable"
								/>
							</Box>
						</Paper>

						{/* Feature Toggles */}
						<Paper sx={{ padding: 3 }}>
							<Typography
								variant="h6"
								gutterBottom
								sx={{ fontWeight: 600 }}
							>
								Feature Toggles
							</Typography>

							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column'
								}}
							>
								<FormControlLabel
									control={
										<Switch
											checked={enableGoogleSignIn}
											onChange={e =>
												setEnableGoogleSignIn(
													e.target.checked
												)
											}
										/>
									}
									label="Enable Google Sign In"
								/>

								<FormControlLabel
									control={
										<Switch
											checked={enableMicrosoftSignIn}
											onChange={e =>
												setEnableMicrosoftSignIn(
													e.target.checked
												)
											}
										/>
									}
									label="Enable Microsoft Sign In"
								/>

								<FormControlLabel
									control={
										<Switch
											checked={enableMagicLinkSignIn}
											onChange={e =>
												setEnableMagicLinkSignIn(
													e.target.checked
												)
											}
										/>
									}
									label="Enable Magic Link Sign In"
								/>

								<FormControlLabel
									control={
										<Switch
											checked={enablePasskeySignIn}
											onChange={e =>
												setEnablePasskeySignIn(
													e.target.checked
												)
											}
										/>
									}
									label="Enable Passkey Sign In"
								/>
							</Box>
						</Paper>

						{/* Branding Configuration */}
						<Paper sx={{ padding: 3 }}>
							<Typography
								variant="h6"
								gutterBottom
								sx={{ fontWeight: 600 }}
							>
								Branding Configuration
							</Typography>

							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									gap: 2
								}}
							>
								<TextField
									label="Company Name"
									value={branding.companyName}
									onChange={e =>
										updateBranding({
											companyName: e.target.value
										})
									}
									fullWidth
									size="small"
								/>

								<TextField
									label="Tagline"
									value={branding.tagline}
									onChange={e =>
										updateBranding({
											tagline: e.target.value
										})
									}
									fullWidth
									size="small"
								/>

								<TextField
									label="Primary Color"
									type="color"
									value={branding.primaryColor}
									onChange={e =>
										updateBranding({
											primaryColor: e.target.value
										})
									}
									fullWidth
									size="small"
								/>

								<TextField
									label="Secondary Color"
									type="color"
									value={branding.secondaryColor}
									onChange={e =>
										updateBranding({
											secondaryColor: e.target.value
										})
									}
									fullWidth
									size="small"
								/>

								<TextField
									label="Logo URL"
									value={branding.logo as string}
									onChange={e =>
										updateBranding({ logo: e.target.value })
									}
									fullWidth
									size="small"
								/>

								<Button
									variant="outlined"
									onClick={() => {
										setBranding({
											companyName: 'Lumora',
											tagline:
												'Secure authentication made simple',
											primaryColor: '#1976d2',
											secondaryColor: '#42a5f5',
											backgroundColor: '#ffffff',
											textColor: '#333333',
											logoHeight: 48,
											logo: 'https://lumora.capital/_next/image?url=%2Fimages%2Flumora-logo.png&w=256&q=75'
										});
									}}
								>
									Reset to Defaults
								</Button>
							</Box>
						</Paper>

						{/* Usage Example */}
						<Card variant="outlined">
							<CardContent>
								<Typography
									variant="h6"
									gutterBottom
									sx={{ fontWeight: 600 }}
								>
									Usage Example
								</Typography>

								<Box
									component="pre"
									sx={{
										backgroundColor: '#f5f5f5',
										padding: 2,
										borderRadius: 1,
										overflow: 'auto',
										fontSize: '0.875rem'
									}}
								>
									{`import { LumoraLogin } from '@volenday/lumora-login-component';

<LumoraLogin
  authConfig={{
    apiBaseUrl: 'https://dev.api.lumora.capital',
    apiKey: 'your-api-key'
    // Google Redirect URI is auto-generated as window.location.origin + '/callback'
  }}
  onLoginSuccess={(response) => {
    console.log('User:', response.user);
    console.log('Tokens:', response.tokens);
  }}
  onLoginError={(error) => {
    console.error('Login failed:', error);
  }}
  enableGoogleSignIn={true}
  enableMicrosoftSignIn={true}
  enableMagicLinkSignIn={true}
  enablePasskeySignIn={true}
/>`}
								</Box>
							</CardContent>
						</Card>
					</Box>
				</Box>
			</Box>
		</ThemeProvider>
	);
};

export default App;
