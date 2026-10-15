import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LumoraLogin from '../LumoraLogin';
import { LumoraLoginProps } from '../../types';
import { authService } from '../../services/authService';

// Mock @simplewebauthn/browser (jsdom has no WebAuthn support)
jest.mock('@simplewebauthn/browser', () => ({
	browserSupportsWebAuthn: () => true,
	startAuthentication: jest.fn(),
	startRegistration: jest.fn()
}));

// Create a test theme
const testTheme = createTheme();

// Frontend route that OAuth and magic link flows return to
const CALLBACK_URI = `${window.location.origin}/callback`;

// Mock props for testing
const createMockProps = (
	overrides: Partial<LumoraLoginProps> = {}
): LumoraLoginProps => ({
	authConfig: {
		apiBaseUrl: 'https://test-api.lumora.capital',
		apiKey: 'test-api-key'
	},
	onLoginSuccess: jest.fn(),
	onLoginError: jest.fn(),
	...overrides
});

// Helper function to render component with theme
const renderWithTheme = (props: LumoraLoginProps) => {
	return render(
		<ThemeProvider theme={testTheme}>
			<LumoraLogin {...props} />
		</ThemeProvider>
	);
};

// Helper to trigger a sign-in error through the passkey flow
const triggerPasskeyError = async (user: ReturnType<typeof userEvent.setup>) => {
	jest.spyOn(authService, 'loginWithPasskey').mockRejectedValue(
		new Error('Passkey request was cancelled or timed out')
	);
	await user.click(
		screen.getByRole('button', { name: 'Sign in with passkey' })
	);
	await waitFor(() => {
		expect(
			screen.getByText('Passkey request was cancelled or timed out')
		).toBeInTheDocument();
	});
};

