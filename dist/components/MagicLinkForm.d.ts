import { default as React } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { MagicLinkFormData } from '../types';
interface MagicLinkFormProps {
    isSubmitting: boolean;
    disabled?: boolean;
    onSubmit: SubmitHandler<MagicLinkFormData>;
}
/**
 * Work email field with an inline "Magic Link" button
 */
declare const MagicLinkForm: React.FC<MagicLinkFormProps>;
export default MagicLinkForm;
//# sourceMappingURL=MagicLinkForm.d.ts.map