import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { BrandingConfig, ColorMode } from '../types';
import { LoginTheme, SHORT_SCREEN } from '../utils/loginTheme';
import {
	COLOR_DURATION,
	EASE_OUT,
	THEME_TRANSITION,
	colorTransition
} from '../utils/motion';
import SunIcon from './SunIcon';
import MoonIcon from './MoonIcon';
import LumoraLogo from './LumoraLogo';

interface BrandingHeaderProps {
	brandConfig: BrandingConfig;
	theme: LoginTheme;
	onToggleColorMode: () => void;
	// The welcome title and tagline are left out on the magic link confirmation
	showWelcome?: boolean;
}

/**
 * Wordmark (or logo) with the light / dark toggle, then the welcome title and tagline
 */
const BrandingHeader: React.FC<BrandingHeaderProps> = ({
	brandConfig,
	theme,
	onToggleColorMode,
	showWelcome = true
}) => {
	const nextMode: ColorMode = theme.mode === 'dark' ? 'light' : 'dark';

	return (
		<Box
			component="header"
			sx={{ '& *': { transition: THEME_TRANSITION } }}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 2
				}}
			>
				{/* Custom logo (URL or element), else the built-in Lumora Capital logo */}
				{brandConfig.logo ? (
					typeof brandConfig.logo === 'string' ? (
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
					)
				) : (
					<LumoraLogo
						title={brandConfig.companyName || 'Lumora Capital'}
						height={brandConfig.logoHeight!}
						color={theme.logo}
					/>
				)}

				<Tooltip
					title={`Switch to ${nextMode} mode`}
					// MUI tooltips default to Roboto
					slotProps={{
						tooltip: { sx: { fontFamily: theme.bodyFont } }
					}}
				>
					<IconButton
						aria-label={`Switch to ${nextMode} mode`}
						onClick={onToggleColorMode}
						size="small"
						// The ripple flashed the button on every click
						disableRipple
						sx={{
							width: 30,
							height: 30,
							// Light: white button, amber sun. Dark: the page's own surface, pale moon
							backgroundColor:
								theme.mode === 'dark'
									? theme.surface
									: '#ffffff',
							border: `2px solid ${theme.mode === 'dark' ? theme.border : '#d9dbe1'}`,
							transition: THEME_TRANSITION,
							'&:hover': {
								backgroundColor:
									theme.mode === 'dark'
										? theme.surface
										: '#ffffff'
							},
							'&.Mui-focusVisible': {
								outline: `2px solid ${theme.accent}`,
								outlineOffset: 2
							},
							// Both icons sit in the same spot; the current one shows, the other
							// fades out with a quarter turn
							'& .MuiSvgIcon-root': {
								position: 'absolute',
								fontSize: 17,
								transition: `${colorTransition('opacity')}, transform ${COLOR_DURATION}ms ${EASE_OUT}`
							}
						}}
					>
						<SunIcon
							sx={{
								color: '#de9733',
								opacity: theme.mode === 'dark' ? 0 : 1,
								transform:
									theme.mode === 'dark'
										? 'rotate(-90deg) scale(0.6)'
										: 'none'
							}}
						/>
						<MoonIcon
							sx={{
								color: theme.heading,
								opacity: theme.mode === 'dark' ? 1 : 0,
								transform:
									theme.mode === 'dark'
										? 'none'
										: 'rotate(90deg) scale(0.6)'
							}}
						/>
					</IconButton>
				</Tooltip>
			</Box>

			{showWelcome && (
				<>
					<Box
						component="h1"
						sx={{
							m: 0,
							mt: 3.5,
							[SHORT_SCREEN]: { mt: 1 },
							fontFamily: theme.headingFont,
							fontSize: 42,
							fontWeight: 600,
							lineHeight: 1.12,
							letterSpacing: '-0.01em',
							color: theme.welcomeTitle
						}}
					>
						{brandConfig.welcomeTitle}
						{brandConfig.welcomeTitleAccent && (
							<>
								{' '}
								<Box
									component="span"
									sx={{ color: theme.welcomeAccent }}
								>
									{brandConfig.welcomeTitleAccent}
								</Box>
							</>
						)}
					</Box>

					{brandConfig.tagline && (
						<Box
							component="p"
							sx={{
								m: 0,
								mt: 1.5,
								[SHORT_SCREEN]: { mt: 1 },
								fontFamily: theme.bodyFont,
								fontSize: 18,
								fontWeight: 400,
								lineHeight: 1.4,
								color: theme.tagline
							}}
						>
							{brandConfig.tagline}
						</Box>
					)}
				</>
			)}
		</Box>
	);
};

export default BrandingHeader;
