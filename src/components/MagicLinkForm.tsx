import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Button, CircularProgress, InputBase } from '@mui/material';
import { MagicLinkFormData } from '../types';
import { CONTROL_HEIGHT, LoginTheme, focusRing } from '../utils/loginTheme';
import { THEME_TRANSITION } from '../utils/motion';

const validationSchema = yup.object({
	email: yup
		.string()
		.email('Please enter a valid email address')
		.required('Email is required')
});

interface MagicLinkFormProps {
	theme: LoginTheme;
	isSubmitting: boolean;
	disabled?: boolean;
	onSubmit: SubmitHandler<MagicLinkFormData>;
}

/**
 * Work email field with an inline "Magic Link" button
 */
const MagicLinkForm: React.FC<MagicLinkFormProps> = ({
	theme,
	isSubmitting,
	disabled = false,
	onSubmit
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<MagicLinkFormData>({
		resolver: yupResolver(validationSchema)
	});

	const isDisabled = isSubmitting || disabled;

	return (
		<Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
			<Box
				component="label"
				htmlFor="lumora-work-email"
				sx={{
					display: 'block',
					mb: 1.5,
					// Same style as "Where would you like to start?"
					fontFamily: theme.bodyFont,
					fontSize: 12,
					fontWeight: 700,
					letterSpacing: '0.14em',
					textTransform: 'uppercase',
					color: theme.label
				}}
			>
				Work email
			</Box>

			<Box sx={{ display: 'flex', gap: 1.25 }}>
				<InputBase
					{...register('email')}
					id="lumora-work-email"
					type="email"
					autoComplete="email"
					placeholder="name@lumora.capital"
					disabled={isDisabled}
					inputProps={{
						'aria-invalid': !!errors.email,
						'aria-describedby': errors.email ? 'lumora-work-email-error' : undefined
					}}
					sx={{
						flex: 1,
						minWidth: 0,
						...CONTROL_HEIGHT,
						px: 2,
						borderRadius: '10px',
						border: `1px solid ${errors.email ? '#d14343' : theme.border}`,
						backgroundColor: theme.surface,
						color: theme.label,
						fontFamily: theme.bodyFont,
						fontSize: 16,
						transition: THEME_TRANSITION,
						'&.Mui-focused': {
							borderColor: theme.accent,
							boxShadow: `0 0 0 3px ${theme.accent}26`
						},
						'& input::placeholder': {
							color: theme.placeholder,
							opacity: 1,
							transition: THEME_TRANSITION
						}
					}}
				/>

				<Button
					type="submit"
					variant="contained"
					disableElevation
					disabled={isDisabled}
					sx={{
						flexShrink: 0,
						...CONTROL_HEIGHT,
						px: 1.5,
						minWidth: 92,
						borderRadius: '10px',
						textTransform: 'none',
						// Button label in the heading font (Montserrat), like the app names
						fontFamily: theme.headingFont,
						fontWeight: 600,
						fontSize: 15,
						backgroundColor: theme.accent,
						color: theme.buttonText,
						transition: THEME_TRANSITION,
						'&:hover': { backgroundColor: theme.accentHover },
						...focusRing(theme),
						'&.Mui-disabled': {
							backgroundColor: theme.accent,
							color: theme.buttonText,
							opacity: 0.6
						}
					}}
				>
					{isSubmitting ? (
						<CircularProgress size={20} color="inherit" aria-label="Sending sign-in link" />
					) : (
						'Magic Link'
					)}
				</Button>
			</Box>

			{errors.email && (
				<Box
					id="lumora-work-email-error"
					role="status"
					sx={{ mt: 1, fontSize: 13, color: '#d14343' }}
				>
					{errors.email.message}
				</Box>
			)}
		</Box>
	);
};

export default MagicLinkForm;
