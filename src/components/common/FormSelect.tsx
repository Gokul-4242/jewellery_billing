import React, { useState, useRef, useEffect } from 'react';
import styles from './FormSelect.module.scss';
import classNames from 'classnames';

interface Option {
    value: string;
    label: string;
}

interface FormSelectProps {
    id?: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string; // Optional header inside dropdown
    className?: string;
    disabled?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({ 
    id,
    value, 
    options, 
    onChange, 
    placeholder = 'Select...', 
    label,
    className,
    disabled
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className={classNames(styles.container, className, disabled && styles.disabled)} ref={containerRef}>
            <button 
                id={id}
                type="button"
                className={classNames(styles.trigger, 'form-select-trigger', isOpen && styles.open)} 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                disabled={disabled}
            >
                <span className={classNames(selectedOption ? styles.value : styles.placeholder)}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="material-symbols-outlined icon">expand_more</span>
            </button>
            
            {isOpen && (
                <div className={styles.dropdownMenu} role="listbox">
                    {label && <div className={styles.menuHeader} role="presentation">{label}</div>}
                    {options.map(option => (
                        <div 
                            key={option.value} 
                            className={classNames(styles.menuItem, option.value === value && styles.selected)}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            role="option"
                            aria-selected={option.value === value}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onChange(option.value);
                                    setIsOpen(false);
                                }
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
