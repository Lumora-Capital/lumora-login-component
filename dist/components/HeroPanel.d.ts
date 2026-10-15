import { default as React } from 'react';
import { PlatformAssets, PlatformId } from '../types';
import { LoginTheme } from '../utils/loginTheme';
interface HeroPanelProps {
    theme: LoginTheme;
    platform: PlatformId | null;
    platformAssets?: Partial<Record<PlatformId, PlatformAssets>>;
    compact?: boolean;
}
/**
 * Right-hand hero: the Lumora ecosystem overview, or the selected platform's pitch
 * and screenshot in that platform's colours. On phones it is drawn as a compact banner.
 */
declare const HeroPanel: React.FC<HeroPanelProps>;
export default HeroPanel;
//# sourceMappingURL=HeroPanel.d.ts.map