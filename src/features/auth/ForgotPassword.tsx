import React, { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import styles from './Auth.module.scss';
import type { ForgotPasswordProps, ForgotPasswordFormData } from './ForgotPassword.types';
import { useToast } from '../../context/ToastContext';

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSubmit }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { showToast } = useToast();
    const emailRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email) {
            showToast('Please enter your email address.', 'warning');
            emailRef.current?.focus();
            return;
        }

        const formData: ForgotPasswordFormData = { email };

        if (onSubmit) {
            onSubmit(formData);
        } else {
            console.log('Reset link requested for:', email);
        }

        // Show success message
        setIsSubmitted(true);
    };



    return (
        <div className={styles.container}>
            <div className={styles.backgroundWrapper}>
                <img
                    alt="Abstract dark luxury gold texture background"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz5mQymnDRLIHn6sWy-u2avdBS2-OIatlheYFrRDZB_pDnculQ4tqQ1oy1Zgb7t91Uu4nRjngQbgtMYFE0RcksIdglNZ9tV_Odn40Pys9E9iNMW_lzyipvXUCr5hsvV1VyqsSiw-daLcQFacfEhpzJKoSeo1J06rFfxRHe3n7r8yG4xdoskAucES-KSJz--c2rv1N1Tbaq8gTtHjNGjnfu1qnh81BcR6cS_kCP5L9UUmsZY1TJPvRwptnbUwoILd3f7EC5BWNnIkHF"
                />
                <div className={styles.backgroundOverlay}></div>
                <div className={styles.backgroundBlob}></div>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.card}>
                    <div className={styles.goldStripe}></div>

                    <div className={styles.cardContent}>
                        {!isSubmitted ? (
                            <>
                                <div className={styles.header}>
                                    <div className={styles.iconWrapper}>
                                        <span className={`material-symbols-outlined ${styles.icon}`}>
                                            lock_reset
                                        </span>
                                    </div>
                                    <h1 className={styles.title}>Forgot Password?</h1>
                                    <p className={styles.subtitle}>
                                        Don't worry, it happens. Enter your email address below and we'll send you a link to reset your password.
                                    </p>
                                </div>

                                <form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} htmlFor="email">
                                            Email Address or Username
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
                                                placeholder="admin@jewelrystore.com"
                                                value={email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button className={styles.submitButton} type="submit">
                                        Send Reset Link
                                    </button>
                                </form>

                                <Link
                                    className={styles.backLink}
                                    to="/login"
                                >
                                    <span className={`material-symbols-outlined ${styles.backIcon}`}>
                                        arrow_back
                                    </span>
                                    Back to Login
                                </Link>
                            </>
                        ) : (
                            <div className={styles.successMessage}>
                                <div className={styles.successIcon}>
                                    <span className="material-symbols-outlined">check_circle</span>
                                </div>
                                <h2 className={styles.successTitle}>Check Your Email</h2>
                                <p className={styles.successText}>
                                    We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
                                </p>
                                <Link
                                    className={styles.backLink}
                                    to="/login"
                                >
                                    <span className={`material-symbols-outlined ${styles.backIcon}`}>
                                        arrow_back
                                    </span>
                                    Back to Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <footer className={styles.footer}>
                    <p>© 2026 VGH &amp; Jewellers. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default ForgotPassword;
