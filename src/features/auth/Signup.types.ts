export type UserRole = 'admin' | 'staff';

export interface SignupFormData {
    fullName: string;
    email: string;
    role: UserRole;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
}

export interface SignupProps {
    onSubmit?: (formData: SignupFormData) => void;
}
