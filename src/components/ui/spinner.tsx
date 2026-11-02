import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SpinnerProps {
	className?: string;
	// Announced name; null when the button around it already says what is happening
	label?: string | null;
}

/**
 * The busy indicator (Nexa's Spinner; MUI CircularProgress before). Drawn in currentColor.
 */
export const Spinner: React.FC<SpinnerProps> = ({
	className,
	label = 'Loading'
}) => (
	<Loader2Icon
		role={label ? 'status' : undefined}
		aria-label={label ?? undefined}
		aria-hidden={label ? undefined : true}
		className={cn('ll:size-4 ll:animate-spin', className)}
	/>
);
