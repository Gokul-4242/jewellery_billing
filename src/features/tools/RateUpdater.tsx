import React, { useState } from 'react';
import styles from './RateUpdater.module.scss';
import { useRates } from '../../context/RateContext';
import { Button } from '../../components/common';

interface RateUpdaterProps {
    isOpen: boolean;
    onClose: () => void;
}

const RateUpdater: React.FC<RateUpdaterProps> = ({ isOpen, onClose }) => {
    const { rates, updateRate } = useRates();
    const [localRates, setLocalRates] = useState(rates);

    if (!isOpen) return null;

    const handleSave = () => {
        updateRate('all', {
            gold22k: Number(localRates.gold22k),
            gold24k: Number(localRates.gold24k),
            silver: Number(localRates.silver)
        });
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
                        <label>Gold 22k (per gram)</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.currency}>₹</span>
                            <input
                                type="number"
                                value={localRates.gold22k}
                                onChange={(e) => setLocalRates(prev => ({ ...prev, gold22k: Number(e.target.value) }))}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Gold 24k (per gram)</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.currency}>₹</span>
                            <input
                                type="number"
                                value={localRates.gold24k}
                                onChange={(e) => setLocalRates(prev => ({ ...prev, gold24k: Number(e.target.value) }))}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Silver (per gram)</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.currency}>₹</span>
                            <input
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
