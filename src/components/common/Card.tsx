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
    const content = (
        <>
            {(title || extra) && (
                <div className={styles.cardHeader}>
                    <div>
                        {title && <h3 className={styles.cardTitle}>{title}</h3>}
                        {description && <p className={styles.cardDescription}>{description}</p>}
                    </div>
                    {extra && <div>{extra}</div>}
                </div>
            )}
            {children}
        </>
    );

    const fullClassName = `${styles.card} ${onClick ? styles.interactive : ''} ${className}`;

    if (onClick) {
        return (
            <button
                type="button"
                className={fullClassName}
                onClick={onClick}
            >
                {content}
            </button>
        );
    }

    return (
        <div className={fullClassName}>
            {content}
        </div>
    );
};
