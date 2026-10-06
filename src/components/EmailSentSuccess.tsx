import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { BrandingConfig } from '../types';

interface EmailSentSuccessProps {
	brandConfig: BrandingConfig;
	title: string;
	description: string;
	onBackToLogin: () => void;
}

/**
 * Confirmation screen shown after an email link has been sent
 * (forget password, magic link sign-in)
 */
const EmailSentSuccess: React.FC<EmailSentSuccessProps> = ({
	brandConfig,
	title,
	description,
	onBackToLogin
}) => {
	return (
		<>
			{/* Logo and Branding Section */}
			<Box sx={{ textAlign: 'center', mb: 3 }}>
				{brandConfig.logo && (
					<Box sx={{ mb: 2 }}>
						{typeof brandConfig.logo === 'string' ? (
							<img
								src={brandConfig.logo}
								alt={brandConfig.companyName || 'Company Logo'}
								style={{
									height: brandConfig.logoHeight,
									maxWidth: '100%',
									objectFit: 'contain'
								}}
							/>
						) : (
							brandConfig.logo
						)}
					</Box>
				)}

				<Typography
					variant="h5"
					component="h1"
					sx={{
						color: brandConfig.textColor,
						fontWeight: 600,
						fontSize: { xs: '1.5rem', sm: '1.75rem' },
						mb: 2
					}}
				>
					{title}
				</Typography>

				<Typography
					variant="body1"
					sx={{
						color: brandConfig.textColor,
						opacity: 0.8,
						mb: 3,
						lineHeight: 1.6,
						// A blank line in the description is a paragraph break
						whiteSpace: 'pre-line'
					}}
				>
					{description}
				</Typography>
			</Box>

			<Box textAlign="center" sx={{ mt: 3 }}>
				<Button
					variant="contained"
					onClick={onBackToLogin}
					sx={{
						py: 1.5,
						px: 4,
						backgroundColor: brandConfig.primaryColor,
						color: brandConfig.buttonTextColor,
						borderRadius: 1.4,
						textTransform: 'none',
						fontWeight: 600,
						fontSize: '1rem',
						boxShadow: `0 4px 12px ${brandConfig.primaryColor}30`,
						'&:hover': {
							backgroundColor: brandConfig.secondaryColor,
							boxShadow: `0 6px 16px ${brandConfig.primaryColor}40`
						}
					}}
				>
					Back to Sign In
				</Button>
			</Box>
		</>
	);
};

export default EmailSentSuccess;
