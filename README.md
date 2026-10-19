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

Tokens are stored in localStorage automatically, and the user profile comes from the sign-in response (fetched from `GET /auth/me` when it is missing).

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
| `onLoginSuccess`        | `(response: { user: LumoraUser; tokens: LumoraAuthTokens; platform: PlatformId }) => void` | ✅       | -       | Called after a successful passkey sign-in           |
| `onLoginError`          | `(error: Error) => void`                                              | ✅       | -       | Called when any sign-in attempt fails               |
| `enableGoogleSignIn`    | `boolean`                                                             | ❌       | `true`  | Show "Continue with Google"                         |
| `enableMicrosoftSignIn` | `boolean`                                                             | ❌       | `false` | Show "Continue with Microsoft"                      |
| `enableMagicLinkSignIn` | `boolean`                                                             | ❌       | `false` | Show the work email field and "Magic Link" button   |
| `enablePasskeySignIn`   | `boolean`                                                             | ❌       | `false` | Show "Sign in with passkey"                         |
| `showErrors`            | `boolean`                                                             | ❌       | `true`  | Draw errors in the card; `false` when the host shows `onLoginError` itself |
| `enableRecaptcha`       | `boolean`                                                             | ❌       | `false` | Verify reCAPTCHA before sending magic links         |
| `recaptchaSiteKey`      | `string`                                                              | ❌       | -       | reCAPTCHA site key (required with reCAPTCHA)        |
| `showPlatformSelector`  | `boolean`                                                             | ❌       | `false` | Show the "Where would you like to start?" selector. Off: the page is always Centra and the platform props below are ignored |
| `defaultPlatform`       | `PlatformId`                                                          | ❌       | last choice, else `'centra'` | Platform selected on load (`'centra'`, `'xpdite'`, `'polymer'`) |
| `showOverview`          | `boolean`                                                             | ❌       | `false` | Open on the ecosystem overview with no platform selected; clicking the selected platform returns to it |
| `onPlatformChange`      | `(platform: PlatformId) => void`                                      | ❌       | -       | Called when the user picks another platform         |
| `platformAssets`        | `Partial<Record<PlatformId, PlatformAssets>>`                         | ❌       | -       | Replace the built-in logos and dashboards                       |
| `defaultColorMode`      | `'light' \| 'dark'`                                                   | ❌       | system  | Mode for users who have not used the toggle; leave unset to follow the operating system |
| `onColorModeChange`     | `(mode: ColorMode) => void`                                           | ❌       | -       | Called when the user flips the light / dark toggle  |
| `branding`              | `BrandingConfig`                                                      | ❌       | -       | Logo, colors and copy                               |

OAuth and magic link sign-ins finish on the callback page, so handle their success in `useAuthCallback`. Its `onSuccess(tokens, user, platform)` receives the platform chosen before the redirect (also readable with `PlatformStorage.get()`).

## Layout and Platforms

The platform selector is hidden for now: without `showPlatformSelector` the page always opens on Centra, and `defaultPlatform`, `showOverview` and the user's last choice are ignored. The rest of this section describes the page with `showPlatformSelector` on.

`LumoraLogin` renders a full-page split layout: the sign-in panel on the left and a hero on the right (hidden below the `md` breakpoint). A platform is always selected under "Where would you like to start?" (the host's `defaultPlatform`, else the user's last choice, else Centra), so every sign-in knows where to land; choosing the selected one again keeps it. The hero shows that platform's colours, headline and screenshot, and the accent colour of the sign-in panel follows.

Set `showOverview` to open on the ecosystem overview hero instead ("One sign-in. Every platform.", with the three windows from `overviewScreenshot` stacked), with no platform selected. `defaultPlatform` and the user's last choice are then ignored. Picking a platform shows its hero, and clicking it again returns to the overview. A sign-in made from the overview lands in Centra. In the demo, open `?overview=1`.

Each platform's dashboard ships with the package and needs no setup. It is a separate chunk, fetched only when that platform is selected; the hero draws a placeholder window until it arrives. Use `platformAssets` only to replace the built-in art:

```tsx
<LumoraLogin
	// ... other props
	platformAssets={{
		centra: {
			screenshot: '/my-centra-dashboard.svg',
			overviewScreenshot: '/platform-dashboards/uncut/centra-uncut.svg'
		}
	}}
/>
```

