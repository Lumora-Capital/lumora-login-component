import React from 'react';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';

interface SignInOptionButtonProps {
	icon: React.ReactNode;
	label: string;
	// Accessible name when the visible label is short (e.g. "Google")
	ariaLabel?: string;
	loadingLabel?: string;
	isLoading?: boolean;
	disabled?: boolean;
	onClick: () => void;
}

/**
 * Outlined provider button (Google, Microsoft)
 */
const SignInOptionButton: React.FC<SignInOptionButtonProps> = ({
	icon,
	label,
	ariaLabel,
	loadingLabel = 'Signing in...',
	isLoading = false,
	disabled = false,
	onClick
}) => (
	<Button
		variant="outline"
		aria-label={isLoading ? loadingLabel : ariaLabel}
		onClick={onClick}
		disabled={disabled}
		className="ll:[&_svg]:text-[20px]"
	>
		{isLoading ? <Spinner label={null} className="ll:size-[18px]" /> : icon}
		{isLoading ? loadingLabel : label}
	</Button>
);

export default SignInOptionButton;
