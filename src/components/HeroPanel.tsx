import React, { useEffect, useState } from 'react';
import { ColorMode, PlatformAssets, PlatformId } from '../types';
import { PLATFORMS, getPlatform } from '../lib/platforms';
import { LoginTheme } from '../utils/loginTheme';
import {
	EASE_OUT,
	THEME_TRANSITION_CLASS,
	fadeUpAnimation,
	riseIn,
	slideInFrame
} from '../utils/motion';
import { cn } from '../lib/utils';
import BrowserFrame from './BrowserFrame';
import PlatformLogo from './PlatformLogo';

interface HeroPanelProps {
	theme: LoginTheme;
	platform: PlatformId | null;
	platformAssets?: Partial<Record<PlatformId, PlatformAssets>>;
	// Phone banner: shorter, smaller headline, no description, chips or pill
	compact?: boolean;
}

// Headline shared by the default and platform heroes; the phone banner's is smaller
const HEADLINE_CLASS =
	'll:font-semibold ll:leading-[1.08] ll:tracking-[-0.02em]';
const headlineSize = (compact: boolean) =>
	compact
		? 'll:text-[length:clamp(1.25rem,5.6vw,1.6rem)]'
		: 'll:text-[length:clamp(2.25rem,4vw,4.25rem)]';

