import React, { useId } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

/**
 * Filled crescent moon: a solid disc with a round bite out of its top-right, drawn in currentColor
 */
const MoonIcon: React.FC<SvgIconProps> = props => {
	// Unique per instance so two icons on a page do not share a mask
	const maskId = `lumora-moon-${useId()}`;

	return (
		<SvgIcon {...props} viewBox="0 0 24 24">
			<mask id={maskId}>
				<rect width="24" height="24" fill="#fff" />
				<circle cx="15.8" cy="8.2" r="4.6" fill="#000" />
			</mask>
			<circle cx="12" cy="12" r="7.5" fill="currentColor" mask={`url(#${maskId})`} />
		</SvgIcon>
	);
};

export default MoonIcon;
