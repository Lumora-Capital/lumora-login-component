import { default as React } from 'react';
import { BrandingConfig } from '../types';
interface SignInOptionButtonProps {
    brandConfig: BrandingConfig;
    icon: React.ReactNode;
    label: string;
    loadingLabel?: string;
    isLoading?: boolean;
    disabled?: boolean;
    onClick: () => void;
}
/**
 * Outlined button used for alternative sign-in methods
 * (Google, Microsoft, magic link, passkey)
 */
declare const SignInOptionButton: React.FC<SignInOptionButtonProps>;
export default SignInOptionButton;
//# sourceMappingURL=SignInOptionButton.d.ts.map