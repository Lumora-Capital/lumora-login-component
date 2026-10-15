import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { LoginTheme, SHORT_SCREEN } from '../utils/loginTheme';
import {
	REDUCED_MOTION_SX,
	THEME_TRANSITION,
	fadeUpAnimation
} from '../utils/motion';

// The layout is sized in 8px spacing units; the host's theme may use another unit (Nexa uses 4)
const LUMORA_SPACING = createTheme({ spacing: 8 }).spacing;

// Largest the login layout grows; bigger screens get page background around it
const LAYOUT_MAX_WIDTH = 1760;
const LAYOUT_MAX_HEIGHT = 1120;

interface SpacerProps {
	// Share of the panel's spare height this gap takes
	weight: number;
	// Smallest gap, and its value on laptop-height screens
	minHeight: number;
	minHeightShort: number;
}

/**
 * Gap between panel sections. When the panel is taller than its content, the spare height
 * is shared out by weight, so the gaps grow together instead of one hole opening up.
 */
const Spacer: React.FC<SpacerProps> = ({
	weight,
	minHeight,
	minHeightShort
}) => (
	<Box
		aria-hidden
		sx={{
			flex: `${weight} 1 0px`,
			minHeight,
			[SHORT_SCREEN]: { minHeight: minHeightShort }
		}}
	/>
);

interface LoginContainerProps {
	theme: LoginTheme;
	// Left column: branding and sign-in methods, one section per child
	children: React.ReactNode;
	// Pinned to the bottom of the left column
	footer: React.ReactNode;
	// Right column, hidden below the md breakpoint
	hero: React.ReactNode;
	// Banner shown after the first section on phones and tablets, in place of the hero
	mobileHero?: React.ReactNode;
}

/**
 * Full-page split layout: sign-in panel on the left, hero on the right
 */
const LoginContainer: React.FC<LoginContainerProps> = ({
	theme,
	children,
	footer,
	hero,
	mobileHero
}) => {
	// Keys from toArray follow each child's slot, so a section appearing later (an error)
	// mounts and fades up on its own without remounting the others
	const sections = React.Children.toArray(children);

	// The host's theme (MUI's default when the host has none) with the 8px unit swapped in.
	// An object, not a function: MUI warns about a theme function with no outer theme.
	const hostTheme = useTheme();
	const lumoraTheme = useMemo(
		() => ({ ...hostTheme, spacing: LUMORA_SPACING }),
		[hostTheme]
	);

	return (
		// Own spacing unit, so the layout looks the same in every host app.
		// Full-width page background; the layout inside is capped and centred on wide screens
		<ThemeProvider theme={lumoraTheme}>
			<Box
				sx={{
					minHeight: '100vh',
					backgroundColor: theme.pageBg,
					transition: THEME_TRANSITION,
					// Desktop: centres the capped layout vertically on very tall screens
					display: { md: 'flex' },
					alignItems: 'center',
					...REDUCED_MOTION_SX
				}}
			>
				<Box
					sx={{
						// Beyond this the hero would blow its artwork and headline up past their
						// designed size; at 1760px the dashboards show at about 1x
						maxWidth: LAYOUT_MAX_WIDTH,
						width: '100%',
						mx: 'auto',
						minHeight: { xs: '100vh', md: 0 },
						// Desktop: one screen tall, so the page itself never scrolls (no jump on reload,
						// no flash while fonts load), capped so very tall screens do not stretch the hero
						// into an empty band; the sign-in panel scrolls inside if it must
						height: { md: `min(100vh, ${LAYOUT_MAX_HEIGHT}px)` },
						display: 'grid',
						// One row exactly the layout's height: content taller than that (a dashboard
						// image) is clipped by the hero or scrolls in the panel, never stretches the page
						gridTemplateRows: { md: 'minmax(0, 1fr)' },
						gridTemplateColumns: {
							// minmax(0, …) lets the column shrink below its content's width on phones
							xs: 'minmax(0, 1fr)',
							md: 'minmax(400px, 440px) minmax(0, 1fr)',
							xl: '480px minmax(0, 1fr)'
						},
						backgroundColor: theme.pageBg,
						color: theme.text,
						fontFamily: theme.bodyFont,
						boxSizing: 'border-box',
						transition: THEME_TRANSITION,
						'& *, & *::before, & *::after': { boxSizing: 'border-box' }
					}}
				>
					{/* Sign-in panel */}
					<Box
						component="main"
						sx={{
							display: 'flex',
							justifyContent: 'center',
							px: { xs: 3, sm: 6 },
							// Extra room above the logo
							pt: { xs: 5, sm: 7 },
							pb: { xs: 4, sm: 5 },
							[SHORT_SCREEN]: { pt: 4.5, pb: 2.25 },
							// Scrolls on its own beside the hero; on phones the page scrolls as usual
							overflowY: { md: 'auto' },
							overflowX: 'clip',
							// When an error or validation line overflows a laptop-height panel: a thin,
							// quiet scrollbar. Its space is not reserved, which would narrow the panel
							// all the time on Windows just to avoid a reflow while an error shows.
							scrollbarWidth: 'thin',
							scrollbarColor: `${theme.border} transparent`
						}}
					>
						<Box
							sx={{
								width: '100%',
								maxWidth: 440,
								display: 'flex',
								flexDirection: 'column',
								// Desktop: fill the panel's height (spacers share out the spare). Capped so
								// very tall screens get a centred panel instead of oversized gaps.
								height: { md: 'min(100%, 960px)' },
								alignSelf: { md: 'center' }
							}}
						>
							{/* Sections fade up one after another, with a spacer between each */}
							{sections.map((section, index) => (
								<React.Fragment
									key={
										React.isValidElement(section)
											? section.key
											: index
									}
								>
									{index > 0 && (
										<Spacer
											weight={1}
											minHeight={18}
											minHeightShort={8}
										/>
									)}
									<Box
										sx={{
											display: 'flex',
											flexDirection: 'column',
											animation: fadeUpAnimation(index * 50)
										}}
									>
										{section}

										{/* Phone banner after the header, right above the platform selector */}
										{index === 0 && mobileHero && (
											<Box
												sx={{
													display: {
														xs: 'block',
														md: 'none'
													},
													mt: 2.25
												}}
											>
												{mobileHero}
											</Box>
										)}
									</Box>
								</React.Fragment>
							))}

							{/* The footer sits apart: a larger minimum and three shares of the spare */}
							<Spacer weight={3} minHeight={40} minHeightShort={24} />
							<Box
								sx={{
									animation: fadeUpAnimation(sections.length * 50)
								}}
							>
								{footer}
							</Box>
						</Box>
					</Box>

					{/* Hero: the panel beside it scrolls on its own, so the hero stays in view */}
					<Box
						sx={{
							display: { xs: 'none', md: 'block' },
							height: '100%',
							p: 2,
							pl: 0
						}}
					>
						{hero}
					</Box>
				</Box>
			</Box>
		</ThemeProvider>
	);
};

export default LoginContainer;
