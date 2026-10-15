import { act, render, screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
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
		const container = document.createElement('div');
		container.innerHTML = renderToString(<LumoraLoginSkeleton />);
		const status = container.querySelector('[data-testid="lumora-login-skeleton"]')!;

		// Run the inline script as the browser would while parsing server HTML
		const script = container.querySelector('script')!;
		new Function('document', script.innerHTML)({ currentScript: script });

		expect(status).toHaveAttribute('data-mode', 'dark');
		expect(status).toHaveAttribute('data-platform', 'xpdite');
	});

	it('should not render a script when it first renders in the browser', () => {
		// React never runs such a script and logs a console error for it
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const { container } = render(<LumoraLoginSkeleton />);

		expect(container.querySelector('script')).toBeNull();
		expect(errorSpy).not.toHaveBeenCalledWith(expect.stringContaining('script tag'), expect.anything());
		errorSpy.mockRestore();
	});

	it('should hydrate its server HTML without a mismatch', async () => {
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const recoverable = jest.fn();
		const container = document.createElement('div');
		container.innerHTML = renderToString(<LumoraLoginSkeleton />);
		document.body.appendChild(container);

		const root = await act(async () =>
			hydrateRoot(container, <LumoraLoginSkeleton />, { onRecoverableError: recoverable })
		);

		expect(recoverable).not.toHaveBeenCalled();
		expect(errorSpy).not.toHaveBeenCalled();
		// After hydration the script has run and React drops it
		expect(container.querySelector('script')).toBeNull();
		act(() => root.unmount());
		container.remove();
		errorSpy.mockRestore();
	});
});
