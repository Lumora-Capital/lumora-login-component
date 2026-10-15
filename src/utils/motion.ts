import { keyframes } from '@emotion/react';

// Easing for everything that moves: quick start, soft landing
export const EASE_OUT = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

// One timing for every colour change, matched to the selector highlight's slide, so a
// theme or platform switch arrives everywhere at the same moment
export const COLOR_DURATION = 350;
export const COLOR_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

/**
 * Transition shorthand that changes the given properties on the shared colour timing
 * @param properties - CSS properties to transition
 * @returns CSS transition value
 */
export const colorTransition = (...properties: string[]): string =>
	properties.map(property => `${property} ${COLOR_DURATION}ms ${COLOR_EASE}`).join(', ');

// Colour changes when the theme or platform switches
export const THEME_TRANSITION = colorTransition(
	'background-color',
	'border-color',
	'color',
	'box-shadow'
);

// Logo shapes recolour through CSS variables, which do not animate; their fill and stroke do
export const SVG_TRANSITION = colorTransition('fill', 'stroke');


// Text and cards rising into place
export const fadeUp = keyframes`
	from {
		opacity: 0;
		transform: translateY(12px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`;

// Platform screenshot sliding in from the bottom-right
export const slideInFrame = keyframes`
	from {
		opacity: 0;
		transform: translate(16px, 16px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`;

// Stacked windows on the default hero rising from below
export const riseIn = keyframes`
	from {
		opacity: 0;
		transform: translateY(24px);
	}
	to {
		opacity: 1;
		transform: none;
	}
`;

/**
 * Animation shorthand for an element that fades up, after a delay
 * @param delay - Delay in milliseconds, used to stagger siblings
 * @param duration - Duration in milliseconds
 * @returns CSS animation value
 */
export const fadeUpAnimation = (delay = 0, duration = 500): string =>
	`${fadeUp} ${duration}ms ${EASE_OUT} ${delay}ms both`;

// Turns motion off for users who ask their system for reduced motion
export const REDUCED_MOTION_SX = {
	'@media (prefers-reduced-motion: reduce)': {
		'& *, & *::before, & *::after': {
			animationDuration: '1ms !important',
			animationDelay: '0ms !important',
			transitionDuration: '1ms !important'
		}
	}
} as const;