// Uppercase, letter-spaced label above the headline
const eyebrowClass = (compact: boolean) =>
	cn(
		'll:flex ll:items-center ll:font-semibold ll:tracking-[0.16em] ll:uppercase',
		compact ? 'll:gap-2 ll:text-[10px]' : 'll:gap-3 ll:text-[12px]'
	);

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
	const insetX = compact ? 'll:px-[18px]' : 'll:md:px-10 ll:lg:px-12';

	return (
		<aside
			aria-label={
				selected
					? `${selected.name} overview`
					: 'Lumora platforms overview'
			}
			className={cn(
				'lumora-grid ll:relative ll:flex ll:flex-col ll:overflow-hidden ll:font-body ll:*:relative',
				compact
					? 'll:h-[200px] ll:rounded-[16px]'
					: 'll:h-full ll:rounded-[24px]',
				selected ? 'll:text-white' : 'll:bg-hero-bg ll:text-heading',
				THEME_TRANSITION_CLASS
			)}
			style={
				{
					backgroundColor: selected?.color,
					'--lumora-grid-color': selected
						? 'rgba(255, 255, 255, 0.06)'
						: 'var(--lumora-hero-grid)'
				} as React.CSSProperties
			}
		>
			{/* Keyed so switching platform remounts the content and replays its entrance */}
			{selected ? (
				<React.Fragment key={selected.id}>
					{/* Platform pitch */}
					<div
						className={cn(
							insetX,
							compact ? 'll:pt-[18px]' : 'll:md:pt-14 ll:lg:pt-18'
						)}
					>
						{/* Platform label ("POLYMER • AI AGENT CONFIGURATION") in Montserrat */}
						<div
							className={cn(
								eyebrowClass(compact),
								'll:font-heading'
							)}
							style={{ animation: fadeUpAnimation(0) }}
						>
							<div className="ll:h-px ll:w-[22px] ll:bg-current" />
							{selected.name}
							<span aria-hidden className="ll:text-[14px]">
								•
							</span>
							{selected.area}
						</div>
						<h2
							className={cn(
								HEADLINE_CLASS,
								headlineSize(compact),
								// Laptops: wraps every platform's headline the way Polymer's does ("Build agents.
								// Govern every" 13.3em fits; Centra 14.3em and XPdite 15.2em break onto a second line).
								// Wide screens (xl): no limit, so a headline stays on one line wherever it fits.
								// In em, so the limit scales with the font.
								'll:max-w-[13.8em] ll:font-heading ll:xl:max-w-none',
								compact ? 'll:mt-2' : 'll:mt-5'
							)}
							style={{ animation: fadeUpAnimation(60) }}
						>
							{selected.headline}{' '}
							<span style={{ color: selected.accent }}>
								{selected.headlineAccent}
							</span>
						</h2>
						{!compact && (
							<div
								className="ll:mt-4 ll:max-w-[640px] ll:text-[18px] ll:leading-normal ll:opacity-[0.92]"
								style={{ animation: fadeUpAnimation(120) }}
							>
								{selected.description}
							</div>
						)}
					</div>

					{/* Screenshot, bleeding off the right and bottom edges */}
					<div
						className={cn(
							'll:-mr-[14px] ll:-mb-[14px] ll:flex ll:flex-1 ll:flex-col',
							compact
								? 'll:mt-3.5 ll:ml-[18px] ll:min-h-0'
								: 'll:min-h-[240px] ll:md:mt-10 ll:md:ml-10 ll:lg:mt-12 ll:lg:ml-12'
						)}
						style={{
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
								className={
									screenshots[selected.id]
										? // Scaled by width only, so a tall hero adds space above it instead of zooming
											// it; sits on the bottom edge and is cut there when the hero is short
											'll:mt-auto ll:h-auto ll:w-full ll:shrink-0'
										: // The placeholder window fills the space
											'll:flex-1'
								}
							/>
						)}
					</div>
				</React.Fragment>
			) : (
				<React.Fragment key="ecosystem">
					{/* Ecosystem overview */}
					<div
						className={cn(
							insetX,
							compact ? 'll:pt-[18px]' : 'll:md:pt-10 ll:lg:pt-12'
						)}
					>
						<div
							className="ll:flex ll:items-center ll:justify-between ll:gap-4"
							style={{ animation: fadeUpAnimation(0) }}
						>
							<div
								className={cn(
									eyebrowClass(compact),
									'll:font-body ll:text-eyebrow',
									// The phone banner keeps a small label so the headline fits
									!compact && 'll:text-[16px]',
									THEME_TRANSITION_CLASS
								)}
							>
								<div className="ll:h-px ll:w-3 ll:bg-current" />
								A Lumora Capital ecosystem
							</div>
							{!compact && (
								// Outlined pill on the hero: no fill, slate border, Lumora green text
								<div className="ll:shrink-0 ll:rounded-full ll:border ll:border-[#546881] ll:bg-transparent ll:px-3 ll:py-1.5 ll:text-[11px] ll:font-bold ll:tracking-[0.14em] ll:text-brand-text ll:uppercase">
									{PLATFORMS.length} platforms · 1 account
								</div>
							)}
						</div>

						{/* Platform chips; the phone banner sits right above the selector, which shows them */}
						{!compact && (
							<div
								className="ll:flex ll:flex-wrap ll:gap-2 ll:md:mt-10 ll:lg:mt-14"
								style={{ animation: fadeUpAnimation(60) }}
							>
								{PLATFORMS.map(item => (
									<div
										key={item.id}
										// App names are set in the heading font (Montserrat)
										className="ll:inline-flex ll:items-center ll:gap-2 ll:rounded-full ll:px-3.5 ll:py-1.5 ll:font-heading ll:text-[12px] ll:font-semibold ll:tracking-[0.12em] ll:text-white ll:uppercase"
										style={
											{
												backgroundColor: item.uiColor,
												// Logos as on a selected tab: all white
												'--mark-primary': '#ffffff',
												'--mark-secondary': '#ffffff',
												'--mark-center': item.uiColor,
												'--mark-ring': '#ffffff'
											} as React.CSSProperties
										}
									>
										{platformAssets?.[item.id]?.logo ?? (
											<PlatformLogo
												platform={item.id}
												className="ll:size-4"
											/>
										)}
										{item.name}
									</div>
								))}
							</div>
						)}

						<h2
							className={cn(
								HEADLINE_CLASS,
								headlineSize(compact),
								'll:font-heading ll:text-hero-headline',
								compact ? 'll:mt-2' : 'll:mt-4',
								THEME_TRANSITION_CLASS
							)}
							style={{ animation: fadeUpAnimation(120) }}
						>
							One sign-in.{' '}
							<span
								className={cn(
									'll:text-hero-headline-accent',
									THEME_TRANSITION_CLASS
								)}
							>
								Every platform.
							</span>
						</h2>
						{!compact && (
							<div
								className="ll:mt-4 ll:max-w-[540px] ll:font-body ll:text-[18px] ll:leading-[1.55] ll:font-medium ll:text-hero-text"
								style={{ animation: fadeUpAnimation(180) }}
							>
								Centra runs the deals. Polymer builds the
								agents. XPdite trains them. One Lumora account
								opens all three.
							</div>
						)}
					</div>

					{/* Stacked product windows; the box is a size container, so the overview scene can size
					    itself to it (cqw / cqh units) */}
					<div
						className={cn(
							'll:relative ll:flex-1',
							compact
								? 'll:mx-[18px] ll:mt-3 ll:min-h-0'
								: 'll:mt-0 ll:min-h-[220px] ll:md:mx-10 ll:lg:mx-12'
						)}
						style={{ containerType: 'size' }}
					>
						{hasOverviewArt ? (
							<div
								className="ll:absolute ll:right-0 ll:left-0 ll:mx-auto"
								style={{
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
										<img
											key={id}
											src={screenshots[id]}
											alt={`${getPlatform(id).name} dashboard`}
											className="ll:absolute ll:bottom-0 ll:block"
											style={{
												left: ART_LEFT[id],
												width: ART_WIDTH,
												// Back window first, front window last
												animation: `${riseIn} 500ms ${EASE_OUT} ${200 + index * 60}ms both`
											}}
										/>
									) : null
								)}
							</div>
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
										className="ll:absolute"
										style={{
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
					</div>
				</React.Fragment>
			)}
		</aside>
	);
};

export default HeroPanel;
