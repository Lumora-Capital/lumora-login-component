import React from 'react';
import { cn } from '../lib/utils';

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
	className?: string;
	style?: React.CSSProperties;
}

// Faint bar standing in for a line of text in the placeholder
const SkeletonLine: React.FC<{ width: string; height: number }> = ({
	width,
	height
}) => (
	<div
		className="ll:rounded-[4px] ll:bg-[rgba(18,51,45,0.09)]"
		style={{ width, height }}
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
	className,
	style
}) => {
	const barHeight = compact ? 22 : 40;
	const dotSize = compact ? 6 : 12;

	// Supplied artwork already includes its window, so it needs no frame of its own
	if (screenshot) {
		return (
			<img
				src={screenshot}
				alt={`${title} dashboard`}
				className={cn(
					// Pinned to the top-left; the hero clips the right and bottom. The drop shadow follows the
					// artwork's rounded corners, unlike box-shadow
					'll:block ll:min-w-0 ll:object-cover ll:object-top-left ll:drop-shadow-[0_24px_40px_rgba(8,28,24,0.22)]',
					className
				)}
				style={style}
			/>
		);
	}

	return (
		<div
			className={cn(
				'll:flex ll:flex-col ll:overflow-hidden ll:bg-white ll:shadow-[0_24px_60px_rgba(8,28,24,0.22)]',
				compact ? 'll:rounded-[8px]' : 'll:rounded-[14px]',
				className
			)}
			style={style}
		>
			{/* Title bar */}
			<div
				className={cn(
					'll:flex ll:shrink-0 ll:items-center',
					compact ? 'll:gap-1 ll:px-2' : 'll:gap-2 ll:px-4'
				)}
				style={{ height: barHeight, backgroundColor: barColor }}
			>
				{[0, 1, 2].map(dot => (
					<div
						key={dot}
						className="ll:rounded-full ll:bg-white/55"
						style={{ width: dotSize, height: dotSize }}
					/>
				))}
			</div>

			{/* Screen */}
			<div className="ll:relative ll:min-h-0 ll:flex-1 ll:bg-[#f7f9f9]">
				{/* Placeholder app screen */}
				<div
					data-testid="screenshot-placeholder"
					className={cn(
						'll:flex ll:flex-col',
						compact ? 'll:gap-2 ll:p-2.5' : 'll:gap-4 ll:p-7'
					)}
				>
					{/* App header: platform name and user avatar */}
					<div className="ll:flex ll:items-center ll:justify-between">
						<div
							className={cn(
								'll:font-semibold ll:text-[#12332d]',
								compact
									? 'll:text-[9px] ll:tracking-[0.18em] ll:uppercase'
									: 'll:text-[18px]'
							)}
						>
							{title}
						</div>
						<div
							className={cn(
								'll:rounded-full ll:opacity-80',
								compact ? 'll:size-3' : 'll:size-6'
							)}
							style={{ backgroundColor: barColor }}
						/>
					</div>
					<SkeletonLine width="22%" height={compact ? 4 : 6} />

					{/* Card grid */}
					<div
						className={cn(
							'll:grid ll:grid-cols-3',
							compact ? 'll:mt-1 ll:gap-1.5' : 'll:mt-2 ll:gap-4'
						)}
					>
						{Array.from({ length: 6 }).map((_, card) => (
							<div
								key={card}
								className={cn(
									'll:flex ll:flex-col ll:border ll:border-[rgba(18,51,45,0.08)] ll:bg-white',
									compact
										? 'll:gap-1 ll:rounded-[4px] ll:p-1.5'
										: 'll:gap-2 ll:rounded-[10px] ll:p-4'
								)}
								style={{
									borderTop: `${compact ? 2 : 3}px solid ${barColor}`
								}}
							>
								<SkeletonLine
									width="70%"
									height={compact ? 4 : 7}
								/>
								<SkeletonLine
									width="45%"
									height={compact ? 3 : 5}
								/>
								<SkeletonLine
									width="85%"
									height={compact ? 3 : 5}
								/>
								<SkeletonLine
									width="60%"
									height={compact ? 3 : 5}
								/>
							</div>
						))}
					</div>

					{/* Marks this as a stand-in until the real screenshot is added */}
					{!compact && (
						<div className="ll:mt-2 ll:self-start ll:rounded-full ll:border ll:border-dashed ll:border-[rgba(18,51,45,0.3)] ll:px-3 ll:py-1 ll:text-[12px] ll:text-[rgba(18,51,45,0.6)]">
							{title} screenshot placeholder
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default BrowserFrame;
