import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

// Angles of the eight rays, clockwise from the top
const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * Filled sun: a solid disc with eight rounded rays, drawn in currentColor
 */
const SunIcon: React.FC<SvgIconProps> = props => (
	<SvgIcon {...props} viewBox="0 0 24 24">
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
	</SvgIcon>
);

export default SunIcon;
