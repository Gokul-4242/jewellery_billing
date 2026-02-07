export interface ForgotPasswordFormData {
    email: string;
}

export interface ForgotPasswordProps {
    onSubmit?: (formData: ForgotPasswordFormData) => void;
}
