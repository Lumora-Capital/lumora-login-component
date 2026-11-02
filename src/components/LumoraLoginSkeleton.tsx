import React, {
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useSyncExternalStore
} from 'react';
import { BrandingConfig, ColorMode, PlatformId } from '../types';
import { getBrandingConfig } from '../utils/branding';
import {
	CONTROL_HEIGHT,
	getLoginTheme,
	themeVariables
} from '../utils/loginTheme';
import { cn } from '../lib/utils';
import {
	DEFAULT_PLATFORM,
	PLATFORMS,
	PLATFORM_STORAGE_KEY,
	PlatformStorage,
	getPlatform
} from '../lib/platforms';
import {
	COLOR_MODE_STORAGE_KEY,
	ColorModeStorage,
	SYSTEM_DARK_QUERY,
	getSystemColorMode
} from '../lib/colorMode';
import LoginContainer from './LoginContainer';

export interface LumoraLoginSkeletonProps {
	// Same as LumoraLogin's: pass them so the skeleton opens in the mode and platform the page will
	defaultColorMode?: ColorMode;
	defaultPlatform?: PlatformId;
	showPlatformSelector?: boolean;
	branding?: BrandingConfig;
	// Extra classes on the skeleton's root
	className?: string;
}

const MODES: ColorMode[] = ['light', 'dark'];

// Bones: the faint shapes standing in for content, on the page and on the hero
const BONE: Record<ColorMode, string> = {
	light: 'rgba(18, 51, 45, 0.09)',
	dark: 'rgba(255, 255, 255, 0.08)'
};
const HERO_BONE = 'rgba(255, 255, 255, 0.18)';

// Nothing to subscribe to: whether the HTML came from the server never changes after hydration
const subscribeNever = () => () => {};

/**
 * True while rendering on the server or hydrating its HTML, false for a render that starts in
 * the browser. React never runs a script it creates in the browser, and warns about it.
 */
const useIsServerHtml = () =>
	useSyncExternalStore(
		subscribeNever,
		() => false,
		() => true
	);

// Runs on the client only; useLayoutEffect warns during server rendering on React 18
const useIsomorphicLayoutEffect =
	typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Mode and platform the page will open in, in LumoraLogin's order: the user's saved choice,
 * then the host's default, then the system (mode) or Centra (platform)
 */
const resolveState = (
	defaultColorMode?: ColorMode,
	defaultPlatform?: PlatformId
) => ({
	mode: ColorModeStorage.get() ?? defaultColorMode ?? getSystemColorMode(),
	platform: defaultPlatform ?? PlatformStorage.get() ?? DEFAULT_PLATFORM
});

/**
 * The same choice as resolveState, as an inline script: on a server-rendered page it runs
 * before the first paint, so the skeleton never shows light and then turns dark
 */
const getStateScript = (
	defaultColorMode?: ColorMode,
	defaultPlatform?: PlatformId
) =>
	`(function(s){try{var e=s.parentElement,m=null,p=${JSON.stringify(defaultPlatform ?? null)};` +
	`try{m=localStorage.getItem(${JSON.stringify(COLOR_MODE_STORAGE_KEY)});` +
	`if(!p)p=localStorage.getItem(${JSON.stringify(PLATFORM_STORAGE_KEY)})}catch(x){}` +
	`if(m!=='light'&&m!=='dark')m=${JSON.stringify(defaultColorMode ?? null)}||` +
	`(window.matchMedia&&matchMedia(${JSON.stringify(SYSTEM_DARK_QUERY)}).matches?'dark':'light');` +
	`if(${JSON.stringify(PLATFORMS.map(item => item.id))}.indexOf(p)<0)p=${JSON.stringify(DEFAULT_PLATFORM)};` +
	`e.setAttribute('data-mode',m);e.setAttribute('data-platform',p)}catch(x){}})(document.currentScript)`;

/**
 * CSS variables for one mode and platform: every colour of the page, the bone colour and
 * the hero colour
 */
const getVariables = (
	brandConfig: BrandingConfig,
	mode: ColorMode,
	platform: PlatformId
): Record<string, string> => ({
	...themeVariables(getLoginTheme(brandConfig, mode, platform)),
	'--lumora-bone': BONE[mode],
	'--lumora-hero': getPlatform(platform).color
});

