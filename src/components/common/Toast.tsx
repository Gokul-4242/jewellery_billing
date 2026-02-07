import React, { useEffect, useState } from 'react';
import styles from './Toast.module.scss';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    title?: string;
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, title, type, duration = 3000, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        // Wait for animation to finish before actually calling close
        setTimeout(() => {
            onClose(id);
        }, 300); 
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return 'info';
        }
    };

    return (
        <div className={`${styles.toast} ${styles[type]} ${isExiting ? styles.exit : ''}`}>
            <span className={`material-symbols-outlined ${styles.icon}`}>
                {getIcon()}
            </span>
            <div className={styles.content}>
                {title && <div className={styles.title}>{title}</div>}
                <div className={styles.message}>{message}</div>
            </div>
            <button className={styles.closeBtn} onClick={handleClose}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
        </div>
    );
};

export interface ToastContainerProps {
    toasts: Omit<ToastProps, 'onClose'>[];
    removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className={styles.toastContainer}>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={removeToast}
                />
            ))}
        </div>
    );
};
