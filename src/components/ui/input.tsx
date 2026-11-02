import React from 'react';
import { cn } from '../../lib/utils';
import { CONTROL_HEIGHT } from '../../utils/loginTheme';

/**
 * The field box (Nexa's Input): Nexa's input tokens for the fill, outline, text and placeholder, the
 * page accent for focus. At the sign-in panel's control height.
 */
const inputClassName = cn(
	'll:flex ll:w-full ll:min-w-0 ll:rounded-[10px] ll:border ll:border-input ll:bg-input-bg ll:px-4 ll:font-body ll:text-[16px] ll:text-input-foreground ll:outline-none',
	'll:transition-[background-color,border-color,color,box-shadow] ll:duration-[350ms] ll:ease-[cubic-bezier(0.4,0,0.2,1)]',
	'll:placeholder:text-placeholder ll:placeholder:opacity-100 ll:hover:border-input-hover',
	'll:focus-visible:border-accent ll:focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--lumora-accent)_15%,transparent)]',
	'll:disabled:cursor-not-allowed ll:disabled:border-dashed ll:disabled:border-input-disabled-border ll:disabled:bg-input-disabled ll:disabled:text-input-disabled-foreground',
	'll:aria-invalid:border-destructive ll:aria-invalid:hover:border-destructive',
	CONTROL_HEIGHT
);

export const Input = React.forwardRef<
	HTMLInputElement,
	React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
	<input
		ref={ref}
		type={type}
		data-slot="input"
		className={cn(inputClassName, className)}
		{...props}
	/>
));
Input.displayName = 'Input';
