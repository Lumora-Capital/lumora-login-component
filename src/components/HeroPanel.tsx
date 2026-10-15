import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { PlatformAssets, PlatformId } from '../types';
import { PLATFORMS, getPlatform } from '../lib/platforms';
import { LoginTheme, gridBackground } from '../utils/loginTheme';
import {
	EASE_OUT,
	THEME_TRANSITION,
	fadeUpAnimation,
	riseIn,
	slideInFrame
} from '../utils/motion';
import BrowserFrame from './BrowserFrame';
import PlatformLogo from './PlatformLogo';

interface HeroPanelProps {
	theme: LoginTheme;
	platform: PlatformId | null;
	platformAssets?: Partial<Record<PlatformId, PlatformAssets>>;
	// Phone banner: shorter, smaller headline, no description, chips or pill
	compact?: boolean;
}

// Height of the phone banner
const COMPACT_HEIGHT = 200;

// Headline size on the phone banner
const COMPACT_HEADLINE_SIZE = 'clamp(1.25rem, 5.6vw, 1.6rem)';

// Headline size shared by the default and platform heroes
const HEADLINE_SX = {
	m: 0,
	fontWeight: 600,
	fontSize: 'clamp(2.25rem, 4vw, 4.25rem)',
	lineHeight: 1.08,
	letterSpacing: '-0.02em'
} as const;

// Uppercase, letter-spaced label above the headline
const EYEBROW_SX = {
	display: 'flex',
	alignItems: 'center',
	gap: 1.5,
	fontSize: 12,
	fontWeight: 600,
	letterSpacing: '0.16em',
	textTransform: 'uppercase'
} as const;

// Built-in dashboards already fetched, kept for the page's lifetime so each loads once
const loadedScreenshots: Partial<Record<PlatformId, string>> = {};

/**
 * Screenshots for the given platforms: the host's asset, else the built-in dashboard,
 * fetched on first use. A platform maps to undefined (placeholder) while it loads.
 * @param ids - Platforms whose screenshots are shown
 * @param platformAssets - Host-supplied assets
 * @returns Screenshot URL per platform
 */
