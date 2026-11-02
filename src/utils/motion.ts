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
	properties
		.map(property => `${property} ${COLOR_DURATION}ms ${COLOR_EASE}`)
		.join(', ');

// Colour changes when the theme or platform switches
export const THEME_TRANSITION = colorTransition(
	'background-color',
	'border-color',
	'color',
	'box-shadow'
);

// THEME_TRANSITION as utilities, for elements styled with classes
export const THEME_TRANSITION_CLASS =
	'll:transition-[background-color,border-color,color,box-shadow] ll:duration-[350ms] ll:ease-[cubic-bezier(0.4,0,0.2,1)]';

// Logo shapes recolour through CSS variables, which do not animate; their fill and stroke do
export const SVG_TRANSITION = colorTransition('fill', 'stroke');

// Light / dark switch: colours change in one frame (the data-mode-switching rule in styles.css). A
// light and a dark palette are inverses, so any fade between them passes a moment where text and
// background are the same colour, and clicking the toggle mid-fade strands them there. Only motion
// that keeps text legible (the toggle's sun and moon turning) still animates.

// Keyframes, declared in src/styles.css
// Text and cards rising into place
export const fadeUp = 'lumora-fade-up';

// Platform screenshot sliding in from the bottom-right
export const slideInFrame = 'lumora-slide-in-frame';

// Stacked windows on the default hero rising from below
export const riseIn = 'lumora-rise-in';

/**
 * Animation shorthand for an element that fades up, after a delay
 * @param delay - Delay in milliseconds, used to stagger siblings
 * @param duration - Duration in milliseconds
 * @returns CSS animation value
 */
export const fadeUpAnimation = (delay = 0, duration = 500): string =>
	`${fadeUp} ${duration}ms ${EASE_OUT} ${delay}ms both`;
