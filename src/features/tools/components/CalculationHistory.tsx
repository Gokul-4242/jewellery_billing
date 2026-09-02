import React from 'react';
import classNames from 'classnames';
import styles from '../ExchangeCalculator.module.scss';
import type { CalculationHistoryItem } from '../types';

interface CalculationHistoryProps {
    history: CalculationHistoryItem[];
    setHistory: React.Dispatch<React.SetStateAction<CalculationHistoryItem[]>>;
    formatNumber: (num: number, decimals?: number) => string;
    showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const CalculationHistory: React.FC<CalculationHistoryProps> = ({
    history,
    setHistory,
    formatNumber,
    showToast
}) => {
    const handleDelete = (id: string) => {
        setHistory(prev => prev.filter(h => h.id !== id));
    };

    return (
        <div className={styles.historySection}>
            <div className={styles.header}>
                <h3>Recent Calculations</h3>
                <button className={styles.linkBtn} onClick={() => showToast('Full history coming soon!', 'info')}>
                    View All History
                </button>
            </div>
            <div className={styles.tableContainer}>
                <div className={styles.tableWrapper}>
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Time</th>
                                <th scope="col">Metal</th>
                                <th scope="col">Weight</th>
                                <th scope="col">Purity</th>
                                <th scope="col" className={styles.textRight}>Value</th>
                                <th scope="col" className={styles.textCenter}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? (
                                history.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.timestamp}</td>
                                        <td>
                                            <div className={styles.metalBadge}>
                                                <div className={classNames(styles.dot, item.metalType === 'gold' ? styles.gold : styles.silver)}></div> 
                                                {item.metalType === 'gold' ? 'Gold' : 'Silver'}
                                            </div>
                                        </td>
                                        <td className={styles.fontMono}>{formatNumber(item.grossWeight)}g</td>
                                        <td>{item.purity}</td>
                                        <td className={classNames(styles.textRight, styles.fontMedium)}>₹{formatNumber(item.totalValue, 2)}</td>
                                        <td className={styles.textCenter}>
                                            <button 
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(item.id)}
                                                aria-label="Delete entry"
                                                type="button"
                                                style={{ background: 'none', border: 'none' }}
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className={styles.emptyState}>
                                        No recent calculations
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
