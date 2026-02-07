import React from 'react';
import styles from './Common.module.scss';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    extra?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    title,
    description,
    extra,
    className = '',
    onClick
}) => {
    return (
        <div
            className={`${styles.card} ${onClick ? styles.interactive : ''} ${className}`}
            onClick={onClick}
        >
            {(title || extra) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        {title && <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>{title}</h3>}
                        {description && <p style={{ fontSize: '0.875rem', color: '#b9b09d', marginTop: '0.25rem' }}>{description}</p>}
                    </div>
                    {extra && <div>{extra}</div>}
                </div>
            )}
            {children}
        </div>
    );
};
