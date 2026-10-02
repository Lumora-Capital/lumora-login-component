# LumoraLogin Component v1.1.0

A reusable, passwordless React TypeScript login component for the Lumora API: Google and Microsoft OAuth, magic links, and passkeys, with a responsive MUI design.

## Features

-   **Passwordless only**: No email/password form, so there are no passwords to leak, reuse or reset
-   **Google & Microsoft OAuth**: Redirect flow through the Lumora API
-   **Magic Link**: One-time sign-in link sent by email
-   **Passkeys**: WebAuthn sign-in (Face ID, Touch ID, Windows Hello, security keys), plus a hook for registering passkeys
-   **Token Management**: Automatic token refresh and localStorage-based session management
-   **reCAPTCHA**: Optional reCAPTCHA Enterprise check before sending magic links
-   **Responsive Design**: Mobile-first design using MUI breakpoints
-   **TypeScript Support**: Full TypeScript definitions included
-   **Customizable Branding**: Logo, colors and copy

## Installation

### Prerequisites

This package requires the following peer dependencies to be installed in your project:

```bash
npm install @mui/material @emotion/react @emotion/styled react react-dom react-hook-form @hookform/resolvers yup @mui/icons-material @react-oauth/google axios
```

### Install from GitHub

This is a private repository. You can install the package directly from GitHub using npm or yarn.

#### Install from Main Branch

```bash
npm install git+https://github.com/Volenday/lumora-login-component.git
```

or with yarn:

```bash
yarn add git+https://github.com/Volenday/lumora-login-component.git
```

#### Install from Specific Branch

```bash
npm install git+https://github.com/Volenday/lumora-login-component.git#branch-name
```

#### Install from Specific Commit

```bash
npm install git+https://github.com/Volenday/lumora-login-component.git#commit-hash
```

### GitHub Authentication

Since this is a private repository, you'll need to authenticate with GitHub:

#### Option 1: Personal Access Token (Recommended)

