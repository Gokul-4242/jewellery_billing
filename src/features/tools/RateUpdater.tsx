import React, { useState, useRef, useEffect } from 'react';
import styles from './RateUpdater.module.scss';
import { useRates } from '../../context/RateContext';
import { Button } from '../../components/common';
import { useToast } from '../../context/ToastContext';

interface RateUpdaterProps {
    isOpen: boolean;
    onClose: () => void;
}

const RateUpdater: React.FC<RateUpdaterProps> = ({ isOpen, onClose }) => {
    const { rates, updateRate } = useRates();
    const [localRates, setLocalRates] = useState(rates);
    const { showToast } = useToast();

    // Sync local state with context when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalRates(rates);
        }
    }, [isOpen, rates]);

    const gold22kRef = useRef<HTMLInputElement>(null);
    const gold24kRef = useRef<HTMLInputElement>(null);
    const silverRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!localRates.gold22k || localRates.gold22k <= 0) {
            showToast('Please enter a valid Gold 22k rate', 'error');
            gold22kRef.current?.focus();
            return;
        }
        if (!localRates.gold24k || localRates.gold24k <= 0) {
            showToast('Please enter a valid Gold 24k rate', 'error');
            gold24kRef.current?.focus();
            return;
        }
        if (!localRates.silver || localRates.silver <= 0) {
            showToast('Please enter a valid Silver rate', 'error');
            silverRef.current?.focus();
            return;
        }

        updateRate('all', {
            gold22k: Number(localRates.gold22k),
            gold24k: Number(localRates.gold24k),
            silver: Number(localRates.silver)
        });
        showToast('Rates updated successfully', 'success');
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Update Daily Rates</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="gold22k">Gold 22k (per gram)</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.currency}>₹</span>
                            <input
                                id="gold22k"
                                ref={gold22kRef}
                                type="number"
                                value={localRates.gold22k}
                                onChange={(e) => setLocalRates(prev => ({ ...prev, gold22k: Number(e.target.value) }))}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="gold24k">Gold 24k (per gram)</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.currency}>₹</span>
                            <input
                                id="gold24k"
                                ref={gold24kRef}
                                type="number"
                                value={localRates.gold24k}
                                onChange={(e) => setLocalRates(prev => ({ ...prev, gold24k: Number(e.target.value) }))}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="silver">Silver (per gram)</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.currency}>₹</span>
                            <input
                                id="silver"
                                ref={silverRef}
                                type="number"
                                value={localRates.silver}
                                onChange={(e) => setLocalRates(prev => ({ ...prev, silver: Number(e.target.value) }))}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>Update Rates</Button>
                </div>
            </div>
        </div>
    );
};

export default RateUpdater;
