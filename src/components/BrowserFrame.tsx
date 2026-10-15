import React from 'react';
import { Box } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface BrowserFrameProps {
	// Name shown in the placeholder's app header
	title: string;
	// Title bar colour
	barColor: string;
	// Dashboard artwork URL. It draws its own window (title bar, dots, rounded corners),
	// so it is shown as is; without one a placeholder window is drawn
	screenshot?: string;
	// Smaller title bar and placeholder for the stacked frames on the default hero
	compact?: boolean;
	sx?: SxProps<Theme>;
}

// Faint bar standing in for a line of text in the placeholder
const SkeletonLine: React.FC<{ width: string | number; height?: number }> = ({
	width,
	height = 6
}) => (
	<Box
		sx={{
			width,
			height,
			borderRadius: 1,
			backgroundColor: 'rgba(18, 51, 45, 0.09)'
		}}
	/>
);

/**
 * Product window for the hero: the supplied dashboard artwork, or until one is supplied
 * a placeholder browser window with a coloured title bar and three dots
 */
const BrowserFrame: React.FC<BrowserFrameProps> = ({
	title,
	barColor,
	screenshot,
	compact = false,
	sx
}) => {
	const barHeight = compact ? 22 : 40;
	const dotSize = compact ? 6 : 12;

	// Supplied artwork already includes its window, so it needs no frame of its own
	if (screenshot) {
		return (
			<Box
				component="img"
				src={screenshot}
				alt={`${title} dashboard`}
				sx={[
					{
						display: 'block',
						minWidth: 0,
						// Pinned to the top-left; the hero clips the right and bottom
						objectFit: 'cover',
						objectPosition: 'top left',
						// Follows the artwork's rounded corners, unlike box-shadow
						filter: 'drop-shadow(0 24px 40px rgba(8, 28, 24, 0.22))'
					},
					...(Array.isArray(sx) ? sx : [sx])
				]}
			/>
		);
	}

	return (
		<Box
			sx={[
				{
					display: 'flex',
					flexDirection: 'column',
					borderRadius: compact ? '8px' : '14px',
					overflow: 'hidden',
					backgroundColor: '#ffffff',
					boxShadow: '0 24px 60px rgba(8, 28, 24, 0.22)'
				},
				...(Array.isArray(sx) ? sx : [sx])
			]}
		>
			{/* Title bar */}
			<Box
				sx={{
					height: barHeight,
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					gap: compact ? '4px' : '8px',
					px: compact ? 1 : 2,
					backgroundColor: barColor
				}}
			>
				{[0, 1, 2].map(dot => (
					<Box
						key={dot}
						sx={{
							width: dotSize,
							height: dotSize,
							borderRadius: '50%',
							backgroundColor: 'rgba(255, 255, 255, 0.55)'
						}}
					/>
				))}
			</Box>

			{/* Screen */}
			<Box sx={{ flex: 1, minHeight: 0, position: 'relative', backgroundColor: '#f7f9f9' }}>
				{/* Placeholder app screen */}
				<Box
					data-testid="screenshot-placeholder"
					sx={{ p: compact ? 1.25 : 3.5, display: 'flex', flexDirection: 'column', gap: compact ? 1 : 2 }}
				>
					{/* App header: platform name and user avatar */}
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Box
							sx={{
								fontSize: compact ? 9 : 18,
								fontWeight: 600,
								letterSpacing: compact ? '0.18em' : 0,
								textTransform: compact ? 'uppercase' : 'none',
								color: '#12332d'
							}}
						>
							{title}
						</Box>
						<Box
							sx={{
								width: compact ? 12 : 24,
								height: compact ? 12 : 24,
								borderRadius: '50%',
								backgroundColor: barColor,
								opacity: 0.8
							}}
						/>
					</Box>
					<SkeletonLine width="22%" height={compact ? 4 : 6} />

					{/* Card grid */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: 'repeat(3, 1fr)',
							gap: compact ? 0.75 : 2,
							mt: compact ? 0.5 : 1
						}}
					>
						{Array.from({ length: 6 }).map((_, card) => (
							<Box
								key={card}
								sx={{
									p: compact ? 0.75 : 2,
									borderRadius: compact ? '4px' : '10px',
									backgroundColor: '#ffffff',
									border: '1px solid rgba(18, 51, 45, 0.08)',
									borderTop: `${compact ? 2 : 3}px solid ${barColor}`,
									display: 'flex',
									flexDirection: 'column',
									gap: compact ? 0.5 : 1
								}}
							>
								<SkeletonLine width="70%" height={compact ? 4 : 7} />
								<SkeletonLine width="45%" height={compact ? 3 : 5} />
								<SkeletonLine width="85%" height={compact ? 3 : 5} />
								<SkeletonLine width="60%" height={compact ? 3 : 5} />
							</Box>
						))}
					</Box>

					{/* Marks this as a stand-in until the real screenshot is added */}
					{!compact && (
						<Box
							sx={{
								alignSelf: 'flex-start',
								mt: 1,
								px: 1.5,
								py: 0.5,
								borderRadius: 999,
								border: '1px dashed rgba(18, 51, 45, 0.3)',
								fontSize: 12,
								color: 'rgba(18, 51, 45, 0.6)'
							}}
						>
							{title} screenshot placeholder
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default BrowserFrame;
