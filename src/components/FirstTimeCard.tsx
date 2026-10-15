import React from 'react';
import { Box } from '@mui/material';
import { LoginTheme, SHORT_SCREEN } from '../utils/loginTheme';
import { THEME_TRANSITION } from '../utils/motion';

interface FirstTimeCardProps {
	theme: LoginTheme;
	title: string;
	steps: string[];
}

/**
 * "First time here?" card with numbered onboarding steps
 */
const FirstTimeCard: React.FC<FirstTimeCardProps> = ({ theme, title, steps }) => (
	<Box
		component="section"
		aria-labelledby="lumora-first-time-title"
		sx={{
			px: 2.5,
			py: 2,
			[SHORT_SCREEN]: { py: 1.25 },
			borderRadius: '12px',
			border: `1px solid ${theme.border}`,
			backgroundColor: theme.surface,
			transition: THEME_TRANSITION,
			'& *': { transition: THEME_TRANSITION }
		}}
	>
		<Box
			component="h2"
			id="lumora-first-time-title"
			sx={{
				m: 0,
				fontFamily: theme.bodyFont,
				fontSize: 18,
				fontWeight: 600,
				color: theme.heading
			}}
		>
			{title}
		</Box>

		<Box
			component="ol"
			sx={{
				m: 0,
				mt: 1.25,
				p: 0,
				listStyle: 'none',
				display: 'grid',
				gap: 1,
				[SHORT_SCREEN]: { mt: 1, gap: 0.75 }
			}}
		>
			{steps.map((step, index) => (
				<Box
					component="li"
					key={step}
					sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: 14.5, color: theme.label }}
				>
					<Box
						aria-hidden
						sx={{
							flexShrink: 0,
							width: 24,
							height: 24,
							borderRadius: '50%',
							border: `1px solid ${theme.divider}`,
							display: 'grid',
							placeItems: 'center',
							fontSize: 12,
							fontWeight: 600,
							color: theme.brandText
						}}
					>
						{index + 1}
					</Box>
					{step}
				</Box>
			))}
		</Box>
	</Box>
);

export default FirstTimeCard;
