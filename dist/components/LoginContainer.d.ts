import { default as React } from 'react';
import { ColorMode } from '../types';
interface LoginContainerProps {
    mode?: ColorMode;
    style?: React.CSSProperties;
    className?: string;
    children: React.ReactNode;
    footer: React.ReactNode;
    hero: React.ReactNode;
    mobileHero?: React.ReactNode;
    skipEntrance?: boolean;
}
/**
 * Full-page split layout: sign-in panel on the left, hero on the right
 */
declare const LoginContainer: React.FC<LoginContainerProps>;
export default LoginContainer;
//# sourceMappingURL=LoginContainer.d.ts.map