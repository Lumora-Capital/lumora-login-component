import React from 'react';
import { THEME_TRANSITION_CLASS } from '../utils/motion';
import { cn } from '../lib/utils';

interface FirstTimeCardProps {
	title: string;
	steps: string[];
}

/**
 * "First time here?" card with numbered onboarding steps
 */
const FirstTimeCard: React.FC<FirstTimeCardProps> = ({ title, steps }) => (
	<section
		aria-labelledby="lumora-first-time-title"
		className={cn(
			'll:rounded-[12px] ll:border ll:border-line ll:bg-surface ll:px-5 ll:py-4 ll:short:py-2.5',
			'll:[&_*]:transition-[background-color,border-color,color,box-shadow] ll:[&_*]:duration-[350ms] ll:[&_*]:ease-[cubic-bezier(0.4,0,0.2,1)]',
			THEME_TRANSITION_CLASS
		)}
	>
		<h2
			id="lumora-first-time-title"
			className="ll:font-body ll:text-[18px] ll:font-semibold ll:text-heading"
		>
			{title}
		</h2>

		<ol className="ll:mt-2.5 ll:grid ll:list-none ll:gap-2 ll:short:mt-2 ll:short:gap-1.5">
			{steps.map((step, index) => (
				<li
					key={step}
					className="ll:flex ll:items-center ll:gap-3 ll:text-[14.5px] ll:text-label"
				>
					<span
						aria-hidden
						className="ll:grid ll:size-6 ll:shrink-0 ll:place-items-center ll:rounded-full ll:border ll:border-divider ll:text-[12px] ll:font-semibold ll:text-brand-text"
					>
						{index + 1}
					</span>
					{step}
				</li>
			))}
		</ol>
	</section>
);

export default FirstTimeCard;
