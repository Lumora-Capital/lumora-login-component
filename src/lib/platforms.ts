import { ColorMode, PlatformId } from '../types';

// Neutrals of the login page in dark mode, tinted with a platform's colour
export interface DarkPalette {
	pageBg: string;
	surface: string;
	border: string;
	heading: string;
	text: string;
	muted: string;
	heroBg: string;
}

export interface PlatformConfig {
	id: PlatformId;
	name: string;
	// Second half of the hero eyebrow, e.g. "CENTRA • DEALS MANAGEMENT"
	area: string;
	// Hero headline: the lead sentence, then the part drawn in the accent colour
	headline: string;
	headlineAccent: string;
	description: string;
	// Brand colour: hero background (behind large headline text only)
	color: string;
	// Brand colour for controls and small text (selected tab, buttons, links): at least 4.5:1
	// against white text and the light page
	uiColor: string;
	// Brand colour on a dark page, where the light-mode colour would lack contrast
	colorOnDark: string;
	// Title bar of the hero browser frame
	frameColor: string;
	// Headline accent on the hero background
	accent: string;
	// Dark mode neutrals while this platform is selected
	dark: DarkPalette;
	// Loads the built-in dashboard shown in the hero, drawn for the colour mode. Each is its own
	// chunk, fetched only when the platform is selected; a placeholder is drawn until it arrives
	loadScreenshot: (mode: ColorMode) => Promise<string>;
}

// Dark mode neutrals with no platform selected: Lumora green
export const LUMORA_DARK_PALETTE: DarkPalette = {
	pageBg: '#0e1d1a',
	surface: '#152824',
	border: '#28403a',
	heading: '#e9f1ef',
	text: '#c2d0cc',
	muted: '#8ea29d',
	heroBg: '#12231f'
};

/**
 * The three Lumora platforms, in the order the selector shows them.
 * The host can replace a built-in dashboard through the `platformAssets` prop.
 */
export const PLATFORMS: PlatformConfig[] = [
	{
		id: 'centra',
		name: 'Centra',
		area: 'Deals management',
		headline: 'Every deal.',
		headlineAccent: 'One Clear Record',
		description:
			'Origination, compliance and monitoring for Lumora Capital, all in one workspace.',
		color: '#049586',
		// #049586 is 3.7:1 with white text; this shade is 5.3:1 (4.7:1 as text on the page)
		uiColor: '#02796d',
		colorOnDark: '#0aa898',
		frameColor: '#037569',
		accent: '#e7b96c',
		// Deep teal
		dark: {
			pageBg: '#06201d',
			surface: '#0c2f2b',
			border: '#1a4a44',
			heading: '#e7f4f1',
			text: '#bdd6cf',
			muted: '#85a79f',
			heroBg: '#0f2a24'
		},
		// Dark art is made from the light by scripts/dark-dashboards.mjs
		loadScreenshot: mode =>
			(mode === 'dark'
				? import('../assets/dashboards/centra-dark.svg')
				: import('../assets/dashboards/centra.svg')
			).then(module => module.default)
	},
	{
		id: 'xpdite',
		name: 'XPdite',
		area: 'Data training',
		headline: 'Creating value',
		headlineAccent: 'through insight',
		description:
			'Agent training and context gathering, from the people who know our deals best.',
		color: '#0f62b0',
		uiColor: '#0f62b0',
		// Lightened so it reads (5:1+) as tab text on every platform's dark surface
		colorOnDark: '#529de3',
		frameColor: '#0b4f8f',
		accent: '#a9cdf0',
		// Navy
		dark: {
			pageBg: '#0a1626',
			surface: '#0f2138',
			border: '#1d3758',
			heading: '#e8eefa',
			text: '#bfcbe3',
			muted: '#8899bb',
			heroBg: '#111d33'
		},
		// Dark art is made from the light by scripts/dark-dashboards.mjs
		loadScreenshot: mode =>
			(mode === 'dark'
				? import('../assets/dashboards/xpdite-dark.svg')
				: import('../assets/dashboards/xpdite.svg')
			).then(module => module.default)
	},
	{
		id: 'polymer',
		name: 'Polymer',
		area: 'AI agent configuration',
		headline: 'Build agents.',
		headlineAccent: 'Govern every version.',
		description:
			'Create, configure and manage the Nexa agents that work inside Centra.',
		color: '#03463f',
		uiColor: '#03463f',
		// Lightened so it reads (5:1+) as tab text on every platform's dark surface
		colorOnDark: '#2aac98',
		frameColor: '#023530',
		accent: '#05a393',
		// Near-black forest green
		dark: {
			pageBg: '#051411',
			surface: '#0a211d',
			border: '#17372f',
			heading: '#e5eeeb',
			text: '#b9c9c4',
			muted: '#83958f',
			heroBg: '#0d1b17'
		},
		// Dark art is made from the light by scripts/dark-dashboards.mjs
		loadScreenshot: mode =>
			(mode === 'dark'
				? import('../assets/dashboards/polymer-dark.svg')
				: import('../assets/dashboards/polymer.svg')
			).then(module => module.default)
	}
];

// Platform selected when neither the host nor the user's last visit names one
export const DEFAULT_PLATFORM: PlatformId = 'centra';

/**
 * Look up a platform's configuration by id
 * @param id - The platform id
 * @returns The platform configuration
 */
export const getPlatform = (id: PlatformId): PlatformConfig =>
	PLATFORMS.find(platform => platform.id === id)!;

// Storage key for the platform the user chose to start in
export const PLATFORM_STORAGE_KEY = 'lumora_platform';

/**
 * Remembers the chosen platform across the OAuth / magic link redirect,
 * so the callback page knows where to send the user
 */
export const PlatformStorage = {
	/**
	 * Get the stored platform
	 * @returns The platform id or null when none was chosen
	 */
	get: (): PlatformId | null => {
		try {
			const value = localStorage.getItem(PLATFORM_STORAGE_KEY);
			return PLATFORMS.some(platform => platform.id === value)
				? (value as PlatformId)
				: null;
		} catch {
			return null;
		}
	},

	/**
	 * Store the chosen platform, or clear it when null
	 * @param platform - The platform id or null
	 */
	set: (platform: PlatformId | null): void => {
		try {
			if (platform) {
				localStorage.setItem(PLATFORM_STORAGE_KEY, platform);
			} else {
				localStorage.removeItem(PLATFORM_STORAGE_KEY);
			}
		} catch {
			// Storage can be blocked (private mode); the choice then lasts only for this page
		}
	}
};
