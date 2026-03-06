import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import styles from './CustomDropdown.module.scss';

interface CustomDropdownProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onAddOption?: (newOption: string) => void;
    allowCustom?: boolean;
    label?: string;
    className?: string;
    triggerClassName?: string;
    menuClassName?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    onAddOption,
    allowCustom = false,
    label,
    className,
    triggerClassName,
    menuClassName
}) => {
    const dropdownId = React.useId();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [customValue, setCustomValue] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(opt => 
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddCustom = () => {
        if (customValue.trim() && onAddOption) {
            onAddOption(customValue.trim());
            onChange(customValue.trim());
            setCustomValue('');
            setSearchTerm('');
            setIsOpen(false);
        }
    };

    return (
        <div className={classNames(styles.container, className)} ref={dropdownRef}>
            {label && <label className={styles.label} htmlFor={dropdownId}>{label}</label>}
            
            <button 
                id={dropdownId}
                type="button"
                className={classNames(styles.trigger, triggerClassName, isOpen && styles.open)}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={label || placeholder}
            >
                <span className={classNames(!value && styles.placeholder)}>
                    {value || placeholder}
                </span>
                <span className={classNames("material-symbols-outlined", styles.arrow)}>
                    expand_more
                </span>
            </button>

            {isOpen && (
                <div className={classNames(styles.dropdown, menuClassName)}>
                    <div className={styles.searchArea}>
                        <input 
                            type="text" 
                            className={styles.searchInput}
                            placeholder="Search..."
                            value={searchTerm}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className={styles.optionsList} role="listbox">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <button 
                                    type="button"
                                    key={opt}
                                    className={classNames(styles.option, value === opt && styles.selected)}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    role="option"
                                    aria-selected={value === opt}
                                >
                                    {opt}
                                    {value === opt && (
                                        <span className={classNames("material-symbols-outlined", styles.checkIcon)}>
                                            check
                                        </span>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className={styles.noResults}>
                                No options found
                                {allowCustom && searchTerm && (
                                    <button 
                                        type="button"
                                        className={styles.addPrompt}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCustomValue(searchTerm);
                                            // Handle direct add if they click the prompt
                                            if (onAddOption) {
                                                onAddOption(searchTerm);
                                                onChange(searchTerm);
                                                setIsOpen(false);
                                                setSearchTerm('');
                                                setCustomValue('');
                                            }
                                        }}
                                    >
                                        Add "{searchTerm}"?
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {allowCustom && (
                        <div className={styles.customAdd}>
                            <input 
                                type="text"
                                placeholder="Add custom..."
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                            />
                            <button type="button" onClick={handleAddCustom}>Add</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
