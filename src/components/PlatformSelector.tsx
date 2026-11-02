import React, { useRef } from 'react';
import { PlatformAssets, PlatformId } from '../types';
import { PLATFORMS } from '../lib/platforms';
import { CARD_SHADOW, CONTROL_HEIGHT, LoginTheme } from '../utils/loginTheme';
import {
	COLOR_DURATION,
	EASE_OUT,
	THEME_TRANSITION,
	THEME_TRANSITION_CLASS,
	colorTransition
} from '../utils/motion';
import { cn } from '../lib/utils';
import { sectionLabelClassName } from './ui/label';
import PlatformLogo from './PlatformLogo';

interface PlatformSelectorProps {
	theme: LoginTheme;
	value: PlatformId | null;
	platformAssets?: Partial<Record<PlatformId, PlatformAssets>>;
	disabled?: boolean;
	// Clicking the selected platform clears it (null), back to the overview
	allowClear?: boolean;
	onChange: (platform: PlatformId | null) => void;
}

/**
 * "Where would you like to start?" segmented control: toggle buttons (aria-pressed) in a labelled
 * group. One platform stays selected unless allowClear lets the user clear it.
 */
const PlatformSelector: React.FC<PlatformSelectorProps> = ({
	theme,
	value,
	platformAssets,
	disabled = false,
	allowClear = false,
	onChange
}) => {
	const isDark = theme.mode === 'dark';

	// The highlight stays on the last platform while it fades out, so clearing does not slide it
	const lastIndex = useRef(0);
	const selectedIndex = PLATFORMS.findIndex(
		platform => platform.id === value
	);
	if (selectedIndex >= 0) {
		lastIndex.current = selectedIndex;
	}
	const highlighted = PLATFORMS[lastIndex.current];

	return (
		<div>
			<div
				id="lumora-platform-label"
				className={cn(sectionLabelClassName, 'll:mb-3')}
			>
				Where would you like to start?
			</div>

			<div
				className={cn(
					'll:relative ll:rounded-[12px] ll:border ll:border-transparent ll:bg-surface ll:p-2',
					'll:dark:border-line',
					THEME_TRANSITION_CLASS
				)}
				style={isDark ? undefined : { boxShadow: CARD_SHADOW }}
			>
				{/* Highlight behind the selected platform; slides between them */}
				<div
					aria-hidden
					className="ll:absolute ll:top-2 ll:bottom-2 ll:left-2 ll:w-[calc((100%-16px-8px)/3)] ll:rounded-[8px]"
					style={{
						backgroundColor: highlighted.uiColor,
						// Dark brand colours (Polymer) need an edge to stand out on a dark page
						boxShadow: isDark
							? `inset 0 0 0 1px ${highlighted.colorOnDark}`
							: 'none',
						transform: `translateX(calc(${lastIndex.current} * (100% + 4px))) scale(${selectedIndex >= 0 ? 1 : 0.92})`,
						opacity: selectedIndex >= 0 ? 1 : 0,
						transition: `transform ${COLOR_DURATION}ms ${EASE_OUT}, opacity 200ms ease, ${THEME_TRANSITION}`
					}}
				/>

				<div
					role="group"
					aria-labelledby="lumora-platform-label"
					className="ll:relative ll:flex ll:gap-1"
				>
					{PLATFORMS.map(platform => {
						const color = isDark
							? platform.colorOnDark
							: platform.uiColor;
						const logo = platformAssets?.[platform.id]?.logo;
						const isSelected = platform.id === value;

						return (
							<button
								key={platform.id}
								type="button"
								aria-pressed={isSelected}
								disabled={disabled}
								// Clicking the selected platform clears it, only when clearing is allowed, so a
								// platform stays chosen
								onClick={() => {
									if (!isSelected) {
										onChange(platform.id);
									} else if (allowClear) {
										onChange(null);
									}
								}}
								className={cn(
									'll:inline-flex ll:min-w-0 ll:flex-1 ll:items-center ll:justify-center ll:gap-1.5 ll:rounded-[8px] ll:px-2 ll:py-0',
									// App names are set in the heading font (Montserrat), which runs wider than the body font
									'll:font-heading ll:text-[14px] ll:font-semibold',
									'll:outline-none ll:focus-visible:outline-2 ll:focus-visible:outline-offset-2 ll:focus-visible:outline-(color:--lumora-tab-color)',
									'll:disabled:opacity-[0.38]',
									// The sliding highlight draws the selected background
									isSelected
										? 'll:text-white'
										: 'll:text-(color:--lumora-tab-color) ll:hover:bg-[color-mix(in_srgb,var(--lumora-tab-color)_8%,transparent)] ll:disabled:hover:bg-transparent',
									CONTROL_HEIGHT
								)}
								style={
									{
										'--lumora-tab-color': color,
										// Logo colours: brand on the card (Centra's arcs white in dark mode), white on
										// the selected tab, with XPdite's centre node a white ring around the tab colour
										'--mark-primary': isSelected
											? '#ffffff'
											: color,
										'--mark-secondary':
											isSelected || isDark
												? '#ffffff'
												: '#3D4C5E',
										'--mark-center': isSelected
											? platform.uiColor
											: color,
										'--mark-ring': isSelected
											? '#ffffff'
											: theme.surface,
										// Hover tint stays quick; the text colour follows the highlight
										transition: `background-color 150ms, ${colorTransition('color')}`
									} as React.CSSProperties
								}
							>
								{logo ?? (
									<PlatformLogo
										platform={platform.id}
										className="ll:size-[22px]"
									/>
								)}
								{platform.name}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default PlatformSelector;
