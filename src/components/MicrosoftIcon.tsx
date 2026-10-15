import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

interface MicrosoftIconProps extends SvgIconProps {
	// Draw all four squares in currentColor instead of the brand colours
	monochrome?: boolean;
}

/**
 * Microsoft four-square logo (not available in @mui/icons-material)
 */
const MicrosoftIcon: React.FC<MicrosoftIconProps> = ({ monochrome = false, ...props }) => (
	<SvgIcon {...props} viewBox="0 0 23 23">
		<path fill={monochrome ? 'currentColor' : '#f35325'} d="M1 1h10v10H1z" />
		<path fill={monochrome ? 'currentColor' : '#81bc06'} d="M12 1h10v10H12z" />
		<path fill={monochrome ? 'currentColor' : '#05a6f0'} d="M1 12h10v10H1z" />
		<path fill={monochrome ? 'currentColor' : '#ffba08'} d="M12 12h10v10H12z" />
	</SvgIcon>
);

export default MicrosoftIcon;
