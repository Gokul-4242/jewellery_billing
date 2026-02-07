import React, { useState, useRef, useEffect } from 'react';
import styles from './FormSelect.module.scss';
import classNames from 'classnames';

interface Option {
    value: string;
    label: string;
}

interface FormSelectProps {
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string; // Optional header inside dropdown
    className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({ 
    value, 
    options, 
    onChange, 
    placeholder = 'Select...', 
    label,
    className 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={classNames(styles.container, className)} ref={containerRef}>
            <div 
                className={classNames(styles.trigger, isOpen && styles.open)} 
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                tabIndex={0}
            >
                <span className={classNames(selectedOption ? styles.value : styles.placeholder)}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="material-symbols-outlined icon">expand_more</span>
            </div>
            
            {isOpen && (
                <div className={styles.dropdownMenu}>
                    {label && <div className={styles.menuHeader}>{label}</div>}
                    {options.map(option => (
                        <div 
                            key={option.value} 
                            className={classNames(styles.menuItem, option.value === value && styles.selected)}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                            {option.value === value && <span className="material-symbols-outlined checkIcon">check</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