/**
 * The variables as CSS rules on the root: the defaults (before the script runs, or with scripts
 * off), then one rule per mode and platform, picked by the data-mode / data-platform attributes the
 * script or the effect sets. Rules, not an inline style, which would outrank the picked ones.
 */
const getVariableRules = (
	brandConfig: BrandingConfig,
	rootId: string,
	defaultMode: ColorMode,
	defaultPlatform: PlatformId
): string => {
	const root = `[data-lumora-skeleton=${JSON.stringify(rootId)}]`;
	const block = (mode: ColorMode, platform: PlatformId) =>
		`{${Object.entries(getVariables(brandConfig, mode, platform))
			.map(([name, value]) => `${name}:${value}`)
			.join(';')}}`;
	return [
		`${root}${block(defaultMode, defaultPlatform)}`,
		...PLATFORMS.flatMap(({ id }) =>
			MODES.map(
				mode =>
					`${root}[data-mode="${mode}"][data-platform="${id}"]${block(mode, id)}`
			)
		)
	].join('');
};

// One bone: a block with a soft wave (MUI Skeleton's "wave"), in the page's bone colour. Width or
// height left out draws at the size its classes or flex give; a block bone with no width fills its row.
const Bone: React.FC<{
	width?: number | string;
	height?: number | string;
	radius?: number | string;
	color?: string;
	className?: string;
}> = ({
	width,
	height,
	radius = 6,
	color = 'var(--lumora-bone)',
	className
}) => (
	<div
		className={cn('lumora-bone ll:shrink-0', className)}
		style={{ width, height, borderRadius: radius, backgroundColor: color }}
	/>
);

// A sign-in button or input: the shared control height, on the card surface
const ControlBone: React.FC<{ className?: string }> = ({ className }) => (
	<Bone radius="10px" className={cn(CONTROL_HEIGHT, className)} />
);

/**
 * Loading placeholder for LumoraLogin, drawn in its layout so the page changes in place when
 * the form is ready. Show it while the host checks for an existing session, or as the
 * Suspense fallback of the login route. It needs no props.
 */
