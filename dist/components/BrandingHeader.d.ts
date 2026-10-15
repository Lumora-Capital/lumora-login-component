import { default as React } from 'react';
import { BrandingConfig } from '../types';
import { LoginTheme } from '../utils/loginTheme';
interface BrandingHeaderProps {
    brandConfig: BrandingConfig;
    theme: LoginTheme;
    onToggleColorMode: () => void;
    showWelcome?: boolean;
}
/**
 * Wordmark (or logo) with the light / dark toggle, then the welcome title and tagline
 */
declare const BrandingHeader: React.FC<BrandingHeaderProps>;
export default BrandingHeader;
//# sourceMappingURL=BrandingHeader.d.ts.map