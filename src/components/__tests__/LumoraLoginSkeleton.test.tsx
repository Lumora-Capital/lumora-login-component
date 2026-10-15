import { render, screen } from '@testing-library/react';
import LumoraLoginSkeleton from '../LumoraLoginSkeleton';

describe('LumoraLoginSkeleton', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		delete (window as unknown as { matchMedia?: unknown }).matchMedia;
	});

	it('should render an accessible loading status with no props', () => {
		render(<LumoraLoginSkeleton />);

		const status = screen.getByRole('status', { name: 'Loading sign-in' });
		expect(status).toHaveAttribute('aria-busy', 'true');
	});

	it("should open in the user's saved mode and platform", () => {
		localStorage.setItem('lumora_color_mode', 'dark');
		localStorage.setItem('lumora_platform', 'polymer');
		render(<LumoraLoginSkeleton defaultColorMode="light" />);

		const status = screen.getByTestId('lumora-login-skeleton');
		expect(status).toHaveAttribute('data-mode', 'dark');
		expect(status).toHaveAttribute('data-platform', 'polymer');
	});

	it("should prefer the host's platform, as LumoraLogin does", () => {
		localStorage.setItem('lumora_platform', 'polymer');
		render(<LumoraLoginSkeleton defaultPlatform="xpdite" />);

		expect(screen.getByTestId('lumora-login-skeleton')).toHaveAttribute('data-platform', 'xpdite');
	});

	it('should fall back to the host mode, then light, without a saved choice', () => {
		render(<LumoraLoginSkeleton defaultColorMode="dark" />);

		const status = screen.getByTestId('lumora-login-skeleton');
		expect(status).toHaveAttribute('data-mode', 'dark');
		expect(status).toHaveAttribute('data-platform', 'centra');
	});

	it('should pick the same mode and platform in its pre-paint script', () => {
		localStorage.setItem('lumora_color_mode', 'dark');
		localStorage.setItem('lumora_platform', 'xpdite');
		const { container } = render(<LumoraLoginSkeleton />);
		const status = screen.getByTestId('lumora-login-skeleton');
		status.removeAttribute('data-mode');
		status.removeAttribute('data-platform');

		// Run the inline script as the browser would while parsing server HTML
		const script = container.querySelector('script')!.innerHTML;
		new Function('document', script)({ currentScript: container.querySelector('script') });

		expect(status).toHaveAttribute('data-mode', 'dark');
		expect(status).toHaveAttribute('data-platform', 'xpdite');
	});
});
