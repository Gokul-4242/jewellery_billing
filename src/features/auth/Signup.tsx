import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import styles from './Auth.module.scss';
import type { SignupProps, SignupFormData, UserRole } from './Signup.types';

const Signup: React.FC<SignupProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<SignupFormData>({
        fullName: '',
        email: '',
        role: 'admin',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });

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
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (!formData.agreeToTerms) {
            alert('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        if (onSubmit) {
            onSubmit(formData);
        } else {
            console.log('Signup submitted:', formData);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.backgroundWrapper}>
                <img
                    alt="Abstract dark luxury gold texture background"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz5mQymnDRLIHn6sWy-u2avdBS2-OIatlheYFrRDZB_pDnculQ4tqQ1oy1Zgb7t91Uu4nRjngQbgtMYFE0RcksIdglNZ9tV_Odn40Pys9E9iNMW_lzyipvXUCr5hsvV1VyqsSiw-daLcQFacfEhpzJKoSeo1J06rFfxRHe3n7r8yG4xdoskAucES-KSJz--c2rv1N1Tbaq8gTtHjNGjnfu1qnh81BcR6cS_kCP5L9UUmsZY1TJPvRwptnbUwoILd3f7EC5BWNnIkHF"
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
                                <label className={styles.label}>Select Role</label>
                                <div className={styles.roleGrid}>
                                    {/* Admin Option */}
                                    <label className={styles.roleOption}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
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
                                    <label className={styles.roleOption}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="staff"
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
                                            className={styles.input}
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                        />
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
                                            className={styles.input}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            required
                                        />
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
                                    <a href="#" onClick={(e) => e.preventDefault()}>
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" onClick={(e) => e.preventDefault()}>
                                        Privacy Policy
                                    </a>
                                    .
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
                            <p className={styles.footer}>
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
                    <p>© 2026 VGH &amp; Jewellers. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