describe('LumoraLogin Component', () => {
	afterEach(() => {
		jest.restoreAllMocks();
		// The chosen platform and colour mode are remembered between renders
		localStorage.clear();
	});

	describe('Basic Rendering', () => {
		it('should render the company name, welcome title and tagline', () => {
			renderWithTheme(
				createMockProps({
					branding: {
						companyName: 'Test Company',
						welcomeTitle: 'Welcome aboard',
						welcomeTitleAccent: 'Test.',
						tagline: 'Welcome to our platform'
					}
				})
			);

			// The built-in logo is named after the company
			expect(screen.getByRole('img', { name: 'Test Company' })).toBeInTheDocument();
			expect(
				screen.getByRole('heading', { name: 'Welcome aboard Test.' })
			).toBeInTheDocument();
			expect(
				screen.getByText('Welcome to our platform')
			).toBeInTheDocument();
		});

		it('should not render any email/password fields', () => {
			renderWithTheme(createMockProps());

			expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: 'Sign In' })
			).not.toBeInTheDocument();
		});

		it('should render only Google sign-in by default', () => {
			renderWithTheme(createMockProps());

			expect(
				screen.getByRole('button', { name: 'Continue with Google' })
			).toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: 'Continue with Microsoft' })
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: 'Magic Link' })
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: 'Sign in with passkey' })
			).not.toBeInTheDocument();
			// No divider when there is nothing below it
			expect(screen.queryByText('or use your work email')).not.toBeInTheDocument();
		});

		it('should show and link the contact@lumora.capital address by default', () => {
			renderWithTheme(createMockProps());

			expect(screen.getByRole('link', { name: 'contact@lumora.capital' })).toHaveAttribute(
				'href',
				'mailto:contact@lumora.capital'
			);
		});

		it('should render the first-time steps and footer', () => {
			renderWithTheme(createMockProps({ branding: { supportUrl: 'mailto:it@example.com' } }));

			expect(screen.getByRole('heading', { name: 'First time here?' })).toBeInTheDocument();
			expect(screen.getAllByRole('listitem')).toHaveLength(3);
			expect(
				screen.getByText('Authorised users only. Sign-ins are logged.')
			).toBeInTheDocument();
			expect(screen.getByRole('link', { name: 'contact@lumora.capital' })).toHaveAttribute(
				'href',
				'mailto:it@example.com'
			);
			// Only the holder is linked, not the "©" and year
			expect(
				screen.getByRole('link', { name: 'Lumora Capital Solutions' })
			).toHaveAttribute('href', 'https://lumora.capital/');
			expect(
				screen.getByText(`© ${new Date().getFullYear()}`, { exact: false })
			).toBeInTheDocument();
		});

		it('should throw error when all sign-in methods are disabled', () => {
			// Suppress console.error for this test
			jest.spyOn(console, 'error').mockImplementation(() => {});

			expect(() =>
				renderWithTheme(createMockProps({ enableGoogleSignIn: false }))
			).toThrow(
				'At least one sign-in method must be enabled (enableGoogleSignIn, enableMicrosoftSignIn, enableMagicLinkSignIn or enablePasskeySignIn)'
			);
		});
	});

	describe('OAuth Sign-In', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it.each([
			['Google', '/auth/google'],
			['Microsoft', '/auth/microsoft']
		])('should redirect to the %s OAuth endpoint', async (provider, endpoint) => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			const oauthSpy = jest
				.spyOn(authService, 'initiateOAuth')
				.mockImplementation(() => {});
			renderWithTheme(createMockProps({ enableMicrosoftSignIn: true }));

			await user.click(
				screen.getByRole('button', { name: `Continue with ${provider}` })
			);

			// Loading state is shown before the redirect
			expect(screen.getByText('Signing in...')).toBeInTheDocument();

			jest.advanceTimersByTime(300);
			expect(oauthSpy).toHaveBeenCalledWith(
				endpoint,
				CALLBACK_URI,
				'https://test-api.lumora.capital'
			);
		});

		it('should reset the button when the user comes back from the provider', async () => {
			const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
			jest.spyOn(authService, 'initiateOAuth').mockImplementation(() => {});
			renderWithTheme(createMockProps());

			await user.click(screen.getByRole('button', { name: 'Continue with Google' }));
			jest.advanceTimersByTime(300);
			expect(screen.getByText('Signing in...')).toBeInTheDocument();

			// Back button: the page is restored from the back-forward cache
			const pageShow = new Event('pageshow');
			Object.defineProperty(pageShow, 'persisted', { value: true });
			act(() => {
				window.dispatchEvent(pageShow);
			});

			expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeEnabled();
		});
	});

	describe('Magic Link Sign-In', () => {
		it('should request a magic link and show the confirmation screen', async () => {
			const user = userEvent.setup();
			const magicLinkSpy = jest
				.spyOn(authService, 'requestMagicLink')
				.mockResolvedValue();
			renderWithTheme(createMockProps({ enableMagicLinkSignIn: true }));

			await user.type(
				screen.getByLabelText('Work email'),
				'test@example.com'
			);
			await user.click(screen.getByRole('button', { name: 'Magic Link' }));

			await waitFor(() => {
				expect(magicLinkSpy).toHaveBeenCalledWith(
					'test@example.com',
					CALLBACK_URI
				);
				expect(screen.getByText('Check your inbox')).toBeInTheDocument();
			});
		});

		it('should validate the email before sending', async () => {
			const user = userEvent.setup();
			const magicLinkSpy = jest.spyOn(authService, 'requestMagicLink');
			renderWithTheme(createMockProps({ enableMagicLinkSignIn: true }));

			await user.click(screen.getByRole('button', { name: 'Magic Link' }));

			await waitFor(() => {
				expect(screen.getByText('Email is required')).toBeInTheDocument();
			});
			expect(magicLinkSpy).not.toHaveBeenCalled();
		});

		it('should show an error when the request fails', async () => {
			const user = userEvent.setup();
			jest.spyOn(authService, 'requestMagicLink').mockRejectedValue(
				new Error('Failed to send sign-in link')
			);
			const props = createMockProps({ enableMagicLinkSignIn: true });
			renderWithTheme(props);

			await user.type(
				screen.getByLabelText('Work email'),
				'test@example.com'
			);
			await user.click(screen.getByRole('button', { name: 'Magic Link' }));

			await waitFor(() => {
				expect(
					screen.getByText('Failed to send sign-in link')
				).toBeInTheDocument();
			});
			expect(props.onLoginError).toHaveBeenCalled();
		});

		it('should go back to the sign-in options from the confirmation', async () => {
			const user = userEvent.setup();
			jest.spyOn(authService, 'requestMagicLink').mockResolvedValue();
			renderWithTheme(createMockProps({ enableMagicLinkSignIn: true }));

			await user.type(screen.getByLabelText('Work email'), 'test@example.com');
			await user.click(screen.getByRole('button', { name: 'Magic Link' }));
			await user.click(
				await screen.findByRole('button', { name: 'Back to sign in' })
			);

			expect(screen.getByRole('button', { name: 'Magic Link' })).toBeInTheDocument();
		});
	});

	describe('Passkey Sign-In', () => {
		it('should sign in with a passkey using the user the API returned', async () => {
			const user = userEvent.setup();
			const tokens = { accessToken: 'access', refreshToken: 'refresh' };
			const mockUser = { id: '1', email: 'test@example.com' };
			jest.spyOn(authService, 'loginWithPasskey').mockResolvedValue({ tokens, user: mockUser });
			const getCurrentUser = jest.spyOn(authService, 'getCurrentUser');
			const props = createMockProps({ enablePasskeySignIn: true });
			renderWithTheme(props);

			await user.click(
				screen.getByRole('button', { name: 'Sign in with passkey' })
			);

			await waitFor(() => {
				expect(props.onLoginSuccess).toHaveBeenCalledWith({
					user: mockUser,
					tokens,
					platform: 'centra'
				});
			});
			expect(getCurrentUser).not.toHaveBeenCalled();
		});

		it('should fetch the profile when the passkey response names no user', async () => {
			const user = userEvent.setup();
			const tokens = { accessToken: 'access', refreshToken: 'refresh' };
			const mockUser = { id: '1', email: 'test@example.com' };
			jest.spyOn(authService, 'loginWithPasskey').mockResolvedValue({ tokens });
			jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(mockUser);
			const props = createMockProps({ enablePasskeySignIn: true });
			renderWithTheme(props);

			await user.click(
				screen.getByRole('button', { name: 'Sign in with passkey' })
			);

			await waitFor(() => {
				expect(props.onLoginSuccess).toHaveBeenCalledWith({
					user: mockUser,
					tokens,
					platform: 'centra'
				});
			});
		});

		it('should show an error when passkey sign-in fails', async () => {
			const user = userEvent.setup();
			const props = createMockProps({ enablePasskeySignIn: true });
			renderWithTheme(props);

			await triggerPasskeyError(user);

			expect(props.onLoginError).toHaveBeenCalled();
		});

		it('leaves the error to the host when showErrors is false', async () => {
			const user = userEvent.setup();
			jest.spyOn(authService, 'loginWithPasskey').mockRejectedValue(
				new Error('Passkey request was cancelled or timed out')
			);
			const props = createMockProps({ enablePasskeySignIn: true, showErrors: false });
			renderWithTheme(props);

			await user.click(
				screen.getByRole('button', { name: 'Sign in with passkey' })
			);

			await waitFor(() => {
				expect(props.onLoginError).toHaveBeenCalledWith(
					expect.objectContaining({ message: 'Passkey request was cancelled or timed out' })
				);
			});
			expect(screen.queryByRole('alert')).not.toBeInTheDocument();
			expect(screen.queryByRole('button', { name: 'Try Again' })).not.toBeInTheDocument();
			// The sign-in options stay usable
			expect(screen.getByRole('button', { name: 'Sign in with passkey' })).toBeEnabled();
		});
	});

	describe('Platform Selection', () => {
		it('should start on Centra and switch the hero when another platform is chosen', async () => {
			const user = userEvent.setup();
			const onPlatformChange = jest.fn();
			renderWithTheme(createMockProps({ onPlatformChange }));

			// Centra is selected on a first visit, and stored for the callback page
			expect(screen.getByRole('button', { name: 'Centra' })).toHaveAttribute(
				'aria-pressed',
				'true'
			);
			expect(localStorage.getItem('lumora_platform')).toBe('centra');

			await user.click(screen.getByRole('button', { name: 'XPdite' }));

			expect(onPlatformChange).toHaveBeenCalledWith('xpdite');
			expect(screen.getByRole('button', { name: 'XPdite' })).toHaveAttribute(
				'aria-pressed',
				'true'
			);
			expect(
				screen.getAllByRole('complementary', { name: 'XPdite overview' })
			).toHaveLength(2);
			expect(
				screen.getAllByRole('heading', { name: 'Creating value through insight' })
			).toHaveLength(2);
		});

		it('should keep the platform when the selected one is clicked again', async () => {
			const user = userEvent.setup();
			const onPlatformChange = jest.fn();
			renderWithTheme(createMockProps({ onPlatformChange }));

			await user.click(screen.getByRole('button', { name: 'Centra' }));

			expect(onPlatformChange).not.toHaveBeenCalled();
			expect(screen.getByRole('button', { name: 'Centra' })).toHaveAttribute(
				'aria-pressed',
				'true'
			);
		});

		it("should start on the user's last platform over Centra", () => {
			localStorage.setItem('lumora_platform', 'polymer');
			renderWithTheme(createMockProps());

			expect(screen.getByRole('button', { name: 'Polymer' })).toHaveAttribute(
				'aria-pressed',
				'true'
			);
		});

		it('should remember the platform for the callback page and pass it on sign-in', async () => {
			const user = userEvent.setup();
			const tokens = { accessToken: 'access', refreshToken: 'refresh' };
			const mockUser = { id: '1', email: 'test@example.com' };
			jest.spyOn(authService, 'loginWithPasskey').mockResolvedValue({ tokens, user: mockUser });
			const props = createMockProps({ enablePasskeySignIn: true });
			renderWithTheme(props);

			await user.click(screen.getByRole('button', { name: 'Polymer' }));
			expect(localStorage.getItem('lumora_platform')).toBe('polymer');

			await user.click(screen.getByRole('button', { name: 'Sign in with passkey' }));

			await waitFor(() => {
				expect(props.onLoginSuccess).toHaveBeenCalledWith({
					user: mockUser,
					tokens,
					platform: 'polymer'
				});
			});
		});

		it('should draw a supplied screenshot instead of the placeholder', () => {
			renderWithTheme(
				createMockProps({
					defaultPlatform: 'centra',
					platformAssets: { centra: { screenshot: 'https://example.com/centra.png' } }
				})
			);

			// Desktop hero and phone banner both show it
			const images = screen.getAllByAltText('Centra dashboard');
			expect(images).toHaveLength(2);
			images.forEach(image =>
				expect(image).toHaveAttribute('src', 'https://example.com/centra.png')
			);
			expect(screen.queryByTestId('screenshot-placeholder')).not.toBeInTheDocument();
		});
	});

	describe('Color Mode', () => {
		// Pretend the operating system prefers dark (or light) mode
		const mockSystemColorMode = (mode: 'light' | 'dark') => {
			const listeners: ((event: { matches: boolean }) => void)[] = [];
			Object.defineProperty(window, 'matchMedia', {
				configurable: true,
				writable: true,
				value: jest.fn().mockImplementation((query: string) => ({
					matches: mode === 'dark' && query === '(prefers-color-scheme: dark)',
					media: query,
					addEventListener: (_: string, listener: (event: { matches: boolean }) => void) =>
						listeners.push(listener),
					removeEventListener: jest.fn()
				}))
			});
			// Simulates the system switching modes while the page is open
			return (matches: boolean) => listeners.forEach(listener => listener({ matches }));
		};

		afterEach(() => {
			delete (window as unknown as { matchMedia?: unknown }).matchMedia;
		});

		it('should switch colours at once, with no colour fade, when the mode flips', async () => {
			const user = userEvent.setup();
			const { container } = renderWithTheme(createMockProps({ defaultColorMode: 'light' }));
			const page = () => container.querySelector('[data-mode-switching]');
			expect(page()).toBeNull();

			await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));

			// Marked in the same render as the new colours, which turns their transitions off
			expect(page()).not.toBeNull();
			await waitFor(() => expect(page()).toBeNull());
		});

		it('should follow the system setting for first-time visitors', () => {
			mockSystemColorMode('dark');
			renderWithTheme(createMockProps());

			expect(
				screen.getByRole('button', { name: 'Switch to light mode' })
			).toBeInTheDocument();
		});

		it('should follow the system when it changes while the page is open', () => {
			const setSystemDark = mockSystemColorMode('light');
			renderWithTheme(createMockProps());

			act(() => setSystemDark(true));

			expect(
				screen.getByRole('button', { name: 'Switch to light mode' })
			).toBeInTheDocument();
		});

		it('should remember the toggled mode over the system setting', async () => {
			const user = userEvent.setup();
			mockSystemColorMode('light');
			const onColorModeChange = jest.fn();
			const { unmount } = renderWithTheme(createMockProps({ onColorModeChange }));

			await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));

			expect(onColorModeChange).toHaveBeenCalledWith('dark');
			expect(localStorage.getItem('lumora_color_mode')).toBe('dark');

			// A later visit opens in the chosen mode, even with a light system and host default
			unmount();
			renderWithTheme(createMockProps({ defaultColorMode: 'light' }));
			expect(
				screen.getByRole('button', { name: 'Switch to light mode' })
			).toBeInTheDocument();
		});

		it('should use the host default over the system for users who have not chosen', () => {
			mockSystemColorMode('dark');
			renderWithTheme(createMockProps({ defaultColorMode: 'light' }));

			expect(
				screen.getByRole('button', { name: 'Switch to dark mode' })
			).toBeInTheDocument();
		});
	});

	describe('Error Handling', () => {
		it('should close error alert when close button is clicked', async () => {
			const user = userEvent.setup();
			renderWithTheme(createMockProps({ enablePasskeySignIn: true }));

			await triggerPasskeyError(user);
			await user.click(screen.getByRole('button', { name: 'Close' }));

			await waitFor(() => {
				expect(
					screen.queryByText('Passkey request was cancelled or timed out')
				).not.toBeInTheDocument();
			});
		});

		it('should show try again button when there is an error', async () => {
			const user = userEvent.setup();
			renderWithTheme(createMockProps({ enablePasskeySignIn: true }));

			await triggerPasskeyError(user);

			expect(
				screen.getByRole('button', { name: 'Try Again' })
			).toBeInTheDocument();
		});
	});

	describe('Custom Branding', () => {
		it('should render custom logo when provided as string', () => {
			renderWithTheme(
				createMockProps({
					branding: {
						logo: 'https://example.com/logo.png',
						logoHeight: 60
					}
				})
			);

			expect(screen.getByAltText('Lumora Capital')).toHaveAttribute(
				'src',
				'https://example.com/logo.png'
			);
		});

		it('should render custom logo when provided as React node', () => {
			renderWithTheme(
				createMockProps({
					branding: {
						logo: <div data-testid="custom-logo">Custom Logo</div>
					}
				})
			);

			expect(screen.getByTestId('custom-logo')).toBeInTheDocument();
		});
	});

	describe('reCAPTCHA Integration', () => {
		afterEach(() => {
			document
				.querySelectorAll('script[src*="recaptcha"]')
				.forEach(script => script.remove());
			delete (window as unknown as { grecaptcha?: unknown }).grecaptcha;
		});

		it('should throw error when enableRecaptcha is true but no site key provided', () => {
			// Suppress console.error for this test
			jest.spyOn(console, 'error').mockImplementation(() => {});

			expect(() =>
				renderWithTheme(createMockProps({ enableRecaptcha: true }))
			).toThrow('recaptchaSiteKey is required when enableRecaptcha is true');
		});

		it('should not load reCAPTCHA script when disabled', () => {
			renderWithTheme(
				createMockProps({
					enableRecaptcha: false,
					recaptchaSiteKey: 'test-site-key'
				})
			);

			expect(
				document.querySelectorAll('script[src*="recaptcha"]')
			).toHaveLength(0);
		});

		it('should load reCAPTCHA script when enabled with valid site key', () => {
			renderWithTheme(
				createMockProps({
					enableRecaptcha: true,
					recaptchaSiteKey: 'test-site-key'
				})
			);

			const scripts = document.querySelectorAll('script[src*="recaptcha"]');
			expect(scripts).toHaveLength(1);
			expect(scripts[0]).toHaveAttribute(
				'src',
				'https://www.google.com/recaptcha/enterprise.js?render=test-site-key'
			);
		});

		it('should verify reCAPTCHA before requesting a magic link', async () => {
			const user = userEvent.setup();
			const execute = jest.fn().mockResolvedValue('test-recaptcha-token');
			Object.defineProperty(window, 'grecaptcha', {
				value: { ready: (callback: () => void) => callback(), execute },
				writable: true,
				configurable: true
			});
			jest.spyOn(authService, 'requestMagicLink').mockResolvedValue();
			renderWithTheme(
				createMockProps({
					enableMagicLinkSignIn: true,
					enableRecaptcha: true,
					recaptchaSiteKey: 'test-site-key'
				})
			);

			await user.type(
				screen.getByLabelText('Work email'),
				'test@example.com'
			);
			await user.click(screen.getByRole('button', { name: 'Magic Link' }));

			await waitFor(() => {
				expect(execute).toHaveBeenCalledWith('test-site-key', {
					action: 'login'
				});
			});
		});
	});
});
