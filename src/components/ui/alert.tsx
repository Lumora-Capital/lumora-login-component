import React from 'react';
import { CircleAlertIcon, XIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { THEME_TRANSITION_CLASS } from '../../utils/motion';

interface AlertProps {
	className?: string;
	children: React.ReactNode;
	// Adds a dismiss button
	onClose?: () => void;
}

/**
 * Error message (Nexa's Alert, destructive): icon, text and a close button, in the page's error colours
 */
export const Alert: React.FC<AlertProps> = ({
	className,
	children,
	onClose
}) => (
	<div
		role="alert"
		data-slot="alert"
		className={cn(
			'll:relative ll:flex ll:items-start ll:gap-3 ll:rounded-[10px] ll:border ll:border-error-border ll:bg-error-bg ll:px-4 ll:py-3 ll:font-body ll:text-[15px] ll:leading-normal ll:text-error-text',
			onClose && 'll:pr-11',
			THEME_TRANSITION_CLASS,
			className
		)}
	>
		<CircleAlertIcon
			aria-hidden
			className="ll:mt-0.5 ll:size-5 ll:shrink-0 ll:text-error-icon"
		/>
		<div className="ll:min-w-0 ll:flex-1">{children}</div>
		{onClose && (
			<button
				type="button"
				aria-label="Close"
				onClick={onClose}
				className="ll:absolute ll:top-2.5 ll:right-2.5 ll:inline-flex ll:size-7 ll:items-center ll:justify-center ll:rounded-md ll:text-error-text ll:opacity-80 ll:outline-none ll:hover:bg-error-text/10 ll:hover:opacity-100 ll:focus-visible:outline-2 ll:focus-visible:outline-accent"
			>
				<XIcon aria-hidden className="ll:size-4" />
			</button>
		)}
	</div>
);
