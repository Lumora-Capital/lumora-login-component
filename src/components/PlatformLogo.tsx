import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';
import { PlatformId } from '../types';
import { SVG_TRANSITION } from '../utils/motion';

interface PlatformLogoProps extends SvgIconProps {
	platform: PlatformId;
}

// Paint for each part of a mark. The CSS variables let the selector and hero chips recolour
// the marks (white on a filled tab); without them the brand colours of public/*-logo.svg show.
// Main colour of the mark
const primary = (brand: string) => `var(--mark-primary, ${brand})`;
// Centra's second, grey tone
const SECONDARY = 'var(--mark-secondary, #3D4C5E)';
// Xpdite's centre node: its fill, and the ring around it that separates it from the lines
const centerFill = (brand: string) => `var(--mark-center, ${brand})`;
const CENTER_RING = 'var(--mark-ring, #ffffff)';

/**
 * Centra, Xpdite and Polymer marks, inlined from public/*-logo.svg
 * so apps using the library need no asset files
 */
const PlatformLogo: React.FC<PlatformLogoProps> = ({
	platform,
	sx,
	...rest
}) => {
	// Shapes fade to their new colours (white on a selected tab) with the highlight
	const props: SvgIconProps = {
		...rest,
		sx: [
			{ '& *': { transition: SVG_TRANSITION } },
			...(Array.isArray(sx) ? sx : [sx])
		]
	};

	// Centra: two-tone ring around a dot with a bar
	if (platform === 'centra') {
		const fill = { fill: primary('#049586') };
		return (
			<SvgIcon {...props} viewBox="0 0 30 30">
				<path
					style={fill}
					d="M5.60529 3.14542C4.00282 4.40644 2.68044 5.98728 1.72234 7.78732C0.764232 9.58735 0.191389 11.5671 0.0402716 13.6007C-0.110846 15.6342 0.163072 17.6769 0.844589 19.5988C1.52611 21.5207 2.60029 23.2796 3.99877 24.7637L7.18245 21.7635C6.20044 20.7214 5.44614 19.4863 4.96758 18.1368C4.48902 16.7872 4.29667 15.3528 4.40279 13.9249C4.5089 12.4969 4.91115 11.1067 5.58393 9.84273C6.25672 8.57874 7.18529 7.46868 8.31054 6.58319L5.60529 3.14542Z"
				/>
				<path
					style={{ fill: SECONDARY }}
					d="M27.6715 7.81562C25.8485 4.37255 22.7324 1.79469 19.0087 0.649137C15.2851 -0.496418 11.2588 -0.115827 7.81575 1.70718L9.86273 5.57326C12.2805 4.29314 15.1077 4.02589 17.7225 4.8303C20.3372 5.63471 22.5253 7.44488 23.8055 9.86261L27.6715 7.81562Z"
				/>
				<path
					style={{ fill: SECONDARY }}
					d="M5.52492 3.20912C3.27824 5.00262 1.60718 7.41593 0.718835 10.15L4.87928 11.5018C5.50308 9.58194 6.67649 7.88731 8.25411 6.62792L5.52492 3.20912Z"
				/>
				<path
					style={fill}
					d="M5.89004 26.4517C7.43504 27.6075 9.19261 28.4476 11.0624 28.924C12.9321 29.4004 14.8774 29.5038 16.7871 29.2283C18.6968 28.9528 20.5336 28.3037 22.1924 27.3182C23.8512 26.3327 25.2996 25.03 26.4549 23.4846L22.9511 20.8653C22.1399 21.9505 21.1228 22.8653 19.958 23.5573C18.7932 24.2493 17.5034 24.7051 16.1624 24.8986C14.8214 25.0921 13.4554 25.0195 12.1425 24.6849C10.8296 24.3504 9.5954 23.7605 8.5105 22.9488L5.89004 26.4517Z"
				/>
				<rect
					style={fill}
					x="18.9181"
					y="13.7375"
					width="10.4612"
					height="2.44368"
				/>
				<path
					style={fill}
					d="M14.6851 9.76587C17.5534 9.76607 19.8784 12.0918 19.8784 14.9602C19.8782 17.8285 17.5533 20.1534 14.6851 20.1536C11.8166 20.1536 9.49092 17.8286 9.49072 14.9602C9.49072 12.0917 11.8165 9.76587 14.6851 9.76587ZM14.689 11.3313C12.6824 11.3314 11.0554 12.9576 11.0552 14.9641C11.0552 16.9708 12.6823 18.5978 14.689 18.5979C16.6957 18.5979 18.3228 16.9708 18.3228 14.9641C18.3226 12.9575 16.6956 11.3313 14.689 11.3313Z"
				/>
			</SvgIcon>
		);
	}

	// Xpdite: crossed lines with a node at each end and a ring at the top-right
	if (platform === 'xpdite') {
		const fill = { fill: primary('#0F62B0') };
		return (
			<SvgIcon {...props} viewBox="0 0 30 30">
				<rect
					style={fill}
					x="21.4259"
					y="23.6411"
					width="22.6887"
					height="2.05928"
					transform="rotate(-134.2 21.4259 23.6411)"
				/>
				<rect
					style={fill}
					width="25.3429"
					height="2.05928"
					transform="matrix(-0.73373 0.679441 0.679441 0.73373 22.6707 5.96777)"
				/>
				<circle style={fill} cx="24.063" cy="24.9252" r="3.42298" />
				<circle style={fill} cx="4.44975" cy="24.9252" r="3.42298" />
				<circle style={fill} cx="4.44975" cy="4.45204" r="3.42298" />
				<circle
					style={{ fill: centerFill('#0F62B0'), stroke: CENTER_RING }}
					cx="14.1725"
					cy="14.5849"
					r="3.18086"
					strokeWidth="1.33541"
				/>
				<circle
					style={{ fill: 'none', stroke: primary('#0F62B0') }}
					cx="3.42298"
					cy="3.42298"
					r="2.75528"
					strokeWidth="1.33541"
					transform="matrix(-0.982613 -0.185667 -0.185667 0.982613 29.7455 2.17871)"
				/>
			</SvgIcon>
		);
	}

	// Polymer: a filled hexagon linked to two outlined ones
	const fill = { fill: primary('#03463F') };
	const outline = { fill: 'none', stroke: primary('#03463F') };
	return (
		<SvgIcon {...props} viewBox="0 0 30 30">
			<rect
				style={fill}
				x="9.06116"
				y="16.5654"
				width="5.27176"
				height="1.26303"
				transform="rotate(-49.64 9.06116 16.5654)"
			/>
			<rect
				style={fill}
				x="16.2911"
				y="12.8135"
				width="5.27176"
				height="1.26303"
				transform="rotate(49.64 16.2911 12.8135)"
			/>
			<path
				style={outline}
				strokeWidth="1.33541"
				d="M8.99036 16.9846V21.3899L5.1759 23.592L1.36145 21.3899V16.9846L5.1759 14.7825L8.99036 16.9846Z"
			/>
			<path
				style={outline}
				strokeWidth="1.33541"
				d="M27.9268 17.259V21.6643L24.1123 23.8665L20.2979 21.6643V17.259L24.1123 15.0569L27.9268 17.259Z"
			/>
			<path
				style={fill}
				d="M14.7128 4.64917L19.195 7.237V12.4127L14.7128 15.0005L10.2305 12.4127V7.237L14.7128 4.64917Z"
			/>
		</SvgIcon>
	);
};

export default PlatformLogo;
