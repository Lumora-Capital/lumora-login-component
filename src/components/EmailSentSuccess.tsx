import React from 'react';
import { Box, Button } from '@mui/material';
import { MarkEmailReadOutlined as MailIcon } from '@mui/icons-material';
import { LoginTheme, focusRing } from '../utils/loginTheme';

interface EmailSentSuccessProps {
	theme: LoginTheme;
	title: string;
	description: string;
	onBackToLogin: () => void;
}

/**
 * Confirmation shown in place of the sign-in options after a magic link was sent
 */
const EmailSentSuccess: React.FC<EmailSentSuccessProps> = ({
	theme,
	title,
	description,
	onBackToLogin
}) => {
	return (
		<Box>
			<Box
				sx={{
					width: 48,
					height: 48,
					borderRadius: '12px',
					display: 'grid',
					placeItems: 'center',
					backgroundColor: `${theme.accent}1f`,
					color: theme.accent
				}}
			>
				<MailIcon />
			</Box>

			<Box
				component="h1"
				sx={{
					m: 0,
					mt: 3,
					fontFamily: theme.headingFont,
					fontSize: { xs: 28, sm: 32 },
					fontWeight: 600,
					lineHeight: 1.15,
					color: theme.heading
				}}
			>
				{title}
			</Box>

			<Box
				component="p"
				sx={{
					m: 0,
					mt: 2,
					fontSize: 16,
					lineHeight: 1.6,
					color: theme.label,
					// A blank line in the description is a paragraph break
					whiteSpace: 'pre-line'
				}}
			>
				{description}
			</Box>

			<Button
				fullWidth
				variant="outlined"
				onClick={onBackToLogin}
				sx={{
					mt: 4,
					height: 52,
					borderRadius: '10px',
					borderWidth: 1.5,
					borderColor: theme.accent,
					color: theme.accent,
					fontFamily: theme.headingFont,
					fontWeight: 600,
					fontSize: 13,
					letterSpacing: '0.14em',
					'&:hover': {
						borderWidth: 1.5,
						borderColor: theme.accent,
						backgroundColor: `${theme.accent}0f`
					},
					...focusRing(theme)
				}}
			>
				Back to sign in
			</Button>
		</Box>
	);
};

export default EmailSentSuccess;
