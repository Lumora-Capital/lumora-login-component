import React from 'react';
import { Box, CircularProgress, Typography, Alert, Button, Paper } from '@mui/material';
import { useAuthCallback } from '../hooks/useAuthCallback';

/**
 * Demo callback page component
 * Demonstrates how to use the useAuthCallback hook in a real application
 */
const CallbackPage: React.FC = () => {
	const { loading, error } = useAuthCallback({
		onSuccess: (tokens, user) => {
			console.log('✅ OAuth Success!');
			console.log('Access Token:', tokens.accessToken);
			console.log('Refresh Token:', tokens.refreshToken);
			console.log('User:', user);
		},
		onError: (error) => {
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
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: '100vh',
					backgroundColor: '#f5f5f5',
					padding: 3
				}}
			>
				<Paper
					elevation={3}
					sx={{
						padding: 4,
						textAlign: 'center',
						maxWidth: 400,
						width: '100%'
					}}
				>
					<CircularProgress size={60} />
					<Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
						Processing Authentication
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Please wait while we complete your sign-in...
					</Typography>
				</Paper>
			</Box>
		);
	}

	// Error state
	if (error) {
		return (
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: '100vh',
					backgroundColor: '#f5f5f5',
					padding: 3
				}}
			>
				<Paper
					elevation={3}
					sx={{
						padding: 4,
						maxWidth: 500,
						width: '100%'
					}}
				>
					<Alert severity="error" sx={{ mb: 3 }}>
						<Typography variant="h6" gutterBottom>
							Authentication Failed
						</Typography>
						<Typography variant="body2">
							{error.message}
						</Typography>
					</Alert>

					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						{error.message.includes('No account found') 
							? 'Please contact your administrator to create an account for you.'
							: 'Please try signing in again or contact support if the problem persists.'
						}
					</Typography>

					<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => window.location.href = '/'}
							sx={{ textTransform: 'none' }}
						>
							Back to Login
						</Button>
						<Button
							variant="outlined"
							onClick={() => {
								console.error('Authentication Error Details:', error);
								alert('Error details logged to console');
							}}
							sx={{ textTransform: 'none' }}
						>
							View Details
						</Button>
					</Box>
				</Paper>
			</Box>
		);
	}

	// Success state (should redirect quickly, but show this briefly)
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '100vh',
				backgroundColor: '#f5f5f5',
				padding: 3
			}}
		>
			<Paper
				elevation={3}
				sx={{
					padding: 4,
					textAlign: 'center',
					maxWidth: 400,
					width: '100%'
				}}
			>
				<Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
					✓ Authentication Successful
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Redirecting you to the dashboard...
				</Typography>
			</Paper>
		</Box>
	);
};

export default CallbackPage;

