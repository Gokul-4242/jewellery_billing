import React, { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import styles from './Auth.module.scss';
import type { AdminLoginProps, LoginFormData } from './AdminLogin.types';
import signInImg from '../../assets/signupPage.png';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const AdminLogin: React.FC<AdminLoginProps> = ({ onSubmit }) => {
    const { showToast } = useToast();
    const { login } = useAuth();
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: '',
        rememberMe: false,
    });

    const usernameInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!formData.username) {
            showToast('Please enter your username.', 'warning');
            usernameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => usernameInputRef.current?.focus(), 500);
            return;
        }

        if (!formData.password) {
            showToast('Please enter your password.', 'warning');
            passwordInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => passwordInputRef.current?.focus(), 500);
            return;
        }

        try {
            await login(formData.username, formData.password);
            showToast('Login Successful! Redirecting...', 'success', 'Welcome Back');

            if (onSubmit) {
                onSubmit(formData);
            }
        } catch (err: unknown) {
            const error = err as Error;
            showToast(error.message || 'Authentication Failed', 'error', 'Authentication Failed');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className={styles.container}>
            <div className={styles.backgroundWrapper}>
                <img
                    alt="Abstract dark luxury gold texture background"
                    src={signInImg}
                />
                <div className={styles.backgroundOverlay}></div>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.card}>
                    <div className={styles.goldStripe}></div>

                    <div className={styles.cardContent}>
                        <div className={styles.header}>
                            <div className={styles.iconWrapper}>
                                <span className={`material-symbols-outlined ${styles.icon}`}>diamond</span>
                            </div>
                            <h1 className={styles.title}>Admin Portal</h1>
                            <p className={styles.subtitle}>
                                Please enter your secure credentials to access the vault.
                            </p>
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="username">
                                    Username or ID
                                </label>
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputIcon}>
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <input
                                        ref={usernameInputRef}
                                        className={styles.input}
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="Enter your admin ID"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <div className={styles.label}>
                                    <label htmlFor="password">Password</label>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputIcon}>
                                        <span className="material-symbols-outlined">lock</span>
                                    </div>
                                    <input
                                        ref={passwordInputRef}
                                        className={`${styles.input} ${styles.passwordInput}`}
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                    />
                                    <button
                                        className={styles.togglePasswordButton}
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        <span className={`material-symbols-outlined ${styles.icon}`}>
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className={styles.rememberForgotRow}>
                                <div className={styles.checkboxWrapper}>
                                    <input
                                        id="remember-me"
                                        name="rememberMe"
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="remember-me">Remember me</label>
                                </div>
                                <div>
                                    <Link
                                        className={styles.forgotLink}
                                        to="/forgot-password"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <button className={styles.submitButton} type="submit">
                                <span className={`material-symbols-outlined ${styles.icon}`}>login</span>
                                <span>Secure Login</span>
                            </button>

                            <div className={styles.signupSection}>
                                <p>
                                    Don't have an account?{' '}
                                    <Link
                                        className={styles.signupLink}
                                        to="/signup"
                                    >
                                        <span>Sign Up</span>
                                        <span className={`material-symbols-outlined ${styles.icon}`}>
                                            arrow_forward
                                        </span>
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* <div className={styles.footer}>
                        <p>
                            <span className={`material-symbols-outlined ${styles.icon}`}>encrypted</span>
                            256-bit Encrypted Connection
                        </p>
                    </div> */}
                </div>

                <div className={styles.copyright}>
                    <p>© 2026 VGH Jewellers. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
