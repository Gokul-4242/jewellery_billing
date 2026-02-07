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
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    onAddOption,
    allowCustom = false,
    label
}) => {
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
        <div className={styles.container} ref={dropdownRef}>
            {label && <label className={styles.label}>{label}</label>}
            
            <div 
                className={classNames(styles.trigger, isOpen && styles.open)}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={classNames(!value && styles.placeholder)}>
                    {value || placeholder}
                </span>
                <span className={classNames("material-symbols-outlined", styles.arrow)}>
                    expand_more
                </span>
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
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

                    <div className={styles.optionsList}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div 
                                    key={opt}
                                    className={classNames(styles.option, value === opt && styles.selected)}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                >
                                    {opt}
                                    {value === opt && (
                                        <span className={classNames("material-symbols-outlined", styles.checkIcon)}>
                                            check
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className={styles.noResults}>
                                No options found
                                {allowCustom && searchTerm && (
                                    <span 
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
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {allowCustom && (
                        <div className={styles.customAdd} onClick={(e) => e.stopPropagation()}>
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
