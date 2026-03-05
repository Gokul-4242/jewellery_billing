import React, { forwardRef } from 'react';
// Input component
import styles from './Common.module.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
    label?: string;
    icon?: string;
    error?: string;
    type?: string;
    as?: 'input' | 'select' | 'textarea';
    options?: { label: string; value: string | number }[];
}

export const Input = forwardRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, InputProps>(({
    label,
    icon,
    error,
    className = '',
    as = 'input',
    options,
    children,
    ...props
}, ref) => {
    const Component = as as 'input' | 'select' | 'textarea';

    return (
        <div className={`${styles.inputField} ${className}`}>
            {label && <label>{label}</label>}
            <div className={`${styles.inputWrapper} ${icon ? styles.hasIcon : ''}`}>
                {icon && <span className={`material-symbols-outlined ${styles.icon}`}>{icon}</span>}
                {as === 'input' ? (
                    <input ref={ref as React.Ref<HTMLInputElement>} {...props} />
                ) : (
                    <Component ref={ref as React.Ref<any>} {...props}>
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
});

Input.displayName = 'Input';
