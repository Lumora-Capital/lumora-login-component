import { render, screen, waitFor } from '@testing-library/react';
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
		screen.getByRole('button', { name: 'Sign in with a passkey' })
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
	});

	describe('Basic Rendering', () => {
		it('should render the company name and tagline', () => {
			renderWithTheme(
				createMockProps({
					branding: {
						companyName: 'Test Company',
						tagline: 'Welcome to our platform'
					}
				})
			);

			expect(
				screen.getByRole('heading', { name: 'Test Company' })
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
				screen.queryByRole('button', { name: 'Email me a sign-in link' })
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: 'Sign in with a passkey' })
			).not.toBeInTheDocument();
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
	});

	describe('Magic Link Sign-In', () => {
		it('should request a magic link and show the confirmation screen', async () => {
			const user = userEvent.setup();
			const magicLinkSpy = jest
				.spyOn(authService, 'requestMagicLink')
				.mockResolvedValue();
			renderWithTheme(createMockProps({ enableMagicLinkSignIn: true }));

			await user.click(
				screen.getByRole('button', { name: 'Email me a sign-in link' })
			);
			await user.type(
				screen.getByLabelText('Email Address'),
				'test@example.com'
			);
			await user.click(
				screen.getByRole('button', { name: 'Send Sign-In Link' })
			);

			await waitFor(() => {
				expect(magicLinkSpy).toHaveBeenCalledWith(
					'test@example.com',
					CALLBACK_URI
				);
				expect(screen.getByText('Check Your Inbox')).toBeInTheDocument();
			});
		});

		it('should validate the email before sending', async () => {
			const user = userEvent.setup();
			const magicLinkSpy = jest.spyOn(authService, 'requestMagicLink');
			renderWithTheme(createMockProps({ enableMagicLinkSignIn: true }));

			await user.click(
				screen.getByRole('button', { name: 'Email me a sign-in link' })
			);
			await user.click(
				screen.getByRole('button', { name: 'Send Sign-In Link' })
			);

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

			await user.click(
				screen.getByRole('button', { name: 'Email me a sign-in link' })
			);
			await user.type(
				screen.getByLabelText('Email Address'),
				'test@example.com'
			);
			await user.click(
				screen.getByRole('button', { name: 'Send Sign-In Link' })
			);

			await waitFor(() => {
				expect(
					screen.getByText('Failed to send sign-in link')
				).toBeInTheDocument();
			});
			expect(props.onLoginError).toHaveBeenCalled();
		});

		it('should navigate back to the sign-in options', async () => {
			const user = userEvent.setup();
			renderWithTheme(createMockProps({ enableMagicLinkSignIn: true }));

			await user.click(
				screen.getByRole('button', { name: 'Email me a sign-in link' })
			);
			await user.click(
				screen.getByRole('button', { name: 'Back to Sign In' })
			);

			expect(
				screen.getByRole('button', { name: 'Email me a sign-in link' })
			).toBeInTheDocument();
		});
	});

	describe('Passkey Sign-In', () => {
		it('should sign in with a passkey', async () => {
			const user = userEvent.setup();
			const tokens = { accessToken: 'access', refreshToken: 'refresh' };
			const mockUser = { id: '1', email: 'test@example.com' };
			jest.spyOn(authService, 'loginWithPasskey').mockResolvedValue(tokens);
			jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(mockUser);
			const props = createMockProps({ enablePasskeySignIn: true });
			renderWithTheme(props);

			await user.click(
				screen.getByRole('button', { name: 'Sign in with a passkey' })
			);

			await waitFor(() => {
				expect(props.onLoginSuccess).toHaveBeenCalledWith({
					user: mockUser,
					tokens
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

			expect(screen.getByAltText('Lumora')).toHaveAttribute(
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

			await user.click(
				screen.getByRole('button', { name: 'Email me a sign-in link' })
			);
			await user.type(
				screen.getByLabelText('Email Address'),
				'test@example.com'
			);
			await user.click(
				screen.getByRole('button', { name: 'Send Sign-In Link' })
			);

			await waitFor(() => {
				expect(execute).toHaveBeenCalledWith('test-site-key', {
					action: 'login'
				});
			});
		});
	});
});