const LumoraLoginSkeleton: React.FC<LumoraLoginSkeletonProps> = ({
	defaultColorMode,
	defaultPlatform: hostPlatform,
	showPlatformSelector = false,
	branding,
	className
}) => {
	// Without the selector the page is always Centra
	const defaultPlatform = showPlatformSelector
		? hostPlatform
		: DEFAULT_PLATFORM;
	const brandConfig = getBrandingConfig(branding);
	const rootRef = useRef<HTMLDivElement>(null);
	const rootId = useId();
	const isServerHtml = useIsServerHtml();

	// Client renders (no server HTML, so the script does not run): set the same attributes.
	// React never owns them, so a server-rendered page hydrates without a mismatch.
	useIsomorphicLayoutEffect(() => {
		const { mode, platform } = resolveState(
			defaultColorMode,
			defaultPlatform
		);
		rootRef.current?.setAttribute('data-mode', mode);
		rootRef.current?.setAttribute('data-platform', platform);
	}, [defaultColorMode, defaultPlatform]);

	const hero = (
		<div
			className="lumora-grid ll:relative ll:flex ll:h-full ll:flex-col ll:overflow-hidden ll:rounded-[24px] ll:bg-hero ll:*:relative"
			style={
				{
					'--lumora-grid-color': 'rgba(255, 255, 255, 0.06)'
				} as React.CSSProperties
			}
		>
			<div className="ll:md:px-10 ll:md:pt-14 ll:lg:px-12 ll:lg:pt-18">
				<Bone width={260} height={12} color={HERO_BONE} />
				<Bone
					width="72%"
					height={56}
					radius={10}
					color={HERO_BONE}
					className="ll:mt-6"
				/>
				<Bone
					width="48%"
					height={56}
					radius={10}
					color={HERO_BONE}
					className="ll:mt-3"
				/>
				<Bone
					width="58%"
					height={16}
					color={HERO_BONE}
					className="ll:mt-6"
				/>
			</div>
			{/* Product window, bleeding off the right and bottom edges like the dashboard */}
			<Bone
				radius="14px"
				color={HERO_BONE}
				className="ll:-mr-[14px] ll:-mb-[14px] ll:min-h-[240px] ll:flex-1 ll:md:mt-10 ll:md:ml-10 ll:lg:mt-12 ll:lg:ml-12"
			/>
		</div>
	);

	return (
		<div
			ref={rootRef}
			role="status"
			aria-busy="true"
			aria-label="Loading sign-in"
			data-testid="lumora-login-skeleton"
			data-lumora-skeleton={rootId}
			// The script and the effect add data-mode and data-platform, which React does not render
			suppressHydrationWarning
			className={className}
		>
			{/* Inner HTML, not a text child: React would escape the quotes in the font names */}
			<style
				dangerouslySetInnerHTML={{
					__html: getVariableRules(
						brandConfig,
						rootId,
						defaultColorMode ?? 'light',
						defaultPlatform ?? DEFAULT_PLATFORM
					)
				}}
			/>
			{/* Server HTML only: there it runs before the first paint. In the browser the effect above does its job. */}
			{isServerHtml && (
				<script
					dangerouslySetInnerHTML={{
						__html: getStateScript(
							defaultColorMode,
							defaultPlatform
						)
					}}
				/>
			)}
			<LoginContainer
				hero={hero}
				mobileHero={
					<Bone
						height={200}
						radius="16px"
						color="var(--lumora-hero)"
					/>
				}
				footer={
					<div className="ll:flex ll:flex-col ll:gap-2">
						<Bone width="70%" height={10} />
						<Bone width="55%" height={10} />
						<Bone width="45%" height={10} />
					</div>
				}
			>
				{/* Header: logo and mode switch, welcome title, tagline */}
				<div>
					<div className="ll:flex ll:items-center ll:justify-between">
						<Bone width={120} height={32} />
						<Bone width={30} height={30} radius="50%" />
					</div>
					<Bone
						width="78%"
						height={42}
						radius={8}
						className="ll:mt-9 ll:short:mt-6"
					/>
					<Bone
						width="46%"
						height={42}
						radius={8}
						className="ll:mt-2"
					/>
					<Bone
						width="88%"
						height={16}
						className="ll:mt-4 ll:short:mt-3"
					/>
					<Bone width="30%" height={16} className="ll:mt-2" />
				</div>

				{/* Platform selector */}
				{showPlatformSelector && (
					<div>
						<Bone width="58%" height={12} className="ll:mb-3" />
						<div className="ll:flex ll:gap-1 ll:rounded-[12px] ll:border ll:border-line ll:bg-surface ll:p-2">
							{[0, 1, 2].map(index => (
								<Bone
									key={index}
									radius="8px"
									className={cn('ll:flex-1', CONTROL_HEIGHT)}
								/>
							))}
						</div>
					</div>
				)}

				{/* Google / Microsoft */}
				<div className="ll:grid ll:grid-cols-2 ll:gap-4">
					<ControlBone />
					<ControlBone />
				</div>

				{/* "or use your work email" */}
				<div className="ll:flex ll:items-center ll:gap-4">
					<div className="ll:h-px ll:flex-1 ll:bg-divider" />
					<Bone width={150} height={12} />
					<div className="ll:h-px ll:flex-1 ll:bg-divider" />
				</div>

				{/* Work email and magic link, then passkey */}
				<div>
					<Bone width="30%" height={12} className="ll:mb-3" />
					<div className="ll:flex ll:gap-3">
						<ControlBone className="ll:min-w-0 ll:flex-1" />
						<ControlBone className="ll:w-[110px]" />
					</div>
					<ControlBone className="ll:mt-4" />
				</div>

				{/* First time here? */}
				<div className="ll:flex ll:flex-col ll:gap-2.5 ll:rounded-[12px] ll:border ll:border-line ll:bg-surface ll:p-5 ll:short:py-2.5">
					<Bone width="40%" height={16} />
					<Bone width="80%" height={12} />
					<Bone width="72%" height={12} />
					<Bone width="86%" height={12} />
				</div>
			</LoginContainer>
		</div>
	);
};

export default LumoraLoginSkeleton;
