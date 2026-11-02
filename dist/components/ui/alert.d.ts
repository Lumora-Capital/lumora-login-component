import { default as React } from 'react';
interface AlertProps {
    className?: string;
    children: React.ReactNode;
    onClose?: () => void;
}
/**
 * Error message (Nexa's Alert, destructive): icon, text and a close button, in the page's error colours
 */
export declare const Alert: React.FC<AlertProps>;
export {};
//# sourceMappingURL=alert.d.ts.map