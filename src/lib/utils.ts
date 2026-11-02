import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The stylesheet's utilities carry the `ll:` prefix (src/styles.css)
const twMerge = extendTailwindMerge({ prefix: 'll' });

/**
 * Join class names, letting a later utility override an earlier one (`cn('ll:p-2', 'll:p-4')` → `ll:p-4`)
 * @param inputs - Class names, conditionals and arrays, as clsx takes them
 * @returns The merged class string
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
