import { default as React } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { BrandingConfig, ErrorState } from '../types';
interface EmailRequestFormData {
    email: string;
}
interface EmailRequestFormProps {
    brandConfig: BrandingConfig;
    title: string;
    description: string;
    submitLabel: string;
    isSubmitting: boolean;
    error: ErrorState | null;
    onSubmit: SubmitHandler<EmailRequestFormData>;
    onBackToLogin: () => void;
    onCloseError: () => void;
}
/**
 * Single email field form used for flows that email the user a link
 * (forget password, magic link sign-in)
 */
declare const EmailRequestForm: React.FC<EmailRequestFormProps>;
export default EmailRequestForm;
//# sourceMappingURL=EmailRequestForm.d.ts.map