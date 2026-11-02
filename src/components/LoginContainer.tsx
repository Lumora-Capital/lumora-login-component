import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ColorMode } from '../types';
import { THEME_TRANSITION_CLASS, fadeUpAnimation } from '../utils/motion';
import { cn } from '../lib/utils';

// Runs on the client only; useLayoutEffect warns during server rendering on React 18
const useIsomorphicLayoutEffect =
	typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface SpacerProps {
	// Share of the panel's spare height this gap takes
	weight: number;
	// Smallest gap, and its value on laptop-height screens (utilities)
	className: string;
}

/**
 * Gap between panel sections. When the panel is taller than its content, the spare height
 * is shared out by weight, so the gaps grow together instead of one hole opening up.
 */
const Spacer: React.FC<SpacerProps> = ({ weight, className }) => (
	<div
		aria-hidden
		className={className}
		style={{ flex: `${weight} 1 0px` }}
	/>
);

interface LoginContainerProps {
	// Colour mode, written on the root as data-color-scheme for the stylesheet. Left out by the
	// skeleton, whose mode is set by its own script.
	mode?: ColorMode;
	// The page palette as CSS variables (themeVariables)
	style?: React.CSSProperties;
	className?: string;
	// Left column: branding and sign-in methods, one section per child
	children: React.ReactNode;
	// Pinned to the bottom of the left column
	footer: React.ReactNode;
	// Right column, hidden below the md breakpoint
	hero: React.ReactNode;
	// Banner shown after the first section on phones and tablets, in place of the hero
	mobileHero?: React.ReactNode;
	// Appear in place, with no entrance animation: this replaces a skeleton (LumoraLogin's
	// animateEntrance). Read when it mounts only.
	skipEntrance?: boolean;
}

/**
 * Full-page split layout: sign-in panel on the left, hero on the right
 */
const LoginContainer: React.FC<LoginContainerProps> = ({
	mode,
	style,
	className,
	children,
	footer,
	hero,
	mobileHero,
	skipEntrance = false
}) => {
	// Keys from toArray follow each child's slot, so a section appearing later (an error)
	// mounts and fades up on its own without remounting the others
	const sections = React.Children.toArray(children);

	// Marked in the same render as the new colours, so they apply with no colour transition
	// (toggle or system setting). Cleared two frames later, once the browser has painted them:
	// a click before then keeps it marked, so rapid toggling never fades.
	const [shownMode, setShownMode] = useState(mode);
	const [isSwitchingMode, setIsSwitchingMode] = useState(false);
	if (mode !== shownMode) {
		setShownMode(mode);
		setIsSwitchingMode(true);
	}
	useEffect(() => {
		if (!isSwitchingMode) return;
		let frame = requestAnimationFrame(() => {
			frame = requestAnimationFrame(() => setIsSwitchingMode(false));
		});
		return () => cancelAnimationFrame(frame);
	}, [isSwitchingMode, shownMode]);

	// In place of a skeleton, every entrance animation jumps to its end before the first paint, so
	// the page fills in where the skeleton stood rather than going blank and building up again.
	// What mounts later (an error, another platform's hero, its art) still animates.
	const rootRef = useRef<HTMLDivElement>(null);
	const skipEntranceOnMount = useRef(skipEntrance);
	useIsomorphicLayoutEffect(() => {
		if (!skipEntranceOnMount.current) return;
		for (const animation of rootRef.current?.getAnimations?.({
			subtree: true
		}) ?? []) {
			// A spinner never ends; there is none on the first paint, but never finish one
			if (animation.effect?.getTiming().iterations !== Infinity)
				animation.finish();
		}
	}, []);

	return (
		// Full-width page background; the layout inside is capped and centred on wide screens.
		// Desktop: centres the capped layout vertically on very tall screens.
		<div
			ref={rootRef}
			data-color-scheme={mode}
			data-mode-switching={isSwitchingMode || undefined}
			className={cn(
				'lumora-login ll:min-h-screen ll:items-center ll:bg-page ll:md:flex',
				THEME_TRANSITION_CLASS,
				className
			)}
			style={style}
		>
			<div
				className={cn(
					// Beyond 1760px the hero would blow its artwork and headline up past their designed
					// size; at 1760px the dashboards show at about 1x
					'll:mx-auto ll:grid ll:min-h-screen ll:w-full ll:max-w-[1760px] ll:md:min-h-0',
					// Desktop: one screen tall, so the page itself never scrolls (no jump on reload, no flash
					// while fonts load), capped at 1120px so very tall screens do not stretch the hero into an
					// empty band; the sign-in panel scrolls inside if it must
					'll:md:h-[min(100vh,1120px)]',
					// One row exactly the layout's height: content taller than that (a dashboard image) is
					// clipped by the hero or scrolls in the panel, never stretches the page.
					// minmax(0, …) lets the column shrink below its content's width on phones.
					'll:grid-cols-[minmax(0,1fr)] ll:md:grid-cols-[minmax(400px,440px)_minmax(0,1fr)] ll:md:grid-rows-[minmax(0,1fr)] ll:xl:grid-cols-[480px_minmax(0,1fr)]',
					'll:bg-page ll:font-body ll:text-body',
					THEME_TRANSITION_CLASS
				)}
			>
				{/* Sign-in panel */}
				<main
					className={cn(
						'll:flex ll:justify-center ll:px-6 ll:pt-10 ll:pb-8 ll:sm:px-12 ll:sm:pt-14 ll:sm:pb-10',
						'll:short:pt-9 ll:short:pb-4.5',
						// Scrolls on its own beside the hero; on phones the page scrolls as usual. When an error
						// or validation line overflows a laptop-height panel: a thin, quiet scrollbar. Its space
						// is not reserved, which would narrow the panel all the time on Windows just to avoid a
						// reflow while an error shows.
						'll:overflow-x-clip ll:md:overflow-y-auto ll:[scrollbar-width:thin] ll:[scrollbar-color:var(--lumora-border)_transparent]'
					)}
				>
					{/* Desktop: fill the panel's height (spacers share out the spare). Capped so very tall
					    screens get a centred panel instead of oversized gaps. */}
					<div className="ll:flex ll:w-full ll:max-w-[440px] ll:flex-col ll:md:h-[min(100%,960px)] ll:md:self-center">
						{/* Sections fade up one after another, with a spacer between each */}
						{sections.map((section, index) => (
							<React.Fragment
								key={
									React.isValidElement(section)
										? section.key
										: index
								}
							>
								{index > 0 && (
									<Spacer
										weight={1}
										className="ll:min-h-[18px] ll:short:min-h-2"
									/>
								)}
								<div
									className="ll:flex ll:flex-col"
									style={{
										animation: fadeUpAnimation(index * 50)
									}}
								>
									{section}

									{/* Phone banner after the header, right above the platform selector */}
									{index === 0 && mobileHero && (
										<div className="ll:mt-[18px] ll:block ll:md:hidden">
											{mobileHero}
										</div>
									)}
								</div>
							</React.Fragment>
						))}

						{/* The footer sits apart: a larger minimum and three shares of the spare */}
						<Spacer
							weight={3}
							className="ll:min-h-10 ll:short:min-h-6"
						/>
						<div
							style={{
								animation: fadeUpAnimation(sections.length * 50)
							}}
						>
							{footer}
						</div>
					</div>
				</main>

				{/* Hero: the panel beside it scrolls on its own, so the hero stays in view */}
				<div className="ll:hidden ll:h-full ll:p-4 ll:pl-0 ll:md:block">
					{hero}
				</div>
			</div>
		</div>
	);
};

export default LoginContainer;
