import React, { useState } from 'react';
import styles from './PasswordChangeModal.module.scss';
import { Button } from '../../components/common';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

interface PasswordChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        if (formData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await api.put('/auth/updatepassword', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            showToast('Password updated successfully', 'success');
            onClose();
            // Reset form
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to update password';
            showToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Change Password</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PasswordChangeModal;
