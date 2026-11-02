import { default as React } from 'react';
interface BrowserFrameProps {
    title: string;
    barColor: string;
    screenshot?: string;
    compact?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
/**
 * Product window for the hero: the supplied dashboard artwork, or until one is supplied
 * a placeholder browser window with a coloured title bar and three dots
 */
declare const BrowserFrame: React.FC<BrowserFrameProps>;
export default BrowserFrame;
//# sourceMappingURL=BrowserFrame.d.ts.map