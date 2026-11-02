import { default as React } from 'react';
interface SignInOptionButtonProps {
    icon: React.ReactNode;
    label: string;
    ariaLabel?: string;
    loadingLabel?: string;
    isLoading?: boolean;
    disabled?: boolean;
    onClick: () => void;
}
/**
 * Outlined provider button (Google, Microsoft)
 */
declare const SignInOptionButton: React.FC<SignInOptionButtonProps>;
export default SignInOptionButton;
//# sourceMappingURL=SignInOptionButton.d.ts.map