import React, { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import styles from './Auth.module.scss';
import type { SignupProps, SignupFormData, UserRole } from './Signup.types';
import signupImg from '../../assets/signupPage.png';
import { useToast } from '../../context/ToastContext';
import TermsModal from './TermsModal';

const Signup: React.FC<SignupProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<SignupFormData>({
        fullName: '',
        email: '',
        role: 'admin',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { showToast } = useToast();
    const fullNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleRoleChange = (role: UserRole) => {
        setFormData(prev => ({
            ...prev,
            role,
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Basic validation
        if (!formData.fullName) {
            showToast('Full Name is required.', 'error');
            fullNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => fullNameRef.current?.focus(), 500);
            return;
        }

        if (!formData.email) {
            showToast('Email Address is required.', 'error');
            emailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => emailRef.current?.focus(), 500);
            return;
        }

        if (!formData.password) {
            showToast('Password is required.', 'error');
            passwordRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => passwordRef.current?.focus(), 500);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showToast('Passwords do not match!', 'error');
            confirmPasswordRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => confirmPasswordRef.current?.focus(), 500);
            return;
        }

        if (!formData.agreeToTerms) {
            showToast('Please agree to the Terms of Service and Privacy Policy', 'warning');
            return;
        }

        if (onSubmit) {
            onSubmit(formData);
        } else {
            console.log('Signup submitted:', formData);
        }
    };

    return (
        <>
        <div className={styles.container}>
            <div className={styles.backgroundWrapper}>
                <img
                    alt="Abstract dark luxury gold texture background"
                    src={signupImg}
                />
                <div className={styles.backgroundOverlay}></div>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.card}>
                    <div className={styles.goldStripe}></div>

                    <div className={styles.cardContent}>
                        <div className={styles.header}>
                            <div className={styles.iconWrapper}>
                                <span className={`material-symbols-outlined ${styles.icon}`}>
                                    person_add
                                </span>
                            </div>
                            <h1 className={styles.title}>Create Account</h1>
                            <p className={styles.subtitle}>
                                Register a new administrator or sales staff member.
                            </p>
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            {/* Full Name */}
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="fullName">
                                    Full Name
                                </label>
                                <div className={styles.inputWrapper}>
                                    <span className={`material-symbols-outlined ${styles.inputIcon}`}>
                                        person
                                    </span>
                                    <input
                                        ref={fullNameRef}
                                        className={styles.input}
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        placeholder="e.g. Sarah Jenkins"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="email">
                                    Email Address
                                </label>
                                <div className={styles.inputWrapper}>
                                    <span className={`material-symbols-outlined ${styles.inputIcon}`}>
                                        mail
                                    </span>
                                    <input
                                        ref={emailRef}
                                        className={styles.input}
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@vghjewellers.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className={styles.formGroup}>
                                <span className={styles.label}>Select Role</span>
                                <div className={styles.roleGrid}>
                                    {/* Admin Option */}
                                    <label className={styles.roleOption} htmlFor="role-admin">
                                        <input
                                            id="role-admin"
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            aria-label="Administrator"
                                            checked={formData.role === 'admin'}
                                            onChange={() => handleRoleChange('admin')}
                                        />
                                        <div className={styles.roleCard}>
                                            <span className={`material-symbols-outlined ${styles.roleIcon}`}>
                                                admin_panel_settings
                                            </span>
                                            <span className={styles.roleText}>Administrator</span>
                                        </div>
                                    </label>

                                    {/* Sales Staff Option */}
                                    <label className={styles.roleOption} htmlFor="role-staff">
                                        <input
                                            id="role-staff"
                                            type="radio"
                                            name="role"
                                            value="staff"
                                            aria-label="Sales Staff"
                                            checked={formData.role === 'staff'}
                                            onChange={() => handleRoleChange('staff')}
                                        />
                                        <div className={styles.roleCard}>
                                            <span className={`material-symbols-outlined ${styles.roleIcon}`}>
                                                storefront
                                            </span>
                                            <span className={styles.roleText}>Sales Staff</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Password Row */}
                            <div className={styles.passwordRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} htmlFor="password">
                                        Password
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <span className={`material-symbols-outlined ${styles.inputIcon}`}>
                                            lock
                                        </span>
                                        <input
                                            ref={passwordRef}
                                            className={`${styles.input} ${styles.passwordInput}`}
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <button
                                            className={styles.togglePasswordButton}
                                            type="button"
                                            onClick={() => setShowPassword(prev => !prev)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            <span className={`material-symbols-outlined ${styles.icon}`}>
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label} htmlFor="confirmPassword">
                                        Confirm Password
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <span className={`material-symbols-outlined ${styles.inputIcon}`}>
                                            lock_reset
                                        </span>
                                        <input
                                            ref={confirmPasswordRef}
                                            className={`${styles.input} ${styles.passwordInput}`}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <button
                                            className={styles.togglePasswordButton}
                                            type="button"
                                            onClick={() => setShowConfirmPassword(prev => !prev)}
                                            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                        >
                                            <span className={`material-symbols-outlined ${styles.icon}`}>
                                                {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <label className={styles.termsWrapper}>
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleInputChange}
                                />
                                <span className={styles.termsText}>
                                    I agree to the{' '}
                                    <button
                                        type="button"
                                        className={styles.termsLink}
                                        onClick={() => setIsTermsModalOpen(true)}
                                    >
                                        Terms of Service
                                    </button>
                                    {' '}and{' '}
                                    <button
                                        type="button"
                                        className={styles.termsLink}
                                        onClick={() => setIsTermsModalOpen(true)}
                                    >
                                        Privacy Policy
                                    </button>.
                                </span>
                            </label>

                            {/* Action Button */}
                            <button className={styles.submitButton} type="submit">
                                <span>Create Account</span>
                                <span className={`material-symbols-outlined ${styles.buttonIcon}`}>
                                    arrow_forward
                                </span>
                            </button>

                            {/* Footer Link */}
                            <p className={styles.signupSection}>
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>

                <div className={styles.copyright}>
                    <p>© 2026 VGH Jewellers. All rights reserved.</p>
                </div>
            </div>
        </div>

        <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
        </>
    );
};

export default Signup;
