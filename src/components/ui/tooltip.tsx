import React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

interface TooltipProps {
	title: string;
	// Font of the tooltip text: it renders in a portal, outside the page's font variables
	fontFamily?: string;
	children: React.ReactElement;
}

/**
 * Hover / focus label (Radix Tooltip), in Nexa's tooltip colours (--ui-tooltip-bg / -fg)
 */
export const Tooltip: React.FC<TooltipProps> = ({
	title,
	fontFamily,
	children
}) => (
	<TooltipPrimitive.Provider delayDuration={300}>
		<TooltipPrimitive.Root>
			<TooltipPrimitive.Trigger asChild>
				{children}
			</TooltipPrimitive.Trigger>
			<TooltipPrimitive.Portal>
				<TooltipPrimitive.Content
					sideOffset={6}
					style={{ fontFamily }}
					className="ll:z-[1500] ll:rounded-md ll:bg-tooltip ll:px-2 ll:py-1 ll:text-[12px] ll:font-medium ll:text-tooltip-foreground ll:shadow-md"
				>
					{title}
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Portal>
		</TooltipPrimitive.Root>
	</TooltipPrimitive.Provider>
);
