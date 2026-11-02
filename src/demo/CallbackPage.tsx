import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { useAuthCallback } from '../hooks/useAuthCallback';

/**
 * Demo callback page component
 * Demonstrates how to use the useAuthCallback hook in a real application
 */
// Page and card around each state
const Shell: React.FC<{ children: React.ReactNode; wide?: boolean }> = ({
	children,
	wide = false
}) => (
	<div className="ll:flex ll:min-h-screen ll:items-center ll:justify-center ll:bg-[#f5f5f5] ll:p-6 ll:font-[Source_Sans_3,Arial,sans-serif]">
		<div
			className={`ll:w-full ll:rounded-lg ll:bg-white ll:p-8 ll:text-center ll:shadow-md ${wide ? 'll:max-w-[500px]' : 'll:max-w-[400px]'}`}
		>
			{children}
		</div>
	</div>
);

const CallbackPage: React.FC = () => {
	const { loading, error } = useAuthCallback({
		onSuccess: (tokens, user, platform) => {
			console.log('✅ OAuth Success!');
			console.log('Platform:', platform);
			console.log('Access Token:', tokens.accessToken);
			console.log('Refresh Token:', tokens.refreshToken);
			console.log('User:', user);
		},
		onError: error => {
			console.error('❌ OAuth Error:', error);
		},
		redirectPath: '/',
		apiBaseUrl:
			import.meta.env.VITE_API_URL || 'https://dev.api.lumora.capital',
		apiKey: import.meta.env.VITE_API_KEY
	});

	// Loading state
	if (loading) {
		return (
			<Shell>
				<Loader2Icon
					role="status"
					aria-label="Loading"
					className="ll:mx-auto ll:size-14 ll:animate-spin ll:text-[#049586]"
				/>
				<h2 className="ll:mt-6 ll:mb-2 ll:text-[20px] ll:font-semibold">
					Processing Authentication
				</h2>
				<p className="ll:text-[14px] ll:text-[#55636b]">
					Please wait while we complete your sign-in...
				</p>
			</Shell>
		);
	}

	// Error state
	if (error) {
		return (
			<Shell wide>
				<div
					role="alert"
					className="ll:mb-6 ll:rounded-md ll:border ll:border-[#c62828]/30 ll:bg-[#c62828]/8 ll:p-4 ll:text-left ll:text-[#c62828]"
				>
					<h2 className="ll:mb-1 ll:text-[18px] ll:font-semibold">
						Authentication Failed
					</h2>
					<p className="ll:text-[14px]">{error.message}</p>
				</div>

				<p className="ll:mb-6 ll:text-[14px] ll:text-[#55636b]">
					{error.message.includes('No account found')
						? 'Please contact your administrator to create an account for you.'
						: 'Please try signing in again or contact support if the problem persists.'}
				</p>

				<div className="ll:flex ll:justify-center ll:gap-4">
					<button
						type="button"
						onClick={() => (window.location.href = '/')}
						className="ll:h-9 ll:rounded-md ll:bg-[#049586] ll:px-4 ll:font-semibold ll:text-white ll:hover:bg-[#037e72]"
					>
						Back to Login
					</button>
					<button
						type="button"
						onClick={() => {
							console.error(
								'Authentication Error Details:',
								error
							);
							alert('Error details logged to console');
						}}
						className="ll:h-9 ll:rounded-md ll:border ll:border-[#8a939b] ll:px-4 ll:font-semibold ll:hover:bg-black/5"
					>
						View Details
					</button>
				</div>
			</Shell>
		);
	}

	// Success state (should redirect quickly, but show this briefly)
	return (
		<Shell>
			<h2 className="ll:mb-4 ll:text-[20px] ll:font-semibold ll:text-[#037f4c]">
				✓ Authentication Successful
			</h2>
			<p className="ll:text-[14px] ll:text-[#55636b]">
				Redirecting you to the dashboard...
			</p>
		</Shell>
	);
};

export default CallbackPage;