const useScreenshots = (
	ids: PlatformId[],
	platformAssets?: Partial<Record<PlatformId, PlatformAssets>>
): Partial<Record<PlatformId, string>> => {
	// Bumped when a built-in dashboard arrives, to redraw with it
	const [, setLoadCount] = useState(0);
	const idsKey = ids.join(',');

	useEffect(() => {
		let cancelled = false;
		ids.forEach(id => {
			if (platformAssets?.[id]?.screenshot || loadedScreenshots[id]) {
				return;
			}
			getPlatform(id)
				.loadScreenshot()
				.then(url => {
					loadedScreenshots[id] = url;
					if (!cancelled) {
						setLoadCount(count => count + 1);
					}
				})
				// A failed fetch keeps the placeholder
				.catch(() => undefined);
		});
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [idsKey, platformAssets]);

	return Object.fromEntries(
		ids.map(id => [
			id,
			platformAssets?.[id]?.screenshot ?? loadedScreenshots[id]
		])
	);
};

// Overview stack built from whole-window art (overviewScreenshot). Each image is the same
// 872px-wide design with a 57px shadow margin, cut at the bottom 72px apart so the windows step
// down from Polymer (back) to Centra (front) once their bottoms line up. Lefts and width are
// fractions of the scene, which is as wide as the tallest image (Polymer) lets it be.
const ART_WIDTH = '74.6%';
const ART_LEFT: Record<PlatformId, string> = {
	polymer: '28.1%',
	xpdite: '11.7%',
	centra: '-4.9%'
};
// Scene width / height: Polymer's art is 537 / 872 of its width tall, at 74.6% of the scene
const SCENE_ASPECT = 2.177;

// Where each stacked frame sits on the default hero, back to front
const STACK_LAYOUT: Record<
	PlatformId,
	{ left: string; top: string; width: string }
> = {
	polymer: { left: '40%', top: '8%', width: '56%' },
	xpdite: { left: '20%', top: '18%', width: '52%' },
	centra: { left: '0%', top: '30%', width: '56%' }
};

/**
 * Right-hand hero: the Lumora ecosystem overview, or the selected platform's pitch
 * and screenshot in that platform's colours. On phones it is drawn as a compact banner.
 */
const HeroPanel: React.FC<HeroPanelProps> = ({
	theme,
	platform,
	platformAssets,
	compact = false
}) => {
	const selected = platform ? getPlatform(platform) : null;

	// The platform hero shows one dashboard, the overview stacks all three
	const screenshots = useScreenshots(
		selected ? [selected.id] : PLATFORMS.map(item => item.id),
		platformAssets
	);

	// The overview uses whole-window art only when every platform supplies one
	const hasOverviewArt = PLATFORMS.every(
		item => platformAssets?.[item.id]?.overviewScreenshot
	);

	// Side padding of the text and of the dashboard's left edge
	const inset = compact ? 2.25 : { md: 5, lg: 6 };

	return (
		<Box
			component="aside"
			aria-label={
				selected
					? `${selected.name} overview`
					: 'Lumora platforms overview'
			}
			sx={{
				position: 'relative',
				height: compact ? COMPACT_HEIGHT : '100%',
				borderRadius: compact ? '16px' : '24px',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				fontFamily: theme.bodyFont,
				backgroundColor: selected ? selected.color : theme.heroBg,
				// Grid lines: an overlay drawn in currentColor, so its colour fades with the theme
				// (a gradient's own colours cannot transition)
				'&::before': {
					content: '""',
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					color: selected
						? 'rgba(255, 255, 255, 0.06)'
						: theme.heroGrid,
					backgroundImage: gridBackground('currentColor'),
					backgroundSize: '32px 32px',
					transition: THEME_TRANSITION
				},
				// Content above the grid
				'& > *': { position: 'relative' },
				color: selected ? '#ffffff' : theme.heading,
				transition: THEME_TRANSITION
			}}
		>
			{/* Keyed so switching platform remounts the content and replays its entrance */}
			{selected ? (
				<React.Fragment key={selected.id}>
					{/* Platform pitch */}
					<Box
						sx={{
							px: inset,
							pt: compact ? 2.25 : { md: 7, lg: 9 }
						}}
					>
						<Box
							sx={{
								...EYEBROW_SX,
								// Platform label ("POLYMER • AI AGENT CONFIGURATION") in Montserrat
								fontFamily: theme.headingFont,
								...(compact && { fontSize: 10, gap: 1 }),
								animation: fadeUpAnimation(0)
							}}
						>
							<Box
								sx={{
									width: 22,
									height: '1px',
									backgroundColor: 'currentColor'
								}}
							/>
							{selected.name}
							<Box
								component="span"
								aria-hidden
								sx={{ fontSize: 14 }}
							>
								•
							</Box>
							{selected.area}
						</Box>
						<Box
							component="h2"
							sx={{
								...HEADLINE_SX,
								// Laptops: wraps every platform's headline the way Polymer's does ("Build agents.
								// Govern every" 13.3em fits; Centra 14.3em and XPdite 15.2em break onto a second line).
								// Wide screens (xl): no limit, so a headline stays on one line wherever it fits.
								// In em, so the limit scales with the font.
								maxWidth: { xs: '13.8em', xl: 'none' },
								...(compact && {
									fontSize: COMPACT_HEADLINE_SIZE
								}),
								mt: compact ? 1 : 2.5,
								fontFamily: theme.headingFont,
								animation: fadeUpAnimation(60)
							}}
						>
							{selected.headline}{' '}
							<Box
								component="span"
								sx={{ color: selected.accent }}
							>
								{selected.headlineAccent}
							</Box>
						</Box>
						{!compact && (
							<Box
								sx={{
									mt: 2,
									fontSize: 18,
									lineHeight: 1.5,
									opacity: 0.92,
									maxWidth: 640,
									animation: fadeUpAnimation(120)
								}}
							>
								{selected.description}
							</Box>
						)}
					</Box>

					{/* Screenshot, bleeding off the right and bottom edges */}
					<Box
						sx={{
							flex: 1,
							minHeight: compact ? 0 : 240,
							mt: compact ? 1.75 : { md: 5, lg: 6 },
							ml: inset,
							mr: '-14px',
							mb: '-14px',
							display: 'flex',
							flexDirection: 'column',
							animation: `${slideInFrame} 450ms ${EASE_OUT} 120ms both`
						}}
					>
						<BrowserFrame
							title={selected.name}
							barColor={selected.frameColor}
							screenshot={screenshots[selected.id]}
							sx={
								screenshots[selected.id]
									? {
											// Scaled by width only, so a tall hero adds space above it
											// instead of zooming it; sits on the bottom edge and is cut
											// there when the hero is short
											width: '100%',
											height: 'auto',
											flexShrink: 0,
											mt: 'auto'
										}
									: // The placeholder window fills the space
										{ flex: 1 }
							}
						/>
					</Box>
				</React.Fragment>
			) : (
				<React.Fragment key="ecosystem">
					{/* Ecosystem overview */}
					<Box
						sx={{
							px: inset,
							pt: compact ? 2.25 : { md: 5, lg: 6 }
						}}
					>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								gap: 2,
								animation: fadeUpAnimation(0)
							}}
						>
							<Box
								sx={{
									...EYEBROW_SX,
									fontFamily: theme.bodyFont,
									fontSize: 16,
									fontWeight: 600,
									// The phone banner keeps a small label so the headline fits
									...(compact && { fontSize: 10, gap: 1 }),
									color: theme.eyebrow,
									transition: THEME_TRANSITION
								}}
							>
								<Box
									sx={{
										width: 12,
										height: '1px',
										backgroundColor: 'currentColor'
									}}
								/>
								A Lumora Capital ecosystem
							</Box>
							{!compact && (
								<Box
									sx={{
										flexShrink: 0,
										px: 1.5,
										py: 0.75,
										borderRadius: 999,
										// Outlined pill on the hero: no fill, slate border, Lumora green text
										border: '1px solid #546881',
										backgroundColor: 'transparent',
										fontSize: 11,
										fontWeight: 700,
										letterSpacing: '0.14em',
										textTransform: 'uppercase',
										color: theme.brandText
									}}
								>
									{PLATFORMS.length} platforms · 1 account
								</Box>
							)}
						</Box>

						{/* Platform chips; the phone banner sits right above the selector, which shows them */}
						{!compact && (
							<Box
								sx={{
									display: 'flex',
									flexWrap: 'wrap',
									gap: 1,
									mt: { md: 5, lg: 7 },
									animation: fadeUpAnimation(60)
								}}
							>
								{PLATFORMS.map(item => (
									<Box
										key={item.id}
										sx={{
											display: 'inline-flex',
											alignItems: 'center',
											gap: 1,
											px: 1.75,
											py: 0.75,
											borderRadius: 999,
											backgroundColor: item.uiColor,
											color: '#ffffff',
											// Logos as on a selected tab: all white
											'--mark-primary': '#ffffff',
											'--mark-secondary': '#ffffff',
											'--mark-center': item.uiColor,
											'--mark-ring': '#ffffff',
											// App names are set in the heading font (Montserrat)
											fontFamily: theme.headingFont,
											fontSize: 12,
											fontWeight: 600,
											letterSpacing: '0.12em',
											textTransform: 'uppercase',
											'& .MuiSvgIcon-root': {
												fontSize: 16
											}
										}}
									>
										{platformAssets?.[item.id]?.logo ?? (
											<PlatformLogo platform={item.id} />
										)}
										{item.name}
									</Box>
								))}
							</Box>
						)}

						<Box
							component="h2"
							sx={{
								...HEADLINE_SX,
								...(compact && {
									fontSize: COMPACT_HEADLINE_SIZE
								}),
								mt: compact ? 1 : 2,
								fontFamily: theme.headingFont,
								color: theme.heroHeadline,
								transition: THEME_TRANSITION,
								animation: fadeUpAnimation(120)
							}}
						>
							One sign-in.{' '}
							<Box
								component="span"
								sx={{
									color: theme.heroHeadlineAccent,
									transition: THEME_TRANSITION
								}}
							>
								Every platform.
							</Box>
						</Box>
						{!compact && (
							<Box
								sx={{
									mt: 2,
									fontFamily: theme.bodyFont,
									fontSize: 18,
									fontWeight: 500,
									lineHeight: 1.55,
									color: theme.heroText,
									maxWidth: 540,
									animation: fadeUpAnimation(180)
								}}
							>
								Centra runs the deals. Polymer builds the
								agents. XPdite trains them. One Lumora account
								opens all three.
							</Box>
						)}
					</Box>

					{/* Stacked product windows */}
					<Box
						sx={{
							position: 'relative',
							flex: 1,
							minHeight: compact ? 0 : 220,
							mt: compact ? 1.5 : 0,
							mx: inset,
							// Lets the overview scene size itself to this box (cqw / cqh units)
							containerType: 'size'
						}}
					>
						{hasOverviewArt ? (
							<Box
								sx={{
									position: 'absolute',
									left: 0,
									right: 0,
									mx: 'auto',
									aspectRatio: String(SCENE_ASPECT),
									// Desktop: the whole stack fits, bottoms on the hero's edge.
									// Phone banner: full width from the top, bottoms clipped.
									...(compact
										? { top: 0, width: '100cqw' }
										: {
												bottom: 0,
												width: `min(100cqw, ${SCENE_ASPECT * 100}cqh)`
											})
								}}
							>
								{(
									[
										'polymer',
										'xpdite',
										'centra'
									] as PlatformId[]
								).map((id, index) => (
									<Box
										key={id}
										component="img"
										src={
											platformAssets?.[id]
												?.overviewScreenshot
										}
										alt={`${getPlatform(id).name} dashboard`}
										sx={{
											position: 'absolute',
											bottom: 0,
											left: ART_LEFT[id],
											width: ART_WIDTH,
											display: 'block',
											// Back window first, front window last
											animation: `${riseIn} 500ms ${EASE_OUT} ${200 + index * 60}ms both`
										}}
									/>
								))}
							</Box>
						) : (
							(
								['polymer', 'xpdite', 'centra'] as PlatformId[]
							).map((id, index) => {
								const item = getPlatform(id);
								return (
									<BrowserFrame
										key={id}
										compact
										title={item.name}
										barColor={item.frameColor}
										screenshot={screenshots[id]}
										sx={{
											position: 'absolute',
											...STACK_LAYOUT[id],
											// Run past the bottom edge, where the hero clips them
											bottom: '-24px',
											// Back window first, front window last
											animation: `${riseIn} 500ms ${EASE_OUT} ${200 + index * 60}ms both`
										}}
									/>
								);
							})
						)}
					</Box>
				</React.Fragment>
			)}
		</Box>
	);
};

export default HeroPanel;
