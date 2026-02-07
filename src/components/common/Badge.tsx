import React from 'react';
import styles from './Common.module.scss';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'gold' | 'silver' | 'success' | 'danger' | 'warning' | 'info';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info', className = '' }) => {
    return (
        <span className={`${styles.badge} ${styles[variant]} ${className}`}>
            {children}
        </span>
    );
};