-   `screenshot`: replaces the built-in dashboard shown when that platform is selected. It is drawn as is (the artwork includes its own window), pinned top-left and cropped by the hero.
-   `overviewScreenshot`: the whole window for the overview, shadow included. The three must share one design: 872px wide with a 57px shadow margin, cut at the bottom 72px apart (Polymer tallest, Centra shortest), so they step down once their bottoms line up. The overview uses them only when all three are set, and otherwise stacks the cropped dashboards. They are not part of the package: serve them from the app (its `public/` folder or a CDN).
-   `screenshotDark` / `overviewScreenshotDark`: the same art for dark mode, shown while the page is dark. Without one, dark mode shows the light art. The built-in dashboards have dark versions, generated from the light ones by `node scripts/dark-dashboards.mjs` (rerun it after changing a light dashboard).
-   `logo`: replaces the built-in mark in the selector and the overview chips.

First-time visitors get their operating system's light or dark mode, and the page follows it if it changes. Once someone uses the toggle, their choice is saved (`ColorModeStorage`) and wins on every later visit. `defaultColorMode` replaces the system setting only for users who have not chosen.

Platform copy and colours live in `src/lib/platforms.ts`. The component does not load fonts: load Montserrat (500, 600, 700) and Source Sans 3 (400, 500, 600, 700) on the host page (see `index.html`), or set `headingFontFamily` / `bodyFontFamily`.

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
	backgroundColor?: string; // Sign-in panel background (light mode)
	textColor?: string; // Heading color (light mode)
	buttonTextColor?: string; // Text on filled buttons, drawn in primaryColor (default: '#ffffff')
	headingFontFamily?: string; // Default: Montserrat
	bodyFontFamily?: string; // Default: Source Sans 3
	companyName?: string; // Wordmark shown when no logo is set (default: 'Lumora Capital')
	welcomeTitle?: string; // Lead words of the title (default: 'Welcome to')
	welcomeTitleAccent?: string; // Rest of the title, in its own colour (default: 'Lumora.')
	welcomeTitleColor?: string; // Lead words colour, light mode (default: '#072d29')
	welcomeTitleAccentColor?: string; // Accent colour, light mode (default: '#049586')
	tagline?: string; // Line below the welcome title
	firstTimeTitle?: string; // Default: 'First time here?'
	firstTimeSteps?: string[]; // Numbered steps; [] hides the card
	securityNote?: string; // Footer line with the lock icon
	supportLabel?: string; // Text after "Need access?" (default: 'contact@lumora.capital')
	supportUrl?: string; // Link for supportLabel (default: 'mailto:contact@lumora.capital'); plain text when empty
	copyright?: string; // Text before the holder (default: '© <year>')
	copyrightHolder?: string; // Default: 'Lumora Capital Solutions'
	copyrightUrl?: string; // Link on the holder only, opened in a new tab (default: 'https://lumora.capital/')
	magicLinkSuccessTitle?: string; // "Check your inbox" title
	magicLinkSuccessDescription?: string; // "Check your inbox" description (default does not promise an email: only active accounts get one)
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

Open `http://localhost:3001`. The settings button (bottom right) lets you toggle each sign-in method, adjust branding, and register a passkey after signing in. `?platform=xpdite` and `?mode=dark` open the page in that state. It reads `VITE_API_URL` and `VITE_API_KEY` from `.env`.

## Development

-   `npm run dev`: start the demo
-   `npm run build`: build the library into `dist/`
-   `npm run type-check`: TypeScript check
-   `npm test`: run the Jest suite

## Changelog

### Unreleased

-   **BREAKING**: New full-page split layout (sign-in panel + platform hero) replaces the centred card
-   **BREAKING**: Magic link is an inline work email field; the separate form screen, the `'magic-link'` login state and the `magicLinkTitle` / `magicLinkDescription` branding fields are removed
-   **BREAKING**: Default branding is now the Lumora palette (`primaryColor` `#4a9d8a`, `companyName` `'Lumora Capital'`) and no placeholder logo
-   **NEW**: "Where would you like to start?" platform selector (`defaultPlatform`, `onPlatformChange`, `platformAssets`); a platform is always selected (Centra by default), and `onLoginSuccess` and `useAuthCallback` report it
-   **NEW**: Platform dashboards ship with the package, each loaded only when its platform is selected; `platformAssets` is now only needed to replace them
-   **NEW**: Light / dark toggle (`defaultColorMode`, `onColorModeChange`): follows the system setting until the user chooses, then remembers the choice
-   **NEW**: "First time here?" card and footer (security note, IT support link, copyright), all set through `branding`
-   **FIXED**: A failed sign-in (unknown passkey, used magic link) no longer reloads the page: 401s from sign-in endpoints skip the refresh-and-redirect meant for expired sessions
-   **NEW**: `showErrors={false}` hides the card's error alert and "Try Again" for hosts that show `onLoginError` themselves
-   **NEW**: `branding.buttonTextColor` (default white) for text on filled buttons, which previously took the host theme's contrast colour

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
