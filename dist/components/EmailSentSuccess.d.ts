import { default as React } from 'react';
import { BrandingConfig } from '../types';
interface EmailSentSuccessProps {
    brandConfig: BrandingConfig;
    title: string;
    description: string;
    onBackToLogin: () => void;
}
/**
 * Confirmation screen shown after an email link has been sent
 * (forget password, magic link sign-in)
 */
declare const EmailSentSuccess: React.FC<EmailSentSuccessProps>;
export default EmailSentSuccess;
//# sourceMappingURL=EmailSentSuccess.d.ts.map