import React from 'react';

// Angles of the eight rays, clockwise from the top
const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * Filled sun: a solid disc with eight rounded rays, drawn in currentColor
 */
const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
	<svg
		viewBox="0 0 24 24"
		width="1em"
		height="1em"
		aria-hidden
		focusable="false"
		{...props}
	>
		<circle cx="12" cy="12" r="4.6" fill="currentColor" />
		{RAY_ANGLES.map(angle => (
			<line
				key={angle}
				x1="12"
				y1="2.6"
				x2="12"
				y2="4.6"
				stroke="currentColor"
				strokeWidth="1.9"
				strokeLinecap="round"
				transform={`rotate(${angle} 12 12)`}
			/>
		))}
	</svg>
);

export default SunIcon;
