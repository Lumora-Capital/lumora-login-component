import React from 'react';
import { MailCheckIcon } from 'lucide-react';
import { Button } from './ui/button';

interface EmailSentSuccessProps {
	title: string;
	description: string;
	onBackToLogin: () => void;
}

/**
 * Confirmation shown in place of the sign-in options after a magic link was sent
 */
const EmailSentSuccess: React.FC<EmailSentSuccessProps> = ({
	title,
	description,
	onBackToLogin
}) => (
	<div>
		<div className="ll:grid ll:size-12 ll:place-items-center ll:rounded-[12px] ll:bg-accent/12 ll:text-accent">
			<MailCheckIcon aria-hidden className="ll:size-6" />
		</div>

		<h1 className="ll:mt-6 ll:font-heading ll:text-[28px] ll:leading-[1.15] ll:font-semibold ll:text-heading ll:sm:text-[32px]">
			{title}
		</h1>

		{/* A blank line in the description is a paragraph break */}
		<p className="ll:mt-4 ll:text-[16px] ll:leading-[1.6] ll:whitespace-pre-line ll:text-label">
			{description}
		</p>

		<Button
			variant="outline-accent"
			size="auto"
			onClick={onBackToLogin}
			className="ll:mt-8 ll:h-[52px]"
		>
			Back to sign in
		</Button>
	</div>
);

export default EmailSentSuccess;
