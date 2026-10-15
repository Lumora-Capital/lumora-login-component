import { default as React } from 'react';
import { LoginTheme } from '../utils/loginTheme';
interface EmailSentSuccessProps {
    theme: LoginTheme;
    title: string;
    description: string;
    onBackToLogin: () => void;
}
/**
 * Confirmation shown in place of the sign-in options after a magic link was sent
 */
declare const EmailSentSuccess: React.FC<EmailSentSuccessProps>;
export default EmailSentSuccess;
//# sourceMappingURL=EmailSentSuccess.d.ts.map