import React from 'react';
import { BrandingConfig, ColorMode } from '../types';
import { LoginTheme } from '../utils/loginTheme';
import {
	COLOR_DURATION,
	EASE_OUT,
	THEME_TRANSITION_CLASS,
	colorTransition
} from '../utils/motion';
import { cn } from '../lib/utils';
import { Tooltip } from './ui/tooltip';
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

// Both icons sit in the same spot; the current one shows, the other fades out with a quarter turn
const ICON_TRANSITION = `${colorTransition('opacity')}, transform ${COLOR_DURATION}ms ${EASE_OUT}`;

/**
 * Wordmark (or logo) with the light / dark toggle, then the welcome title and tagline
 */
const BrandingHeader: React.FC<BrandingHeaderProps> = ({
	brandConfig,
	theme,
	onToggleColorMode,
	showWelcome = true
}) => {
	const isDark = theme.mode === 'dark';
	const nextMode: ColorMode = isDark ? 'light' : 'dark';

	return (
		<header className="ll:[&_*]:transition-[background-color,border-color,color,box-shadow] ll:[&_*]:duration-[350ms] ll:[&_*]:ease-[cubic-bezier(0.4,0,0.2,1)]">
			<div className="ll:flex ll:items-center ll:justify-between ll:gap-4">
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
					fontFamily={theme.bodyFont}
				>
					<button
						type="button"
						aria-label={`Switch to ${nextMode} mode`}
						onClick={onToggleColorMode}
						className={cn(
							'll:relative ll:inline-flex ll:size-[30px] ll:shrink-0 ll:items-center ll:justify-center ll:rounded-full ll:border-2 ll:outline-none ll:focus-visible:outline-2 ll:focus-visible:outline-offset-2 ll:focus-visible:outline-accent',
							// Light: white button, amber sun. Dark: the page's own surface, pale moon
							'll:border-[#d9dbe1] ll:bg-white ll:dark:border-line ll:dark:bg-surface',
							THEME_TRANSITION_CLASS
						)}
					>
						<SunIcon
							className="ll:absolute ll:text-[17px] ll:text-[#de9733]"
							style={{
								opacity: isDark ? 0 : 1,
								transform: isDark
									? 'rotate(-90deg) scale(0.6)'
									: 'none',
								transition: ICON_TRANSITION
							}}
						/>
						<MoonIcon
							className="ll:absolute ll:text-[17px] ll:text-heading"
							style={{
								opacity: isDark ? 1 : 0,
								transform: isDark
									? 'none'
									: 'rotate(90deg) scale(0.6)',
								transition: ICON_TRANSITION
							}}
						/>
					</button>
				</Tooltip>
			</div>

			{showWelcome && (
				<>
					{/* Clear space between the logo and the welcome title */}
					<h1 className="ll:mt-9 ll:font-heading ll:text-[42px] ll:leading-[1.12] ll:font-semibold ll:tracking-[-0.01em] ll:text-welcome ll:short:mt-6">
						{brandConfig.welcomeTitle}
						{brandConfig.welcomeTitleAccent && (
							<>
								{' '}
								<span className="ll:text-welcome-accent">
									{brandConfig.welcomeTitleAccent}
								</span>
							</>
						)}
					</h1>

					{brandConfig.tagline && (
						<p className="ll:mt-3 ll:font-body ll:text-[18px] ll:leading-[1.4] ll:font-normal ll:text-tagline ll:short:mt-2">
							{brandConfig.tagline}
						</p>
					)}
				</>
			)}
		</header>
	);
};

export default BrandingHeader;
