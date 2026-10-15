import { default as React } from 'react';
import { SxProps, Theme } from '@mui/material/styles';
interface BrowserFrameProps {
    title: string;
    barColor: string;
    screenshot?: string;
    compact?: boolean;
    sx?: SxProps<Theme>;
}
/**
 * Product window for the hero: the supplied dashboard artwork, or until one is supplied
 * a placeholder browser window with a coloured title bar and three dots
 */
declare const BrowserFrame: React.FC<BrowserFrameProps>;
export default BrowserFrame;
//# sourceMappingURL=BrowserFrame.d.ts.map