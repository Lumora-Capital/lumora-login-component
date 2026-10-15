import { getLoginTheme } from '../loginTheme';
import { getBrandingConfig } from '../branding';
import { LUMORA_DARK_PALETTE, getPlatform } from '../../lib/platforms';

describe('getLoginTheme', () => {
	const brandConfig = getBrandingConfig();

	it('uses the Lumora dark palette with no platform selected', () => {
		const theme = getLoginTheme(brandConfig, 'dark', null);

		expect(theme.pageBg).toBe(LUMORA_DARK_PALETTE.pageBg);
		expect(theme.surface).toBe(LUMORA_DARK_PALETTE.surface);
	});

	it.each(['centra', 'xpdite', 'polymer'] as const)(
		'tints dark mode with the %s palette',
		platform => {
			const theme = getLoginTheme(brandConfig, 'dark', platform);
			const { dark, colorOnDark } = getPlatform(platform);

			expect(theme.pageBg).toBe(dark.pageBg);
			expect(theme.surface).toBe(dark.surface);
			expect(theme.border).toBe(dark.border);
			expect(theme.accent).toBe(colorOnDark);
		}
	);

	it('keeps the branding neutrals in light mode', () => {
		const theme = getLoginTheme(brandConfig, 'light', 'xpdite');

		expect(theme.pageBg).toBe(brandConfig.backgroundColor);
		expect(theme.surface).toBe('#ffffff');
	});
});
