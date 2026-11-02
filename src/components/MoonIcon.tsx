import React, { useId } from 'react';

/**
 * Filled crescent moon: a solid disc with a round bite out of its top-right, drawn in currentColor
 */
const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => {
	// Unique per instance so two icons on a page do not share a mask
	const maskId = `lumora-moon-${useId()}`;

	return (
		<svg
			viewBox="0 0 24 24"
			width="1em"
			height="1em"
			aria-hidden
			focusable="false"
			{...props}
		>
			<mask id={maskId}>
				<rect width="24" height="24" fill="#fff" />
				<circle cx="15.8" cy="8.2" r="4.6" fill="#000" />
			</mask>
			<circle
				cx="12"
				cy="12"
				r="7.5"
				fill="currentColor"
				mask={`url(#${maskId})`}
			/>
		</svg>
	);
};

export default MoonIcon;
