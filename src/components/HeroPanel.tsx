import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { ColorMode, PlatformAssets, PlatformId } from '../types';
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

// Which art of a platform: its dashboard screenshot or its window on the overview stack
type ArtKey = 'screenshot' | 'overviewScreenshot';

// Image URLs downloaded and decoded, kept for the page's lifetime, so an img showing one paints
// in the same frame it is swapped in
const readyImages = new Set<string>();

// Image loads in flight or done, so each URL is requested once
const imageLoads = new Map<string, Promise<void>>();

// Built-in dashboard URLs once their module has been fetched, per colour mode
const builtInUrls: Record<ColorMode, Partial<Record<PlatformId, string>>> = {
	light: {},
	dark: {}
};

// Built-in dashboards that failed to load, which keep the placeholder
const failedBuiltIns: Record<ColorMode, Partial<Record<PlatformId, true>>> = {
	light: {},
	dark: {}
};

// Built-in dashboard loads in flight or done, so each module is requested once
const builtInLoads: Record<
	ColorMode,
	Partial<Record<PlatformId, Promise<void>>>
> = {
	light: {},
	dark: {}
};

/**
 * Download and decode an image once, so an img showing it paints at once
 * @param url - Image URL
 * @returns Resolves when the image is ready (a failed decode is left to the img to show)
 */
const preloadImage = (url: string): Promise<void> => {
	let load = imageLoads.get(url);
	if (!load) {
		const image = typeof Image === 'undefined' ? undefined : new Image();
		if (image) {
			image.src = url;
		}
		load = (
			typeof image?.decode === 'function'
				? image.decode().catch(() => undefined)
				: Promise.resolve()
		).then(() => {
			readyImages.add(url);
		});
		imageLoads.set(url, load);
	}
	return load;
};

/**
 * Fetch and decode a built-in dashboard, once per platform and colour mode
 * @param id - Platform
 * @param mode - Light or dark
 * @returns Resolves when the dashboard is ready to draw, or has failed
 */
const loadBuiltIn = (id: PlatformId, mode: ColorMode): Promise<void> => {
	builtInLoads[mode][id] ??= getPlatform(id)
		.loadScreenshot(mode)
		.then(url => {
			builtInUrls[mode][id] = url;
			return preloadImage(url);
		})
		.catch(() => {
			failedBuiltIns[mode][id] = true;
		});
	return builtInLoads[mode][id];
};

/**
 * The host's art for a colour mode: its dark version in dark mode when it has one
 * @param assets - Host-supplied assets of one platform
 * @param mode - Light or dark
 * @param key - Which art: the platform screenshot or the overview window
 * @returns The art URL, or undefined when the host supplied none
 */
const hostArt = (
	assets: PlatformAssets | undefined,
	mode: ColorMode,
	key: ArtKey
): string | undefined =>
	(mode === 'dark' ? assets?.[`${key}Dark`] : undefined) ?? assets?.[key];

/**
 * Fetch and decode one platform's art: the host's, else the built-in dashboard
 * (overview windows have no built-in)
 * @param id - Platform
 * @param mode - Light or dark
 * @param key - Which art
 * @param platformAssets - Host-supplied assets
 * @returns Resolves when the art is ready to draw, or has failed
 */
const loadArt = (
	id: PlatformId,
	mode: ColorMode,
	key: ArtKey,
	platformAssets?: Partial<Record<PlatformId, PlatformAssets>>
): Promise<void> => {
	const host = hostArt(platformAssets?.[id], mode, key);
	if (host) {
		return preloadImage(host);
	}
	return key === 'screenshot' ? loadBuiltIn(id, mode) : Promise.resolve();
};

/**
 * One platform's art as it can be drawn now
 * @param id - Platform
 * @param mode - Light or dark
 * @param key - Which art
 * @param platformAssets - Host-supplied assets
 * @returns The art URL once decoded, null while it loads (draw nothing), or undefined when
 * there is none (placeholder)
 */
const readyArt = (
	id: PlatformId,
	mode: ColorMode,
	key: ArtKey,
	platformAssets?: Partial<Record<PlatformId, PlatformAssets>>
): string | null | undefined => {
	const url =
		hostArt(platformAssets?.[id], mode, key) ??
		(key === 'screenshot' ? builtInUrls[mode][id] : undefined);
	if (url) {
		return readyImages.has(url) ? url : null;
	}
	return key === 'overviewScreenshot' || failedBuiltIns[mode][id]
		? undefined
		: null;
};

