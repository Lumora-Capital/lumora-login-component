import React, {
	useEffect,
	useLayoutEffect,
	useRef,
	useSyncExternalStore
} from 'react';
import { Box, Skeleton } from '@mui/material';
import { BrandingConfig, ColorMode, PlatformId } from '../types';
import { getBrandingConfig } from '../utils/branding';
import {
	CONTROL_HEIGHT,
	LoginTheme,
	SHORT_SCREEN,
	getLoginTheme,
	gridBackground
} from '../utils/loginTheme';
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
	branding?: BrandingConfig;
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

// CSS variable for a theme field. Suffixed: emotion reads any "label:" in a style as the class
// name, so a bare --lumora-label would end up in the selector and break the whole rule.
const themeVar = (field: string) => `--lumora-${field}-color`;

/**
 * CSS variables for one mode and platform: every colour of the page, the bone colour and
 * the hero colour
 */
const getVariables = (
	brandConfig: BrandingConfig,
	mode: ColorMode,
	platform: PlatformId
): Record<string, string> => {
	const theme = getLoginTheme(brandConfig, mode, platform);
	const variables: Record<string, string> = {
		'--lumora-bone': BONE[mode],
		'--lumora-hero': getPlatform(platform).color
	};
	Object.entries(theme).forEach(([field, value]) => {
		if (field !== 'mode' && typeof value === 'string') {
			variables[themeVar(field)] = value;
		}
	});
	return variables;
};

/**
 * Theme whose colours are the CSS variables above, so the layout components draw the
 * skeleton in whichever mode and platform the script or effect picked
 */
const getVariableTheme = (brandConfig: BrandingConfig): LoginTheme => {
	const base = getLoginTheme(brandConfig, 'light', DEFAULT_PLATFORM);
	return Object.fromEntries(
		Object.entries(base).map(([field, value]) => [
			field,
			field === 'mode' || typeof value !== 'string'
				? value
				: `var(${themeVar(field)})`
		])
	) as unknown as LoginTheme;
};

// One bone: MUI's Skeleton with its wave, in the page's bone colour. Width or height left out
// draws at the size its sx or flex gives (Skeleton writes them as inline styles, which sx cannot
// beat); a block bone with no width fills its row.
const Bone: React.FC<{
	width?: number | string;
	height?: number | string;
	radius?: number | string;
	color?: string;
	sx?: object;
}> = ({ width, height, radius = 6, color = 'var(--lumora-bone)', sx }) => (
	<Skeleton
		variant="rounded"
		animation="wave"
		width={width}
		height={height}
		sx={{ bgcolor: color, borderRadius: radius, flexShrink: 0, transform: 'none', ...sx }}
	/>
);

// A sign-in button or input: the shared control height, on the card surface
const ControlBone: React.FC<{ sx?: object }> = ({ sx }) => (
	<Bone radius="10px" sx={{ ...CONTROL_HEIGHT, ...sx }} />
);

/**
 * Loading placeholder for LumoraLogin, drawn in its layout so the page changes in place when
 * the form is ready. Show it while the host checks for an existing session, or as the
 * Suspense fallback of the login route. It needs no props.
 */
