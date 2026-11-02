import { default as React } from 'react';
import { VariantProps } from 'class-variance-authority';
/**
 * The login page's button, in the shadcn/ui pattern Nexa's Button follows. Colours come from the
 * page's accent (the selected platform's colour), so every variant follows the platform and mode.
 */
declare const buttonVariants: (props?: ({
    variant?: "default" | "outline" | "outline-accent" | "ghost" | null | undefined;
    size?: "control" | "auto" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string;
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;
export declare const Button: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<(props?: ({
    variant?: "default" | "outline" | "outline-accent" | "ghost" | null | undefined;
    size?: "control" | "auto" | null | undefined;
} & import('class-variance-authority/types').ClassProp) | undefined) => string> & React.RefAttributes<HTMLButtonElement>>;
export {};
//# sourceMappingURL=button.d.ts.map