export declare const EASE_OUT = "cubic-bezier(0.2, 0.7, 0.2, 1)";
export declare const COLOR_DURATION = 350;
export declare const COLOR_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
/**
 * Transition shorthand that changes the given properties on the shared colour timing
 * @param properties - CSS properties to transition
 * @returns CSS transition value
 */
export declare const colorTransition: (...properties: string[]) => string;
export declare const THEME_TRANSITION: string;
export declare const THEME_TRANSITION_CLASS = "ll:transition-[background-color,border-color,color,box-shadow] ll:duration-[350ms] ll:ease-[cubic-bezier(0.4,0,0.2,1)]";
export declare const SVG_TRANSITION: string;
export declare const fadeUp = "lumora-fade-up";
export declare const slideInFrame = "lumora-slide-in-frame";
export declare const riseIn = "lumora-rise-in";
/**
 * Animation shorthand for an element that fades up, after a delay
 * @param delay - Delay in milliseconds, used to stagger siblings
 * @param duration - Duration in milliseconds
 * @returns CSS animation value
 */
export declare const fadeUpAnimation: (delay?: number, duration?: number) => string;
//# sourceMappingURL=motion.d.ts.map