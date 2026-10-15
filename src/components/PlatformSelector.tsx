import React, { useRef } from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PlatformAssets, PlatformId } from '../types';
import { PLATFORMS } from '../lib/platforms';
import { CARD_SHADOW, CONTROL_HEIGHT, LoginTheme } from '../utils/loginTheme';
import {
	COLOR_DURATION,
	EASE_OUT,
	THEME_TRANSITION,
	colorTransition
} from '../utils/motion';
import PlatformLogo from './PlatformLogo';

interface PlatformSelectorProps {
	theme: LoginTheme;
	value: PlatformId | null;
	platformAssets?: Partial<Record<PlatformId, PlatformAssets>>;
	disabled?: boolean;
	onChange: (platform: PlatformId) => void;
}

/**
 * "Where would you like to start?" segmented control. One platform is always selected.
 */
const PlatformSelector: React.FC<PlatformSelectorProps> = ({
	theme,
	value,
	platformAssets,
	disabled = false,
	onChange
}) => {
	const isDark = theme.mode === 'dark';

	// The highlight stays on the last platform while it fades out, so clearing does not slide it
	const lastIndex = useRef(0);
	const selectedIndex = PLATFORMS.findIndex(platform => platform.id === value);
	if (selectedIndex >= 0) {
		lastIndex.current = selectedIndex;
	}
	const highlighted = PLATFORMS[lastIndex.current];

	return (
		<Box>
			<Box
				id="lumora-platform-label"
				sx={{
					mb: 1.5,
					fontFamily: theme.bodyFont,
					fontSize: 12,
					fontWeight: 700,
					letterSpacing: '0.14em',
					textTransform: 'uppercase',
					color: theme.label
				}}
			>
				Where would you like to start?
			</Box>

			<Box
				sx={{
					position: 'relative',
					p: 1,
					borderRadius: '12px',
					backgroundColor: theme.surface,
					boxShadow: isDark ? 'none' : CARD_SHADOW,
					border: `1px solid ${isDark ? theme.border : 'transparent'}`,
					transition: THEME_TRANSITION
				}}
			>
				{/* Highlight behind the selected platform; slides between them */}
				<Box
					aria-hidden
					sx={{
						position: 'absolute',
						top: 8,
						bottom: 8,
						left: 8,
						// Three equal columns with two 4px gaps between them
						width: 'calc((100% - 16px - 8px) / 3)',
						borderRadius: '8px',
						backgroundColor: highlighted.uiColor,
						// Dark brand colours (Polymer) need an edge to stand out on a dark page
						boxShadow: isDark ? `inset 0 0 0 1px ${highlighted.colorOnDark}` : 'none',
						transform: `translateX(calc(${lastIndex.current} * (100% + 4px))) scale(${selectedIndex >= 0 ? 1 : 0.92})`,
						opacity: selectedIndex >= 0 ? 1 : 0,
						transition: `transform ${COLOR_DURATION}ms ${EASE_OUT}, opacity 200ms ease, ${THEME_TRANSITION}`
					}}
				/>

			<ToggleButtonGroup
				exclusive
				fullWidth
				value={value}
				disabled={disabled}
				aria-labelledby="lumora-platform-label"
				// Clicking the selected platform reports null: ignore it, so a platform stays chosen
				onChange={(_, platform: PlatformId | null) => platform && onChange(platform)}
				sx={{ position: 'relative', gap: 0.5 }}
			>
				{PLATFORMS.map(platform => {
					const color = isDark ? platform.colorOnDark : platform.uiColor;
					const logo = platformAssets?.[platform.id]?.logo;

					return (
						<ToggleButton
							key={platform.id}
							value={platform.id}
							// Only the highlight behind the active option moves
							disableRipple
							sx={{
								flex: 1,
								gap: 0.75,
								...CONTROL_HEIGHT,
								py: 0,
								px: 1,
								// Override the group's joined-button borders and radii
								border: 'none !important',
								borderRadius: '8px !important',
								m: '0 !important',
								textTransform: 'none',
								// App names are set in the heading font (Montserrat)
								fontFamily: theme.headingFont,
								// Montserrat runs wider than the body font
								fontSize: 14,
								fontWeight: 600,
								color,
								// Logo colours: brand on the card (Centra's arcs white in dark mode), white on the selected tab
								'--mark-primary': color,
								'--mark-secondary': isDark ? '#ffffff' : '#3D4C5E',
								'--mark-center': color,
								'--mark-ring': theme.surface,
								// Hover tint stays quick; the text colour follows the highlight
								transition: `background-color 150ms, ${colorTransition('color')}`,
								'& .MuiSvgIcon-root': { fontSize: 22 },
								'&:hover': {
									backgroundColor: `${color}14`
								},
								// The sliding highlight draws the selected background
								'&.Mui-selected, &.Mui-selected:hover': {
									backgroundColor: 'transparent',
									color: '#ffffff',
									// Selected marks: all white, with XPdite's centre node
									// a white ring around the tab colour
									'--mark-primary': '#ffffff',
									'--mark-secondary': '#ffffff',
									'--mark-center': platform.uiColor,
									'--mark-ring': '#ffffff'
								},
								'&.Mui-focusVisible': {
									outline: `2px solid ${color}`,
									outlineOffset: 2
								}
							}}
						>
							{logo ?? <PlatformLogo platform={platform.id} />}
							{platform.name}
						</ToggleButton>
					);
				})}
			</ToggleButtonGroup>
			</Box>
		</Box>
	);
};

export default PlatformSelector;
