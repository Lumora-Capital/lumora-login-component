import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

/**
 * Microsoft four-square logo (not available in @mui/icons-material)
 */
const MicrosoftIcon: React.FC<SvgIconProps> = props => (
	<SvgIcon {...props} viewBox="0 0 23 23">
		<path fill="#f35325" d="M1 1h10v10H1z" />
		<path fill="#81bc06" d="M12 1h10v10H12z" />
		<path fill="#05a6f0" d="M1 12h10v10H1z" />
		<path fill="#ffba08" d="M12 12h10v10H12z" />
	</SvgIcon>
);

export default MicrosoftIcon;
