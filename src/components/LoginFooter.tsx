import React from 'react';
import { Box, Link } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { BrandingConfig } from '../types';
import { LoginTheme, SHORT_SCREEN } from '../utils/loginTheme';
import { THEME_TRANSITION } from '../utils/motion';

interface LoginFooterProps {
	brandConfig: BrandingConfig;
	theme: LoginTheme;
}

/**
 * Security note, support contact and copyright
 */
const LoginFooter: React.FC<LoginFooterProps> = ({ brandConfig, theme }) => (
	<Box
		component="footer"
		sx={{
			display: 'grid',
			gap: 1,
			[SHORT_SCREEN]: { gap: 0.5 },
			fontSize: 13,
			lineHeight: 1.5,
			color: theme.label,
			transition: THEME_TRANSITION,
			// Centred on phones, where the panel is the whole page; left-aligned beside the hero
			textAlign: { xs: 'center', md: 'left' },
			justifyItems: { xs: 'center', md: 'start' }
		}}
	>
		{brandConfig.securityNote && (
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: { xs: 'center', md: 'flex-start' },
					gap: 0.75
				}}
			>
				<LockIcon sx={{ fontSize: 14 }} />
				{brandConfig.securityNote}
			</Box>
		)}

		{brandConfig.supportLabel && (
			<Box>
				Need access?{' '}
				{brandConfig.supportUrl ? (
					<Link
						href={brandConfig.supportUrl}
						sx={{
							color: theme.brandText,
							textDecorationColor: 'currentColor'
						}}
					>
						{brandConfig.supportLabel}
					</Link>
				) : (
					<Box component="span" sx={{ color: theme.brandText }}>
						{brandConfig.supportLabel}
					</Box>
				)}
			</Box>
		)}

		{(brandConfig.copyright || brandConfig.copyrightHolder) && (
			<Box>
				{brandConfig.copyright}
				{brandConfig.copyright && brandConfig.copyrightHolder && ' '}
				{brandConfig.copyrightHolder && brandConfig.copyrightUrl ? (
					// Only the holder is linked; opens in a new tab so the sign-in page stays open
					<Link
						href={brandConfig.copyrightUrl}
						target="_blank"
						rel="noopener noreferrer"
						underline="hover"
						sx={{ color: 'inherit' }}
					>
						{brandConfig.copyrightHolder}
					</Link>
				) : (
					brandConfig.copyrightHolder
				)}
			</Box>
		)}
	</Box>
);

export default LoginFooter;
