import React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';
import { cn } from '../../lib/utils';

// Section label ("Where would you like to start?", "Work email"): small, bold, uppercase, letter-spaced
export const sectionLabelClassName =
	'll:block ll:font-body ll:text-[12px] ll:font-bold ll:tracking-[0.14em] ll:uppercase ll:text-label';

/**
 * Form label (Radix Label, as Nexa's), in the section label style
 */
export const Label: React.FC<
	React.ComponentProps<typeof LabelPrimitive.Root>
> = ({ className, ...props }) => (
	<LabelPrimitive.Root
		data-slot="label"
		className={cn(sectionLabelClassName, className)}
		{...props}
	/>
);
