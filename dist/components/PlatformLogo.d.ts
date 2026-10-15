import { default as React } from 'react';
import { SvgIconProps } from '@mui/material';
import { PlatformId } from '../types';
interface PlatformLogoProps extends SvgIconProps {
    platform: PlatformId;
}
/**
 * Centra, Xpdite and Polymer marks, inlined from public/*-logo.svg
 * so apps using the library need no asset files
 */
declare const PlatformLogo: React.FC<PlatformLogoProps>;
export default PlatformLogo;
//# sourceMappingURL=PlatformLogo.d.ts.map