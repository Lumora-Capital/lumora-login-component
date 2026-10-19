import { default as React } from 'react';
import { BrandingConfig, ColorMode, PlatformId } from '../types';
export interface LumoraLoginSkeletonProps {
    defaultColorMode?: ColorMode;
    defaultPlatform?: PlatformId;
    showPlatformSelector?: boolean;
    branding?: BrandingConfig;
}
/**
 * Loading placeholder for LumoraLogin, drawn in its layout so the page changes in place when
 * the form is ready. Show it while the host checks for an existing session, or as the
 * Suspense fallback of the login route. It needs no props.
 */
declare const LumoraLoginSkeleton: React.FC<LumoraLoginSkeletonProps>;
export default LumoraLoginSkeleton;
//# sourceMappingURL=LumoraLoginSkeleton.d.ts.map