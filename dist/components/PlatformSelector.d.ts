import { default as React } from 'react';
import { PlatformAssets, PlatformId } from '../types';
import { LoginTheme } from '../utils/loginTheme';
interface PlatformSelectorProps {
    theme: LoginTheme;
    value: PlatformId | null;
    platformAssets?: Partial<Record<PlatformId, PlatformAssets>>;
    disabled?: boolean;
    onChange: (platform: PlatformId) => void;
}
/**
 * "Where would you like to start?" segmented control. One platform is always selected.
 */
declare const PlatformSelector: React.FC<PlatformSelectorProps>;
export default PlatformSelector;
//# sourceMappingURL=PlatformSelector.d.ts.map