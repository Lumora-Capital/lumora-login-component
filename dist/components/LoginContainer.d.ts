import { default as React } from 'react';
import { LoginTheme } from '../utils/loginTheme';
interface LoginContainerProps {
    theme: LoginTheme;
    children: React.ReactNode;
    footer: React.ReactNode;
    hero: React.ReactNode;
    mobileHero?: React.ReactNode;
}
/**
 * Full-page split layout: sign-in panel on the left, hero on the right
 */
declare const LoginContainer: React.FC<LoginContainerProps>;
export default LoginContainer;
//# sourceMappingURL=LoginContainer.d.ts.map