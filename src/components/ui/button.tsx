import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { CONTROL_HEIGHT } from '../../utils/loginTheme';
import { THEME_TRANSITION_CLASS } from '../../utils/motion';

/**
 * The login page's button, in the shadcn/ui pattern Nexa's Button follows. Colours come from the
 * page's accent (the selected platform's colour), so every variant follows the platform and mode.
 */
const buttonVariants = cva(
	[
		'll:inline-flex ll:shrink-0 ll:items-center ll:justify-center ll:gap-2 ll:rounded-[10px] ll:font-heading ll:font-semibold ll:whitespace-nowrap',
		'll:outline-none ll:focus-visible:outline-2 ll:focus-visible:outline-offset-2 ll:focus-visible:outline-accent',
		'll:disabled:cursor-default',
		'll:[&_svg]:pointer-events-none ll:[&_svg]:shrink-0',
		THEME_TRANSITION_CLASS
	],
	{
		variants: {
			variant: {
				// Filled accent (Magic Link)
				default:
					'll:bg-accent ll:text-accent-foreground ll:hover:bg-accent-hover ll:disabled:bg-accent ll:disabled:opacity-60',
				// Provider buttons (Google, Microsoft)
				outline:
					'll:w-full ll:border ll:border-line ll:bg-surface ll:px-4 ll:text-[15px] ll:text-heading ll:hover:border-accent ll:disabled:border-line ll:disabled:text-muted ll:disabled:hover:border-line',
				// Accent hairline (passkey, back to sign in): uppercase and letter-spaced, as before
				'outline-accent':
					'll:w-full ll:border-[1.5px] ll:border-accent ll:bg-surface ll:px-4 ll:text-[13px] ll:tracking-[0.14em] ll:text-accent ll:uppercase ll:hover:border-accent-hover ll:hover:bg-accent/6 ll:disabled:border-line ll:disabled:text-muted ll:disabled:hover:bg-surface',
				// Accent label, no box (Try Again)
				ghost: 'll:px-2 ll:py-1.5 ll:text-[15px] ll:text-accent ll:hover:bg-accent/6'
			},
			size: {
				control: CONTROL_HEIGHT,
				auto: ''
			}
		},
		defaultVariants: { variant: 'default', size: 'control' }
	}
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, type = 'button', ...props }, ref) => (
		<button
			ref={ref}
			type={type}
			data-slot="button"
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		/>
	)
);
Button.displayName = 'Button';
