import React, { useState, useMemo, useRef } from 'react';

import { useNavigate } from 'react-router-dom';
import styles from './CostEstimator.module.scss';
import { Button } from '../../components/common';
import { useRates } from '../../context/RateContext';
import { useToast } from '../../context/ToastContext';

interface CostEstimatorProps {
    exchangeValue: number;
    onExchangeValueChange: (value: number) => void;
    onOpenExchangeCalculator?: () => void;
}

const CostEstimator: React.FC<CostEstimatorProps> = ({
    exchangeValue,
    onExchangeValueChange,
    onOpenExchangeCalculator
}) => {
    const navigate = useNavigate();
    const { rates } = useRates();
    const { showToast } = useToast();

    const grossWeightRef = useRef<HTMLInputElement>(null);

    // State
    const [metalType, setMetalType] = useState<'gold' | 'silver'>('gold');
    const [grossWeight, setGrossWeight] = useState<number>(12.5);
    const [wastagePercent, setWastagePercent] = useState<number>(12);
    const [makingCharges, setMakingCharges] = useState<number>(450);
    const [makingChargesType, setMakingChargesType] = useState<'fixed' | 'percent'>('fixed');
    const [addStoneCharges, setAddStoneCharges] = useState<boolean>(false);
    const [exchangeEnabled, setExchangeEnabled] = useState<boolean>(true);

    const [marketRateOverride, setMarketRateOverride] = useState<number | null>(null);

    // Market rate derived from metalType (no useEffect needed)
    const marketRate = marketRateOverride ?? (metalType === 'gold' ? rates.gold22k : rates.silver);

    // Cost breakdown - derived from inputs (no useEffect needed)
    const { materialCost, wastageAmount, makingChargesAmount, subtotal, grossEstimate, netPayable } = useMemo(() => {
        const matCost = grossWeight * marketRate;
        const wastCost = matCost * (wastagePercent / 100);
        let makCost = 0;
        if (makingChargesType === 'fixed') {
            makCost = makingCharges * grossWeight;
        } else {
            makCost = matCost * (makingCharges / 100);
        }
        const sub = matCost + wastCost + makCost;
        const gross = sub;
        const net = gross - (exchangeEnabled ? exchangeValue : 0);
        return {
            materialCost: matCost,
            wastageAmount: wastCost,
            makingChargesAmount: makCost,
            subtotal: sub,
            grossEstimate: gross,
            netPayable: net
        };
    }, [grossWeight, marketRate, wastagePercent, makingCharges, makingChargesType, exchangeEnabled, exchangeValue]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Reset function
    const handleReset = () => {
        setGrossWeight(0);
        setWastagePercent(0);
        setMakingCharges(0);
        setMakingChargesType('fixed');
        setAddStoneCharges(false);
        setExchangeEnabled(false);
        onExchangeValueChange(0);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h2>Cost Estimator</h2>
                    <div className={styles.rates}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
                        <span>
                            Today's Rates: <span className={styles.rateHighlight}>Gold ₹{rates.gold22k.toLocaleString('en-IN')}/g</span> | <span className={styles.rateSilver}>Silver ₹{rates.silver.toLocaleString('en-IN')}/g</span>
                        </span>
                    </div>
                </div>
                <div className={styles.actions}>
                    <Button variant="secondary" icon="history">
                        History
                    </Button>
                    <Button variant="primary" icon="add" onClick={handleReset}>
                        New Estimate
                    </Button>
                </div>
            </div>

            <div className={styles.gridContainer}>
                <div className={styles.calculatorSection}>
                    <div className={styles.metalSelector} style={{ width: 'fit-content' }}>
                        <label className={styles.metalOption}>
                            <input
                                type="radio"
                                name="metal_type"
                                checked={metalType === 'gold'}
                                onChange={() => setMetalType('gold')}
                            />
                            <div className={`${styles.optionLabel} ${styles.gold}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>stars</span>
                                Gold
                            </div>
                        </label>
                        <label className={styles.metalOption}>
                            <input
                                type="radio"
                                name="metal_type"
                                checked={metalType === 'silver'}
                                onChange={() => setMetalType('silver')}
                            />
                            <div className={`${styles.optionLabel} ${styles.silver}`}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>radio_button_unchecked</span>
                                Silver
                            </div>
                        </label>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>
                                <span className="material-symbols-outlined" style={{ color: '#e29d12' }}>tune</span>
                                Parameters
                            </h3>
                        </div>

                        <div className={styles.inputGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="gross_weight">Gross Weight</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="gross_weight"
                                        ref={grossWeightRef}
                                        type="number"
                                        value={grossWeight}
                                        onChange={(e) => setGrossWeight(Number.parseFloat(e.target.value) || 0)}
                                        className={styles.hasSuffix}
                                        placeholder="0.00"
                                    />
                                    <span className={styles.suffix}>gms</span>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="market_rate">Current Market Rate</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="market_rate"
                                        type="number"
                                        value={marketRate}
                                        onChange={(e) => setMarketRateOverride(Number.parseFloat(e.target.value) || 0)}
                                        className={`${styles.hasPrefix} ${styles.hasSuffix}`}
                                        placeholder="0"
                                    />
                                    <span className={styles.prefix}>₹</span>
                                    <span className={`${styles.suffix} ${styles.small}`}>/ gm</span>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="wastage_percent">Wastage (VA)</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="wastage_percent"
                                        type="number"
                                        value={wastagePercent}
                                        onChange={(e) => setWastagePercent(Number.parseFloat(e.target.value) || 0)}
                                        className={styles.hasSuffix}
                                        placeholder="0"
                                    />
                                    <span className={styles.suffix}>%</span>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label htmlFor="making_charges" style={{ marginBottom: 0 }}>Making Charges</label>
                                    <div className={styles.toggleSwitch}>
                                        <button 
                                            type="button"
                                            className={makingChargesType === 'fixed' ? styles.active : ''} 
                                            onClick={() => setMakingChargesType('fixed')}
                                        >
                                            ₹
                                        </button>
                                        <button 
                                            type="button"
                                            className={makingChargesType === 'percent' ? styles.active : ''} 
                                            onClick={() => setMakingChargesType('percent')}
                                        >
                                            %
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="making_charges"
                                        type="number"
                                        value={makingCharges}
                                        onChange={(e) => setMakingCharges(Number.parseFloat(e.target.value) || 0)}
                                        className={`${makingChargesType === 'fixed' ? styles.hasPrefix : ''} ${styles.hasSuffix}`}
                                        placeholder="0"
                                    />
                                    {makingChargesType === 'fixed' && <span className={styles.prefix}>₹</span>}
                                    <span className={`${styles.suffix} ${styles.small}`}>
                                        {makingChargesType === 'fixed' ? '/ gm' : '%'}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.formGroup} style={{ gridColumn: 'span 1' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        id="add_stone"
                                        checked={addStoneCharges}
                                        onChange={(e) => setAddStoneCharges(e.target.checked)}
                                        style={{ width: '1rem', height: '1rem', accentColor: '#e29d12' }}
                                    />
                                    <label htmlFor="add_stone" className={styles.checkboxLabel} style={{ cursor: 'pointer' }}>Add Stone Charges</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>
                                <span className="material-symbols-outlined" style={{ color: '#4ade80' }}>currency_exchange</span>
                                Old Gold Exchange
                            </h3>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={exchangeEnabled}
                                    onChange={(e) => setExchangeEnabled(e.target.checked)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        <div className={styles.inputGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="exchange_value">Exchange Value</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="exchange_value"
                                        type="number"
                                        value={exchangeValue}
                                        onChange={(e) => onExchangeValueChange(Number.parseFloat(e.target.value) || 0)}
                                        disabled={!exchangeEnabled}
                                        className={styles.hasPrefix}
                                        style={{ opacity: exchangeEnabled ? 1 : 0.5 }}
                                        placeholder="0.00"
                                    />
                                    <span className={styles.prefix}>₹</span>
                                </div>
                                <span className={styles.helpText}>Calculated value from old items</span>
                            </div>

                            <div className={styles.formGroup} style={{ justifyContent: 'flex-end' }}>
                                <button
                                    className={`${styles.btn} ${styles.secondary}`}
                                    style={{ height: '3rem', justifyContent: 'center', color: '#b9b09d' }}
                                    onClick={onOpenExchangeCalculator}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calculate</span>
                                    Open Exchange Calculator
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.summarySection}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryHeader}>
                            <span className={styles.title}>
                                <span className="material-symbols-outlined">receipt_long</span>
                                Estimation Summary
                            </span>
                            <span className={styles.badge}>DRAFT</span>
                        </div>

                        <div className={styles.summaryContent}>
                            <div className={styles.summaryRow}>
                                <span className={styles.label}>
                                    Material Cost <small>({grossWeight}g x {marketRate})</small>
                                </span>
                                <span className={styles.value}>{formatCurrency(materialCost)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.label}>
                                    Wastage <small>({wastagePercent}%)</small>
                                </span>
                                <span className={styles.value}>{formatCurrency(wastageAmount)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.label}>Making Charges</span>
                                <span className={styles.value}>{formatCurrency(makingChargesAmount)}</span>
                            </div>

                            <div className={`${styles.divider} ${styles.dashed}`}></div>

                            <div className={styles.summaryRow}>
                                <span className={styles.label}>Subtotal</span>
                                <span className={styles.value}>{formatCurrency(subtotal)}</span>
                            </div>

                            <div className={`${styles.divider} ${styles.solid}`}></div>

                            <div className={styles.summaryRow}>
                                <span className={styles.label}>Gross Estimate</span>
                                <span className={styles.value}>{formatCurrency(grossEstimate)}</span>
                            </div>

                            {exchangeEnabled && (
                                <div className={`${styles.summaryRow} ${styles.highlight}`}>
                                    <span className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove_circle_outline</span>
                                        Less: Exchange
                                    </span>
                                    <span className={`${styles.value} ${styles.negative}`}>- {formatCurrency(exchangeValue)}</span>
                                </div>
                            )}

                            <div className={styles.totalAmount}>
                                <span>Net Payable Amount</span>
                                <span>₹ {formatCurrency(netPayable)}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button className={`${styles.btn} ${styles.secondary}`} style={{ justifyContent: 'center' }} onClick={handleReset}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
                                    Reset
                                </button>
                                <button className={`${styles.btn} ${styles.primary}`} style={{ justifyContent: 'center' }} onClick={() => {
                                    if (!grossWeight || grossWeight <= 0) {
                                        showToast('Please enter gross weight', 'error');
                                        grossWeightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        setTimeout(() => grossWeightRef.current?.focus(), 500);
                                        return;
                                    }
                                    showToast('Estimate saved to history', 'success');
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                                    Save
                                </button>
                            </div>

                            <button 
                                className={styles.printBtn}
                                onClick={() => navigate('/dashboard/billing')}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>receipt_long</span>
                                Generate Bill / Print
                            </button>
                        </div>
                    </div>

                    {/* <div className={styles.tipCard}>
                        <span className="material-symbols-outlined">info</span>
                        <div className={styles.tipContent}>
                            <p>Quick Tip</p>
                            <p>Wastage percentage usually ranges between 10-18% for intricate gold jewelry designs.</p>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default CostEstimator;
