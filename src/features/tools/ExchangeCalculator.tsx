import React, { useState, useEffect } from 'react';
import styles from './ExchangeCalculator.module.scss';
import { useRates } from '../../context/RateContext';

interface ExchangeCalculatorProps {
    onBack?: () => void;
    onAddToInvoice?: (value: number) => void;
}

const ExchangeCalculator: React.FC<ExchangeCalculatorProps> = ({ onBack, onAddToInvoice }) => {
    const { rates, getTrend } = useRates();
    const goldTrend = getTrend(rates.gold24k, rates.previous?.gold24k);
    const silverTrend = getTrend(rates.silver, rates.previous?.silver);

    // State
    const [metalType, setMetalType] = useState<'gold' | 'silver'>('gold');
    const [grossWeight, setGrossWeight] = useState<number>(15.450); // Default from HTML
    const [purity, setPurity] = useState<number>(22); // Default 22k
    const [deductionValue, setDeductionValue] = useState<number>(2.5);
    const [deductionUnit, setDeductionUnit] = useState<'percent' | 'grams'>('percent');

    // Editable Rates
    const [goldRate24k, setGoldRate24k] = useState<number>(rates.gold24k);
    const [silverRateFine, setSilverRateFine] = useState<number>(rates.silver);
    const [isEditingRates, setIsEditingRates] = useState<boolean>(false);

    // Derived State
    const [netWeight, setNetWeight] = useState<number>(0);
    const [purityConvertedWeight, setPurityConvertedWeight] = useState<number>(0);
    const [deductionAmount, setDeductionAmount] = useState<number>(0);
    const [totalValue, setTotalValue] = useState<number>(0);
    const [appliedRate, setAppliedRate] = useState<number>(0);

    // Calculate
    useEffect(() => {
        let purityFactor = 1;

        if (metalType === 'gold') {
            switch (purity) {
                case 24: purityFactor = 0.999; break;
                case 22: purityFactor = 0.916; break;
                case 21: purityFactor = 0.875; break;
                case 18: purityFactor = 0.750; break;
                case 14: purityFactor = 0.585; break;
                default: purityFactor = 1;
            }
        } else {
            purityFactor = 0.999;
        }

        const convertedWeight = grossWeight * purityFactor;

        let deduc = 0;
        if (deductionUnit === 'percent') {
            deduc = convertedWeight * (deductionValue / 100);
        } else {
            deduc = deductionValue;
        }

        const net = convertedWeight - deduc;
        const rate = metalType === 'gold' ? goldRate24k : silverRateFine;
        const value = net * rate;

        setPurityConvertedWeight(convertedWeight);
        setDeductionAmount(deduc);
        setNetWeight(net);
        setTotalValue(value);
        setAppliedRate(rate);

    }, [metalType, grossWeight, purity, deductionValue, deductionUnit, goldRate24k, silverRateFine]);

    const formatNumber = (num: number, decimals: number = 3) => {
        return num.toLocaleString('en-IN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        });
    };

    return (
        <div className={styles.container}>
            <section className={styles.headerSection}>
                <div className={styles.titleBlock}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {onBack && (
                            <button
                                onClick={onBack}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#b9b09d',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                        )}
                        <h1>Exchange Calculator</h1>
                    </div>
                    <p className={styles.date}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                        {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <div className={styles.statsBlock}>
                    <div className={styles.statCard}>
                        <div className={styles.label}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#e29d12' }}>monetization_on</span>
                            Gold Rate (24k)
                        </div>
                        <div className={styles.value}>
                            {isEditingRates ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '1rem' }}>₹</span>
                                    <input
                                        type="number"
                                        value={goldRate24k}
                                        onChange={(e) => setGoldRate24k(parseFloat(e.target.value) || 0)}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #544b3b', color: 'white', fontSize: '1rem', width: '80px', borderRadius: '4px', padding: '2px 4px' }}
                                    />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>₹{formatNumber(goldRate24k, 2)} <span className={styles.unit}>/g</span></span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: goldTrend.direction === 'up' ? '#22c55e' : goldTrend.direction === 'down' ? '#ef4444' : '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                            {goldTrend.direction === 'up' ? 'trending_up' : goldTrend.direction === 'down' ? 'trending_down' : 'remove'}
                                        </span>
                                        {goldTrend.percent}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.label}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#9ca3af' }}>diamond</span>
                            Silver Rate (Fine)
                        </div>
                        <div className={styles.value}>
                            {isEditingRates ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '1rem' }}>₹</span>
                                    <input
                                        type="number"
                                        value={silverRateFine}
                                        onChange={(e) => setSilverRateFine(parseFloat(e.target.value) || 0)}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #544b3b', color: 'white', fontSize: '1rem', width: '80px', borderRadius: '4px', padding: '2px 4px' }}
                                    />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>₹{formatNumber(silverRateFine, 2)} <span className={styles.unit}>/g</span></span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: silverTrend.direction === 'up' ? '#22c55e' : silverTrend.direction === 'down' ? '#ef4444' : '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                            {silverTrend.direction === 'up' ? 'trending_up' : silverTrend.direction === 'down' ? 'trending_down' : 'remove'}
                                        </span>
                                        {silverTrend.percent}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        className={styles.editBtn}
                        onClick={() => setIsEditingRates(!isEditingRates)}
                        style={isEditingRates ? { backgroundColor: '#e29d12', color: 'black' } : {}}
                    >
                        <span className="material-symbols-outlined icon" style={isEditingRates ? { color: 'black' } : {}}>
                            {isEditingRates ? 'check' : 'edit'}
                        </span>
                        <span className="text">{isEditingRates ? 'Done' : 'Edit'}</span>
                    </button>
                </div >
            </section >

            <div className={styles.mainGrid}>
                <div className={styles.formColumn}>
                    <h3>Item Details</h3>

                    <div className={styles.formGroup}>
                        <label>Select Metal Type</label>
                        <div className={styles.metalSelector}>
                            <div
                                className={`${styles.option} ${metalType === 'gold' ? styles.active : ''}`}
                                onClick={() => setMetalType('gold')}
                            >
                                Gold
                            </div>
                            <div
                                className={`${styles.option} ${metalType === 'silver' ? styles.activeSilver : ''}`}
                                onClick={() => setMetalType('silver')}
                            >
                                Silver
                            </div>
                        </div>
                    </div>

                    <div className={styles.gridRow}>
                        <div className={styles.formGroup}>
                            <label>Gross Weight (grams)</label>
                            <div className={styles.inputWrapper}>
                                <span className="material-symbols-outlined icon">scale</span>
                                <input
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    value={grossWeight}
                                    onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Purity (Karat)</label>
                            <div className={`${styles.inputWrapper} ${styles.selectWrapper}`}>
                                <select
                                    value={purity}
                                    onChange={(e) => setPurity(parseInt(e.target.value))}
                                    disabled={metalType === 'silver'}
                                >
                                    <option value="24">24k (99.9%)</option>
                                    <option value="22">22k (91.6%)</option>
                                    <option value="21">21k (87.5%)</option>
                                    <option value="18">18k (75.0%)</option>
                                    <option value="14">14k (58.5%)</option>
                                </select>
                                <div className={styles.dropdownIcon}>
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            <span>Deductions (Melting/Wastage)</span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Standard: 2-5%</span>
                        </label>
                        <div className={styles.deductionGrid}>
                            <div className={`${styles.inputWrapper} ${styles.inputCol}`}>
                                <span className="material-symbols-outlined icon">trending_down</span>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="0"
                                    value={deductionValue}
                                    onChange={(e) => setDeductionValue(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className={styles.unitCol}>
                                <select
                                    value={deductionUnit}
                                    onChange={(e) => setDeductionUnit(e.target.value as 'percent' | 'grams')}
                                >
                                    <option value="percent">%</option>
                                    <option value="grams">gms</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoBox}>
                        <span className="material-symbols-outlined icon">info</span>
                        <p>
                            Calculations are based on today's market rate. Net weight is derived after purity adjustment and deductions are applied.
                        </p>
                    </div>
                </div>

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
                                    {metalType === 'gold' ? `Gold (${purity}k)` : 'Silver (Fine)'}
                                </span>
                            </div>
                            <div className={styles.row}>
                                <span>Gross Weight</span>
                                <span className={styles.value}>{formatNumber(grossWeight)} g</span>
                            </div>
                            <div className={styles.row}>
                                <span>Purity Conversion {metalType === 'gold' && purity === 22 ? '(91.6%)' : ''}</span>
                                <span className={styles.value}>{formatNumber(purityConvertedWeight)} g</span>
                            </div>
                            <div className={styles.row}>
                                <span>Less: Deduction {deductionUnit === 'percent' ? `(${deductionValue}%)` : ''}</span>
                                <span className={`${styles.value} ${styles.negative}`}>-{formatNumber(deductionAmount)} g</span>
                            </div>

                            <div className={styles.divider}></div>

                            <div className={styles.row}>
                                <span className={styles.highlight}>Net Weight (24k eq.)</span>
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
                            <button className={styles.addBtn} onClick={() => onAddToInvoice?.(totalValue)}>
                                <span className="material-symbols-outlined">add_circle</span>
                                Add to Invoice
                            </button>
                            <div className={styles.secondaryActions}>
                                <button className={styles.printBtn}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                                    Print
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
            </div>

            <div className={styles.historySection}>
                <div className={styles.header}>
                    <h3>Recent Calculations</h3>
                    <a href="#">View All History</a>
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
                                    <th scope="col" style={{ textAlign: 'right' }}>Value</th>
                                    <th scope="col" style={{ textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>10:42 AM</td>
                                    <td>
                                        <div className={styles.metalBadge}>
                                            <div className={`${styles.dot} ${styles.gold}`}></div> Gold
                                        </div>
                                    </td>
                                    <td className={styles.fontMono}>15.450g</td>
                                    <td>22k</td>
                                    <td style={{ textAlign: 'right', fontWeight: 500, color: '#fff' }}>₹90,245.00</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ cursor: 'pointer' }}>more_horiz</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ExchangeCalculator;
