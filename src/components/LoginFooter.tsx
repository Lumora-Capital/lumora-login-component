import React from 'react';
import { LockIcon } from 'lucide-react';
import { BrandingConfig } from '../types';
import { THEME_TRANSITION_CLASS } from '../utils/motion';
import { cn } from '../lib/utils';

interface LoginFooterProps {
	brandConfig: BrandingConfig;
}

/**
 * Security note, support contact and copyright
 */
const LoginFooter: React.FC<LoginFooterProps> = ({ brandConfig }) => (
	<footer
		className={cn(
			'll:grid ll:gap-2 ll:text-[13px] ll:leading-normal ll:text-label ll:short:gap-1',
			// Centred on phones, where the panel is the whole page; left-aligned beside the hero
			'll:justify-items-center ll:text-center ll:md:justify-items-start ll:md:text-left',
			THEME_TRANSITION_CLASS
		)}
	>
		{brandConfig.securityNote && (
			<div className="ll:flex ll:items-center ll:justify-center ll:gap-1.5 ll:md:justify-start">
				<LockIcon aria-hidden className="ll:size-3.5 ll:shrink-0" />
				{brandConfig.securityNote}
			</div>
		)}

		{brandConfig.supportLabel && (
			<div>
				Need access?{' '}
				{brandConfig.supportUrl ? (
					<a
						href={brandConfig.supportUrl}
						className="ll:text-brand-text ll:underline ll:decoration-current"
					>
						{brandConfig.supportLabel}
					</a>
				) : (
					<span className="ll:text-brand-text">
						{brandConfig.supportLabel}
					</span>
				)}
			</div>
		)}

		{(brandConfig.copyright || brandConfig.copyrightHolder) && (
			<div>
				{brandConfig.copyright}
				{brandConfig.copyright && brandConfig.copyrightHolder && ' '}
				{brandConfig.copyrightHolder && brandConfig.copyrightUrl ? (
					// Only the holder is linked; opens in a new tab so the sign-in page stays open
					<a
						href={brandConfig.copyrightUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="ll:text-inherit ll:no-underline ll:hover:underline"
					>
						{brandConfig.copyrightHolder}
					</a>
				) : (
					brandConfig.copyrightHolder
				)}
			</div>
		)}
	</footer>
);

export default LoginFooter;
