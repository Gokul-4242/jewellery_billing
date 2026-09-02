import React from 'react';
import styles from '../ExchangeCalculator.module.scss';

interface EstimationSummaryProps {
    metalType: 'gold' | 'silver';
    purityLabel: string;
    grossWeight: number;
    purityConvertedWeight: number;
    deductionAmount: number;
    deductionUnit: 'percent' | 'grams';
    deductionValue: number;
    netWeight: number;
    appliedRate: number;
    totalValue: number;
    formatNumber: (num: number, decimals?: number) => string;
    formatCurrency: (amount: number) => string;
    handleAddToInvoice: () => void;
    setGrossWeight: (value: number) => void;
    setDeductionValue: (value: number) => void;
}

export const EstimationSummary: React.FC<EstimationSummaryProps> = ({
    metalType,
    purityLabel,
    grossWeight,
    purityConvertedWeight,
    deductionAmount,
    deductionUnit,
    deductionValue,
    netWeight,
    appliedRate,
    totalValue,
    formatNumber,
    formatCurrency,
    handleAddToInvoice,
    setGrossWeight,
    setDeductionValue
}) => {
    return (
        <div className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                    <h3>Estimation Summary</h3>
                    <span className={styles.badge}>#EST-8921</span>
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.row}>
                        <span>Item Type</span>
                        <span className={`${styles.value} ${styles.highlight}`}>
                            {metalType === 'gold' ? 'Gold' : 'Silver'} ({purityLabel})
                        </span>
                    </div>
                    <div className={styles.row}>
                        <span>Gross Weight</span>
                        <span className={styles.value}>{formatNumber(grossWeight)} g</span>
                    </div>
                    <div className={styles.row}>
                        <span>Purity Conversion</span>
                        <span className={styles.value}>{formatNumber(purityConvertedWeight)} g</span>
                    </div>
                    <div className={styles.row}>
                        <span>Less: Deduction {deductionUnit === 'percent' ? `(${deductionValue}%)` : ''}</span>
                        <span className={`${styles.value} ${styles.negative}`}>-{formatNumber(deductionAmount)} g</span>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.row}>
                        <span className={styles.highlight}>Net Weight (22k eq.)</span>
                        <span className={`${styles.value} ${styles.grand}`}>{formatNumber(netWeight)} g</span>
                    </div>
                    <div className={styles.row}>
                        <span>Applied Rate</span>
                        <span className={styles.value}>₹{formatNumber(appliedRate, 2)}/g</span>
                    </div>
                </div>

                <div className={styles.totalSection}>
                    <p className={styles.label}>Total Exchange Value</p>
                    <p className={styles.amount}>{formatCurrency(totalValue)}</p>
                </div>

                <div className={styles.actionsSection}>
                    <button className={styles.addBtn} onClick={handleAddToInvoice}>
                        <span className="material-symbols-outlined">add_circle</span> Add to Invoice
                    </button>
                    <div className={styles.secondaryActions}>
                        <button className={styles.printBtn}>
                            <span className={`material-symbols-outlined ${styles.icon}`}>print</span> Print
                        </button>
                        <button
                            className={styles.resetBtn}
                            onClick={() => {
                                setGrossWeight(0);
                                setDeductionValue(0);
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
