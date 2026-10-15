import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { CONTROL_HEIGHT, LoginTheme } from '../utils/loginTheme';
import { THEME_TRANSITION } from '../utils/motion';

interface SignInOptionButtonProps {
	theme: LoginTheme;
	icon: React.ReactNode;
	label: string;
	// Accessible name when the visible label is short (e.g. "Google")
	ariaLabel?: string;
	loadingLabel?: string;
	isLoading?: boolean;
	disabled?: boolean;
	onClick: () => void;
}

/**
 * Outlined provider button (Google, Microsoft)
 */
const SignInOptionButton: React.FC<SignInOptionButtonProps> = ({
	theme,
	icon,
	label,
	ariaLabel,
	loadingLabel = 'Signing in...',
	isLoading = false,
	disabled = false,
	onClick
}) => {
	return (
		<Button
			fullWidth
			variant="outlined"
			aria-label={isLoading ? loadingLabel : ariaLabel}
			startIcon={
				isLoading ? <CircularProgress size={18} color="inherit" /> : icon
			}
			onClick={onClick}
			disabled={disabled}
			sx={{
				...CONTROL_HEIGHT,
				borderRadius: '10px',
				textTransform: 'none',
				// Buttons are set in Montserrat
				fontFamily: theme.headingFont,
				fontWeight: 600,
				fontSize: 15,
				whiteSpace: 'nowrap',
				transition: THEME_TRANSITION,
				backgroundColor: theme.surface,
				borderColor: theme.border,
				color: theme.heading,
				'& .MuiButton-startIcon .MuiSvgIcon-root': { fontSize: 20 },
				'&:hover': {
					borderColor: theme.accent,
					backgroundColor: theme.surface
				},
				'&.Mui-focusVisible': {
					outline: `2px solid ${theme.accent}`,
					outlineOffset: 2
				},
				'&.Mui-disabled': {
					borderColor: theme.border,
					color: theme.muted
				}
			}}
		>
			{isLoading ? loadingLabel : label}
		</Button>
	);
};

export default SignInOptionButton;