/**
 * Run a task when the browser is idle, so warming art does not compete with the page's own loading
 * @param task - The task
 * @returns Cancels the task if it has not run
 */
const whenIdle = (task: () => void): (() => void) => {
	if (typeof window.requestIdleCallback === 'function') {
		const handle = window.requestIdleCallback(task, { timeout: 3000 });
		return () => window.cancelIdleCallback(handle);
	}
	const timer = window.setTimeout(task, 200);
	return () => window.clearTimeout(timer);
};

/**
 * Fetch every art a later platform or mode switch can show: this mode's first, then the other's
 * @param mode - Current colour mode
 * @param platformAssets - Host-supplied assets
 */
const warmArt = (
	mode: ColorMode,
	platformAssets?: Partial<Record<PlatformId, PlatformAssets>>
): void => {
	const keys: ArtKey[] = PLATFORMS.every(
		item => platformAssets?.[item.id]?.overviewScreenshot
	)
		? ['screenshot', 'overviewScreenshot']
		: ['screenshot'];
	const warmMode = (artMode: ColorMode) =>
		Promise.all(
			PLATFORMS.flatMap(item =>
				keys.map(key => loadArt(item.id, artMode, key, platformAssets))
			)
		);
	void warmMode(mode).then(() =>
		warmMode(mode === 'dark' ? 'light' : 'dark')
	);
};

/**
 * Art for the given platforms in the colour mode, each drawn only once decoded so it never
 * shows half-loaded, the placeholder or the other mode's art. The shown art loads first; the
 * rest is warmed when the browser is idle, so switching platform or mode swaps straight to it.
 * @param ids - Platforms whose art is shown
 * @param key - Which art
 * @param mode - Light or dark
 * @param platformAssets - Host-supplied assets
 * @returns Per platform: the art URL, null while it loads, or undefined when there is none
 */
const useArt = (
	ids: PlatformId[],
	key: ArtKey,
	mode: ColorMode,
	platformAssets?: Partial<Record<PlatformId, PlatformAssets>>
): Partial<Record<PlatformId, string | null>> => {
	// Bumped when shown art is ready, to redraw with it
	const [, setLoadCount] = useState(0);
	const idsKey = ids.join(',');

	useEffect(() => {
		let cancelled = false;
		let cancelWarm: (() => void) | undefined;
		Promise.all(
			ids.map(id =>
				loadArt(id, mode, key, platformAssets).then(() => {
					if (!cancelled) {
						setLoadCount(count => count + 1);
					}
				})
			)
		).then(() => {
			if (!cancelled) {
				cancelWarm = whenIdle(() => warmArt(mode, platformAssets));
			}
		});
		return () => {
			cancelled = true;
			cancelWarm?.();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [idsKey, key, mode, platformAssets]);

	return Object.fromEntries(
		ids.map(id => [id, readyArt(id, mode, key, platformAssets)])
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

	// The overview uses whole-window art only when every platform supplies one
	const hasOverviewArt = PLATFORMS.every(
		item => platformAssets?.[item.id]?.overviewScreenshot
	);

	// The platform hero shows one dashboard, the overview stacks all three
	const screenshots = useArt(
		selected ? [selected.id] : PLATFORMS.map(item => item.id),
		!selected && hasOverviewArt ? 'overviewScreenshot' : 'screenshot',
		theme.mode,
		platformAssets
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
						{/* Nothing while the dashboard loads, so it never flashes the placeholder */}
						{screenshots[selected.id] === null ? null : (
							<BrowserFrame
								title={selected.name}
								barColor={selected.frameColor}
								screenshot={
									screenshots[selected.id] ?? undefined
								}
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
						)}
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
								).map((id, index) =>
									// Nothing while the window loads
									screenshots[id] ? (
										<Box
											key={id}
											component="img"
											src={screenshots[id]}
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
									) : null
								)}
							</Box>
						) : (
							(
								['polymer', 'xpdite', 'centra'] as PlatformId[]
							).map((id, index) => {
								const item = getPlatform(id);
								// Nothing while the dashboard loads, so it never flashes the placeholder
								if (screenshots[id] === null) {
									return null;
								}
								return (
									<BrowserFrame
										key={id}
										compact
										title={item.name}
										barColor={item.frameColor}
										screenshot={
											screenshots[id] ?? undefined
										}
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