1. Create a Personal Access Token at [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Select the `repo` scope for full repository access
3. Use the token in your installation command:

```bash
npm install git+https://YOUR_TOKEN@github.com/Volenday/lumora-login-component.git
```

#### Option 2: SSH Key Authentication

If you have SSH keys set up with GitHub:

```bash
npm install git+ssh://git@github.com/Volenday/lumora-login-component.git
```

#### Option 3: Configure Git Credentials

You can also configure Git to use your credentials:

```bash
git config --global credential.helper store
```

Then when prompted during installation, enter your GitHub username and Personal Access Token.

> **Note**: For private repositories, you must have access to the repository. Contact the repository administrators if you need access.

> **Note for Developers**: Make sure to run `npm run build` before pushing changes to ensure the latest compiled code is available for installation.

### Package Information

-   **Package Name**: `@volenday/lumora-login-component`
-   **Version**: 1.0.4
-   **License**: MIT
-   **Repository**: [GitHub Repository](https://github.com/Volenday/lumora-login-component)

### CDN Usage

You can also use the component via CDN:

```html
<!-- UMD build -->
<script src="https://unpkg.com/@volenday/lumora-login-component@1.0.2/dist/lumora-login.umd.js"></script>

<!-- ES Module build -->
<script type="module">
	import { LumoraLogin } from 'https://unpkg.com/@volenday/lumora-login-component@1.0.2/dist/lumora-login.mjs';
</script>
```

## Usage

```tsx
import { LumoraLogin } from '@volenday/lumora-login-component';

const LoginPage = () => (
	<LumoraLogin
		authConfig={{
			apiBaseUrl: 'https://dev.api.lumora.capital',
			apiKey: 'your-api-key'
		}}
		onLoginSuccess={({ user, tokens }) => {
			console.log('Signed in:', user);
			window.location.href = '/dashboard';
		}}
		onLoginError={error => console.error('Sign-in failed:', error)}
		enableGoogleSignIn={true}
		enableMicrosoftSignIn={true}
		enableMagicLinkSignIn={true}
		enablePasskeySignIn={true}
	/>
);
```

Tokens are stored in localStorage automatically, and the user profile is fetched from `GET /users/me`.

### Callback Page

Google, Microsoft and magic link sign-in all return to `{window.location.origin}/callback`. Render a page there that uses `useAuthCallback`:

```tsx
import { useAuthCallback } from '@volenday/lumora-login-component';

const CallbackPage = () => {
	const { loading, error } = useAuthCallback({
		apiBaseUrl: 'https://dev.api.lumora.capital',
		apiKey: 'your-api-key',
		redirectPath: '/dashboard',
		onSuccess: (tokens, user) => console.log('Signed in:', user),
		onError: error => console.error(error)
	});

	if (loading) return <p>Signing you in...</p>;
	if (error) return <p>{error.message}</p>;
	return null;
};
```

The hook reads `access_token` / `refresh_token` (OAuth) or exchanges a `magic_token` (magic link) for tokens, stores them, and removes them from the address bar.

## Sign-in Methods

Google is enabled by default; the other methods are opt-in. At least one method must be enabled, or the component throws an error.

-   **Google / Microsoft**: the browser is redirected to `GET {apiBaseUrl}/auth/google` or `/auth/microsoft` with `redirect_uri={origin}/callback&prompt=select_account`. The API redirects back to `/callback` with tokens.
-   **Magic link**: the user enters their email and the component calls `POST /auth/magic-link` with `{ email, redirectUri }`. The emailed link points to `{redirectUri}?magic_token=...`, and `useAuthCallback` exchanges it via `POST /auth/magic-link/verify`.
-   **Passkey**: calls `POST /auth/passkey/login/options`, shows the browser passkey prompt, then `POST /auth/passkey/login/verify`. No email is needed (discoverable credentials). The button only appears when the browser supports WebAuthn.

### Registering Passkeys

Users need to register a passkey while signed in, for example from an account security page:

```tsx
import { usePasskeyRegistration } from '@volenday/lumora-login-component';

const AccountSecurity = () => {
	const { registerPasskey, loading, error, isSupported } = usePasskeyRegistration({
		apiBaseUrl: 'https://dev.api.lumora.capital'
	});

	if (!isSupported) return null;

	return (
		<>
			{error && <Alert severity="error">{error.message}</Alert>}
			<Button onClick={() => registerPasskey('My laptop')} disabled={loading}>
				Add a passkey
			</Button>
		</>
	);
};
```

### Logout

```tsx
import { useLogout } from '@volenday/lumora-login-component';

const { logout } = useLogout({ apiBaseUrl: 'https://dev.api.lumora.capital' });
```

## reCAPTCHA Integration

When enabled, a reCAPTCHA Enterprise token is requested before a magic link is sent.

```tsx
<LumoraLogin
	enableRecaptcha={true}
	recaptchaSiteKey="your-recaptcha-site-key"
	// ... other props
/>
```

`recaptchaSiteKey` is required when `enableRecaptcha` is `true`. Get a key from the [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin).

## Props

| Prop                    | Type                                                                  | Required | Default | Description                                         |
| ----------------------- | --------------------------------------------------------------------- | -------- | ------- | --------------------------------------------------- |
| `authConfig`            | `LumoraAuthConfig`                                                    | ✅       | -       | API configuration                                   |
| `authConfig.apiBaseUrl` | `string`                                                              | ✅       | -       | Base URL for Lumora API                             |
| `authConfig.apiKey`     | `string`                                                              | ❌       | -       | API key sent as `X-API-Key`                         |
| `onLoginSuccess`        | `(response: { user: LumoraUser; tokens: LumoraAuthTokens }) => void` | ✅       | -       | Called after a successful passkey sign-in           |
| `onLoginError`          | `(error: Error) => void`                                              | ✅       | -       | Called when any sign-in attempt fails               |
| `enableGoogleSignIn`    | `boolean`                                                             | ❌       | `true`  | Show "Continue with Google"                         |
| `enableMicrosoftSignIn` | `boolean`                                                             | ❌       | `false` | Show "Continue with Microsoft"                      |
| `enableMagicLinkSignIn` | `boolean`                                                             | ❌       | `false` | Show "Email me a sign-in link"                      |
| `enablePasskeySignIn`   | `boolean`                                                             | ❌       | `false` | Show "Sign in with a passkey"                       |
| `enableRecaptcha`       | `boolean`                                                             | ❌       | `false` | Verify reCAPTCHA before sending magic links         |
| `recaptchaSiteKey`      | `string`                                                              | ❌       | -       | reCAPTCHA site key (required with reCAPTCHA)        |
| `branding`              | `BrandingConfig`                                                      | ❌       | -       | Logo, colors and copy                               |

OAuth and magic link sign-ins finish on the callback page, so handle their success in `useAuthCallback`.

## TypeScript Interfaces

```typescript
interface LumoraAuthConfig {
	apiBaseUrl: string;
	apiKey?: string;
}

interface LumoraAuthTokens {
	accessToken: string;
	refreshToken: string;
}

interface LumoraUser {
	id: string;
	email: string;
	name?: string;
	profilePicture?: string;
	role?: string;
}

interface PasskeyInfo {
	id: string;
	name?: string;
	createdAt?: string;
}

interface ErrorState {
	message: string;
	type: 'google' | 'microsoft' | 'magic-link' | 'passkey' | 'network' | 'recaptcha';
}

type LoginState =
	| 'idle' // Sign-in options displayed
	| 'google-loading' // Redirecting to Google
	| 'microsoft-loading' // Redirecting to Microsoft
	| 'passkey-loading' // Passkey prompt in progress
	| 'success' // Authentication successful
	| 'error' // Authentication failed
	| 'magic-link' // Magic link form displayed
	| 'magic-link-loading' // Magic link request in progress
	| 'magic-link-success'; // Magic link email sent
```

## Branding Configuration

```tsx
interface BrandingConfig {
	logo?: string | React.ReactNode; // Company logo (URL or React component)
	logoHeight?: number; // Logo height in pixels (default: 48)
	primaryColor?: string; // Primary color for buttons and accents
	secondaryColor?: string; // Secondary color for hover states
	backgroundColor?: string; // Background color of the component
	textColor?: string; // Text color throughout the component
	companyName?: string; // Company name displayed in header
	tagline?: string; // Optional tagline below company name
	magicLinkTitle?: string; // Magic link form title
	magicLinkDescription?: string; // Magic link form description
	magicLinkSuccessTitle?: string; // "Check your inbox" title
	magicLinkSuccessDescription?: string; // "Check your inbox" description
}
```

```tsx
<LumoraLogin
	// ... other props
	branding={{
		companyName: 'My Company',
		tagline: 'Welcome to our platform',
		logo: 'https://example.com/logo.png',
		logoHeight: 60,
		primaryColor: '#ff6b35',
		secondaryColor: '#f7931e'
	}}
/>
```

## Interactive Demo

```bash
npm install
npm run dev
```

Open `http://localhost:3001`. The demo lets you toggle each sign-in method, adjust branding, and register a passkey after signing in. It reads `VITE_API_URL` and `VITE_API_KEY` from `.env`.

## Development

-   `npm run dev`: start the demo
-   `npm run build`: build the library into `dist/`
-   `npm run type-check`: TypeScript check
-   `npm test`: run the Jest suite

## Changelog

### Unreleased

-   **BREAKING**: Removed email/password sign-in (`enableLocalSignIn`, `LoginFormData`, `POST /auth/login`)
-   **BREAKING**: Removed forget password (`enableForgetPassword` and the `forgetPassword*` branding fields)
-   **NEW**: Microsoft OAuth sign-in (`enableMicrosoftSignIn`)
-   **NEW**: Magic link sign-in (`enableMagicLinkSignIn`), exchanged in `useAuthCallback`
-   **NEW**: Passkey sign-in (`enablePasskeySignIn`) and `usePasskeyRegistration` hook
-   **FIXED**: `useAuthCallback` now initializes the API client from `apiBaseUrl`

### v1.1.0

-   **NEW**: API integration mode with direct Lumora API support
-   **NEW**: Google OAuth redirect flow using Lumora's /auth/google endpoint
-   **NEW**: Automatic token refresh with Axios interceptors
-   **NEW**: localStorage-based token management
-   **NEW**: useAuthCallback hook for OAuth callback handling
-   **NEW**: useLogout hook for programmatic logout with API integration
-   **NEW**: authConfig prop for comprehensive API configuration
-   **IMPROVED**: Backward compatibility maintained with legacy callback props
-   **IMPROVED**: Dual-mode architecture (API vs Legacy)
-   **IMPROVED**: Enhanced documentation with API integration examples
-   **IMPROVED**: Better error handling and user feedback

### v1.0.3

-   **NEW**: Added forget password functionality with email verification
-   **NEW**: Added forget password form with validation and success screens
-   **NEW**: Added `onForgetPassword` callback prop for handling password reset requests
-   **NEW**: Added `enableForgetPassword` prop to control forget password feature
-   **NEW**: Added comprehensive forget password tests
-   **NEW**: Updated demo app to showcase forget password functionality
-   **IMPROVED**: Enhanced error handling with forget password error types
-   **IMPROVED**: Updated TypeScript interfaces to include forget password types
-   **IMPROVED**: Enhanced documentation with forget password usage examples

### v1.0.2

-   Enhanced Google OAuth integration with proper response handling
-   Added comprehensive TypeScript interfaces
-   Improved error handling and state management
-   Added interactive demo with live configuration
-   Enhanced branding customization options
-   Updated dependencies to latest versions

### v1.0.1

-   Initial release with basic authentication features
-   Google OAuth integration
-   Responsive design implementation

## License

MIT
