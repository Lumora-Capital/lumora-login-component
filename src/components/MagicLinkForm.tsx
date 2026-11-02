import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MagicLinkFormData } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Spinner } from './ui/spinner';

const validationSchema = yup.object({
	email: yup
		.string()
		.email('Please enter a valid email address')
		.required('Email is required')
});

interface MagicLinkFormProps {
	isSubmitting: boolean;
	disabled?: boolean;
	onSubmit: SubmitHandler<MagicLinkFormData>;
}

/**
 * Work email field with an inline "Magic Link" button
 */
const MagicLinkForm: React.FC<MagicLinkFormProps> = ({
	isSubmitting,
	disabled = false,
	onSubmit
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<MagicLinkFormData>({
		resolver: yupResolver(validationSchema)
	});

	const isDisabled = isSubmitting || disabled;

	return (
		<form noValidate onSubmit={handleSubmit(onSubmit)}>
			{/* Same style as "Where would you like to start?" */}
			<Label htmlFor="lumora-work-email" className="ll:mb-3">
				Work email
			</Label>

			<div className="ll:flex ll:gap-2.5">
				<Input
					{...register('email')}
					id="lumora-work-email"
					type="email"
					autoComplete="email"
					placeholder="name@lumora.capital"
					disabled={isDisabled}
					aria-invalid={!!errors.email}
					aria-describedby={
						errors.email ? 'lumora-work-email-error' : undefined
					}
					className="ll:flex-1"
				/>

				{/* Button label in the heading font (Montserrat), like the app names */}
				<Button
					type="submit"
					disabled={isDisabled}
					className="ll:min-w-[92px] ll:px-3 ll:text-[15px]"
				>
					{isSubmitting ? (
						<Spinner
							label="Sending sign-in link"
							className="ll:size-5"
						/>
					) : (
						'Magic Link'
					)}
				</Button>
			</div>

			{errors.email && (
				<div
					id="lumora-work-email-error"
					role="status"
					className="ll:mt-2 ll:text-[13px] ll:text-destructive"
				>
					{errors.email.message}
				</div>
			)}
		</form>
	);
};

export default MagicLinkForm;
