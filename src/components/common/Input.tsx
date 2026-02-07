import React from 'react';
// Input component
import styles from './Common.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
    label?: string;
    icon?: string;
    error?: string;
    type?: string;
    as?: 'input' | 'select' | 'textarea';
    options?: { label: string; value: string | number }[];
}

export const Input: React.FC<InputProps> = ({
    label,
    icon,
    error,
    className = '',
    as = 'input',
    options,
    children,
    ...props
}) => {
    const Component = as as any;

    return (
        <div className={`${styles.inputField} ${className}`}>
            {label && <label>{label}</label>}
            <div className={`${styles.inputWrapper} ${icon ? styles.hasIcon : ''}`}>
                {icon && <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>}
                {as === 'input' ? (
                    <input {...props} />
                ) : (
                    <Component {...props}>
                        {as === 'select' && options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                        {children}
                    </Component>
                )}
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{error}</p>}
        </div>
    );
};
