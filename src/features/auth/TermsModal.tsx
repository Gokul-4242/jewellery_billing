import React, { useEffect, useRef } from 'react';
import styles from './TermsModal.module.scss';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={styles.overlay}
            onClick={handleOverlayClick}
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
            tabIndex={-1}
        >
            <dialog
                className={styles.modal}
                ref={dialogRef}
                open
                aria-labelledby="terms-title"
            >
                <div className={styles.header}>
                    <h2 id="terms-title" className={styles.title}>
                        <span className="material-symbols-outlined">{'gavel'}</span>
                        {' '}Terms of Service &amp; Privacy Policy
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined">{'close'}</span>
                    </button>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h3>1. Acceptance of Terms</h3>
                        <p>
                            By accessing and using the VGH &amp; Jewellers Billing and Management Dashboard (&quot;the Service&quot;), you agree to be bound by these Terms of Service. This system is strictly for authorized administrative and sales staff use only.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h3>2. User Responsibilities &amp; Data Security</h3>
                        <p>
                            As a user of this system, you are granted access to sensitive business data, including customer profiles, billing information, daily rates, and inventory details. You agree to:
                        </p>
                        <ul>
                            <li>Maintain the strictest confidentiality regarding all customer and business data.</li>
                            <li>Not share your account credentials with any unauthorized person.</li>
                            <li>Promptly report any suspected security breaches or unauthorized access.</li>
                            <li>Use customer contact information solely for authorized business purposes (e.g., invoices, estimates, and order updates).</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h3>3. Billing and Rate Accuracy</h3>
                        <p>
                            While the system auto-fetches or sets daily gold and silver rates, users are responsible for verifying the accuracy of the applied rates, stone weights, making charges, and taxes before finalizing any estimate or invoice. VGH &amp; Jewellers will not be held liable for losses incurred due to clerical data-entry errors.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h3>4. Inventory Management</h3>
                        <p>
                            Staff are required to accurately track sales and inventory adjustments. Any deliberate tampering with inventory records is strictly prohibited and may result in immediate termination of access and further disciplinary or legal action.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h3>5. Privacy Policy</h3>
                        <p>
                            We collect basic personal information from staff (name, email) solely for the purposes of system authentication, role-based access control, and auditing actions within the system. We do not sell or distribute staff or customer information to third parties. Customer data entered into the system remains the sole property of VGH &amp; Jewellers.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h3>6. Intellectual Property</h3>
                        <p>
                            The software, design, and workflows of this Dashboard are the property of VGH &amp; Jewellers. Unauthorized duplication, reverse engineering, or redistribution is prohibited.
                        </p>
                    </section>
                </div>

                <div className={styles.footer}>
                    <button className={styles.acceptBtn} onClick={onClose}>
                        I Understand &amp; Close
                    </button>
                </div>
            </dialog>
        </div>
    );
};

export default TermsModal;
