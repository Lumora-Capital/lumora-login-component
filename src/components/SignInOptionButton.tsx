import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { BrandingConfig } from '../types';

interface SignInOptionButtonProps {
	brandConfig: BrandingConfig;
	icon: React.ReactNode;
	label: string;
	loadingLabel?: string;
	isLoading?: boolean;
	disabled?: boolean;
	onClick: () => void;
}

/**
 * Outlined button used for alternative sign-in methods
 * (Google, Microsoft, magic link, passkey)
 */
const SignInOptionButton: React.FC<SignInOptionButtonProps> = ({
	brandConfig,
	icon,
	label,
	loadingLabel = 'Signing in...',
	isLoading = false,
	disabled = false,
	onClick
}) => {
	return (
		<Button
			fullWidth
			variant="outlined"
			size="large"
			startIcon={
				isLoading ? <CircularProgress size={20} color="inherit" /> : icon
			}
			onClick={onClick}
			disabled={disabled}
			sx={{
				py: 1.5,
				borderRadius: 1.4,
				textTransform: 'none',
				fontWeight: 500,
				fontSize: '1rem',
				borderColor: brandConfig.textColor + '30',
				color: brandConfig.textColor,
				'&:hover': {
					borderColor: brandConfig.primaryColor,
					backgroundColor: `${brandConfig.primaryColor}08`,
					color: brandConfig.textColor
				},
				'&:active': {
					borderColor: brandConfig.primaryColor,
					backgroundColor: `${brandConfig.primaryColor}12`,
					color: brandConfig.textColor
				},
				'&:disabled': {
					borderColor: brandConfig.textColor + '20',
					color: brandConfig.textColor + '60'
				},
				'&:focus': {
					borderColor: brandConfig.textColor + '30',
					color: brandConfig.textColor
				},
				'&.MuiButton-root': {
					borderColor: brandConfig.textColor + '30',
					color: brandConfig.textColor
				}
			}}
		>
			{isLoading ? loadingLabel : label}
		</Button>
	);
};

export default SignInOptionButton;
