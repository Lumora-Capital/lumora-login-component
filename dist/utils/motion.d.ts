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
export declare const SVG_TRANSITION: string;
export declare const fadeUp: {
    name: string;
    styles: string;
    anim: 1;
    toString: () => string;
} & string;
export declare const slideInFrame: {
    name: string;
    styles: string;
    anim: 1;
    toString: () => string;
} & string;
export declare const riseIn: {
    name: string;
    styles: string;
    anim: 1;
    toString: () => string;
} & string;
/**
 * Animation shorthand for an element that fades up, after a delay
 * @param delay - Delay in milliseconds, used to stagger siblings
 * @param duration - Duration in milliseconds
 * @returns CSS animation value
 */
export declare const fadeUpAnimation: (delay?: number, duration?: number) => string;
export declare const REDUCED_MOTION_SX: {
    readonly '@media (prefers-reduced-motion: reduce)': {
        readonly '& *, & *::before, & *::after': {
            readonly animationDuration: "1ms !important";
            readonly animationDelay: "0ms !important";
            readonly transitionDuration: "1ms !important";
        };
    };
};
//# sourceMappingURL=motion.d.ts.map