const LumoraLoginSkeleton: React.FC<LumoraLoginSkeletonProps> = ({
	defaultColorMode,
	defaultPlatform,
	branding
}) => {
	const brandConfig = getBrandingConfig(branding);
	const theme = getVariableTheme(brandConfig);
	const rootRef = useRef<HTMLDivElement>(null);
	const isServerHtml = useIsServerHtml();

	// Client renders (no server HTML, so the script does not run): set the same attributes.
	// React never owns them, so a server-rendered page hydrates without a mismatch.
	useIsomorphicLayoutEffect(() => {
		const { mode, platform } = resolveState(defaultColorMode, defaultPlatform);
		rootRef.current?.setAttribute('data-mode', mode);
		rootRef.current?.setAttribute('data-platform', platform);
	}, [defaultColorMode, defaultPlatform]);

	// Default variables (before the script runs, or with scripts off), then one set per mode
	// and platform
	const variableSx: Record<string, object> = {};
	PLATFORMS.forEach(({ id }) =>
		MODES.forEach(mode => {
			variableSx[`&[data-mode="${mode}"][data-platform="${id}"]`] = getVariables(
				brandConfig,
				mode,
				id
			);
		})
	);

	const hero = (
		<Box
			sx={{
				position: 'relative',
				height: '100%',
				borderRadius: '24px',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: 'var(--lumora-hero)',
				'&::before': {
					content: '""',
					position: 'absolute',
					inset: 0,
					backgroundImage: gridBackground('rgba(255, 255, 255, 0.06)'),
					backgroundSize: '32px 32px'
				},
				'& > *': { position: 'relative' }
			}}
		>
			<Box sx={{ px: { md: 5, lg: 6 }, pt: { md: 7, lg: 9 } }}>
				<Bone width={260} height={12} color={HERO_BONE} />
				<Bone width="72%" height={56} radius={10} color={HERO_BONE} sx={{ mt: 3 }} />
				<Bone width="48%" height={56} radius={10} color={HERO_BONE} sx={{ mt: 1.5 }} />
				<Bone width="58%" height={16} color={HERO_BONE} sx={{ mt: 3 }} />
			</Box>
			{/* Product window, bleeding off the right and bottom edges like the dashboard */}
			<Bone
				radius="14px"
				color={HERO_BONE}
				sx={{ flex: 1, minHeight: 240, mt: { md: 5, lg: 6 }, ml: { md: 5, lg: 6 }, mr: '-14px', mb: '-14px' }}
			/>
		</Box>
	);

	return (
		<Box
			ref={rootRef}
			role="status"
			aria-busy="true"
			aria-label="Loading sign-in"
			data-testid="lumora-login-skeleton"
			// The script and the effect add data-mode and data-platform, which React does not render
			suppressHydrationWarning
			sx={{
				...getVariables(
					brandConfig,
					defaultColorMode ?? 'light',
					defaultPlatform ?? DEFAULT_PLATFORM
				),
				...variableSx
			}}
		>
			{/* Server HTML only: there it runs before the first paint. In the browser the effect above does its job. */}
			{isServerHtml && (
				<script
					dangerouslySetInnerHTML={{
						__html: getStateScript(defaultColorMode, defaultPlatform)
					}}
				/>
			)}
			<LoginContainer
				theme={theme}
				hero={hero}
				mobileHero={<Bone height={200} radius="16px" color="var(--lumora-hero)" />}
				footer={
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
						<Bone width="70%" height={10} />
						<Bone width="55%" height={10} />
						<Bone width="45%" height={10} />
					</Box>
				}
			>
				{/* Header: logo and mode switch, welcome title, tagline */}
				<Box>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Bone width={120} height={32} />
						<Bone width={30} height={30} radius="50%" />
					</Box>
					<Bone width="78%" height={42} radius={8} sx={{ mt: 4.5, [SHORT_SCREEN]: { mt: 3 } }} />
					<Bone width="46%" height={42} radius={8} sx={{ mt: 1 }} />
					<Bone width="88%" height={16} sx={{ mt: 2, [SHORT_SCREEN]: { mt: 1.5 } }} />
					<Bone width="30%" height={16} sx={{ mt: 1 }} />
				</Box>

				{/* Platform selector */}
				<Box>
					<Bone width="58%" height={12} sx={{ mb: 1.5 }} />
					<Box
						sx={{
							display: 'flex',
							gap: 0.5,
							p: 1,
							borderRadius: '12px',
							backgroundColor: theme.surface,
							border: `1px solid ${theme.border}`
						}}
					>
						{[0, 1, 2].map(index => (
							<Bone key={index} radius="8px" sx={{ flex: 1, ...CONTROL_HEIGHT }} />
						))}
					</Box>
				</Box>

				{/* Google / Microsoft */}
				<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
					<ControlBone />
					<ControlBone />
				</Box>

				{/* "or use your work email" */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Box sx={{ flex: 1, height: '1px', backgroundColor: theme.divider }} />
					<Bone width={150} height={12} />
					<Box sx={{ flex: 1, height: '1px', backgroundColor: theme.divider }} />
				</Box>

				{/* Work email and magic link, then passkey */}
				<Box>
					<Bone width="30%" height={12} sx={{ mb: 1.5 }} />
					<Box sx={{ display: 'flex', gap: 1.5 }}>
						<ControlBone sx={{ flex: 1, minWidth: 0 }} />
						<ControlBone sx={{ width: 110 }} />
					</Box>
					<ControlBone sx={{ mt: 2 }} />
				</Box>

				{/* First time here? */}
				<Box
					sx={{
						p: 2.5,
						[SHORT_SCREEN]: { py: 1.25 },
						borderRadius: '12px',
						backgroundColor: theme.surface,
						border: `1px solid ${theme.border}`,
						display: 'flex',
						flexDirection: 'column',
						gap: 1.25
					}}
				>
					<Bone width="40%" height={16} />
					<Bone width="80%" height={12} />
					<Bone width="72%" height={12} />
					<Bone width="86%" height={12} />
				</Box>
			</LoginContainer>
		</Box>
	);
};

export default LumoraLoginSkeleton;
