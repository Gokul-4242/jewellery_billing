import React, { useState, useMemo, useRef, useEffect } from 'react';

import styles from './ExchangeCalculator.module.scss';
import { useRates } from '../../context/RateContext';
import { useToast } from '../../context/ToastContext';
import { ExchangeRateHeader } from './components/ExchangeRateHeader';
import { ExchangeItemForm } from './components/ExchangeItemForm';
import { EstimationSummary } from './components/EstimationSummary';
import { CalculationHistory } from './components/CalculationHistory';
import type { CalculationHistoryItem, ExchangeCalculatorProps } from './types';

const getPurityFactor = (label: string): number => {
    const percentMatch = /\((\d+\.?\d*)%\)/.exec(label);
    const karatMatch = /(\d+)k/i.exec(label);
    const directPercentMatch = /(\d+\.?\d*)%/.exec(label);

    if (percentMatch) return Number.parseFloat(percentMatch[1]) / 91.6;
    if (karatMatch) return Number.parseInt(karatMatch[1]) / 22;
    if (directPercentMatch) return Number.parseFloat(directPercentMatch[1]) / 91.6;

    const rawVal = Number.parseFloat(label);
    if (!Number.isNaN(rawVal)) {
        return rawVal > 1 ? rawVal / 91.6 : rawVal;
    }
    return 1;
};

const ExchangeCalculator: React.FC<ExchangeCalculatorProps> = ({ onBack, onAddToInvoice }) => {
    const { rates, getTrend } = useRates();
    const { showToast } = useToast();

    // State
    const [metalType, setMetalType] = useState<'gold' | 'silver'>('gold');
    const [grossWeight, setGrossWeight] = useState<number>(15.45);
    const [goldPurities, setGoldPurities] = useState<string[]>(['24k (99.9%)', '22k (91.6%)', '21k (87.5%)', '18k (75.0%)', '14k (58.5%)']);
    const [silverPurities, setSilverPurities] = useState<string[]>(['Fine (99.9%)', 'Sterling (92.5%)', 'Coin (90.0%)']);
    const [purityLabel, setPurityLabel] = useState<string>('22k (91.6%)');
    const [deductionValue, setDeductionValue] = useState<number>(2.5);
    const [deductionUnit, setDeductionUnit] = useState<'percent' | 'grams'>('percent');
    const [goldRate22k, setGoldRate22k] = useState<number>(rates.gold22k);
    const [silverRateFine, setSilverRateFine] = useState<number>(rates.silver);
    const [isEditingRates, setIsEditingRates] = useState<boolean>(false);
    const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
        const stored = localStorage.getItem('exchangeHistory');
        return stored ? JSON.parse(stored) : [];
    });

    const grossWeightRef = useRef<HTMLInputElement>(null);
    const deductionValueRef = useRef<HTMLInputElement>(null);
    const goldRateRef = useRef<HTMLInputElement>(null);
    const silverRateRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        localStorage.setItem('exchangeHistory', JSON.stringify(history));
    }, [history]);

    const { netWeight, purityConvertedWeight, deductionAmount, totalValue, appliedRate } = useMemo(() => {
        const purityFactor = getPurityFactor(purityLabel);
        const convertedWeight = grossWeight * purityFactor;
        const deduc = deductionUnit === 'percent' ? convertedWeight * (deductionValue / 100) : deductionValue;
        const net = convertedWeight - deduc;
        const rate = metalType === 'gold' ? goldRate22k : silverRateFine;
        return {
            purityConvertedWeight: convertedWeight,
            deductionAmount: deduc,
            netWeight: net,
            totalValue: net * rate,
            appliedRate: rate
        };
    }, [metalType, grossWeight, purityLabel, deductionValue, deductionUnit, goldRate22k, silverRateFine]);

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

    const handleAddToInvoice = () => {
        if (!grossWeight || grossWeight <= 0) {
            showToast('Please enter gross weight', 'error');
            grossWeightRef.current?.focus();
            return;
        }

        const newCalc: CalculationHistoryItem = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            metalType,
            grossWeight,
            purity: purityLabel,
            totalValue
        };

        setHistory(prev => [newCalc, ...prev].slice(0, 10));
        onAddToInvoice?.(totalValue);
        showToast('Calculation added to invoice', 'success');
    };

    return (
        <div className={styles.container}>
            <ExchangeRateHeader 
                onBack={onBack}
                goldRate22k={goldRate22k}
                silverRateFine={silverRateFine}
                goldTrend={getTrend(rates.gold22k, rates.previous?.gold22k)}
                silverTrend={getTrend(rates.silver, rates.previous?.silver)}
                isEditingRates={isEditingRates}
                setIsEditingRates={setIsEditingRates}
                setGoldRate22k={setGoldRate22k}
                setSilverRateFine={setSilverRateFine}
                formatNumber={formatNumber}
                goldRateRef={goldRateRef}
                silverRateRef={silverRateRef}
            />

            <div className={styles.mainGrid}>
                <ExchangeItemForm 
                    metalType={metalType}
                    setMetalType={setMetalType}
                    grossWeight={grossWeight}
                    setGrossWeight={setGrossWeight}
                    grossWeightRef={grossWeightRef}
                    purityLabel={purityLabel}
                    setPurityLabel={setPurityLabel}
                    goldPurities={goldPurities}
                    setGoldPurities={setGoldPurities}
                    silverPurities={silverPurities}
                    setSilverPurities={setSilverPurities}
                    deductionValue={deductionValue}
                    setDeductionValue={setDeductionValue}
                    deductionValueRef={deductionValueRef}
                    deductionUnit={deductionUnit}
                    setDeductionUnit={setDeductionUnit}
                    showToast={showToast}
                />

                <EstimationSummary 
                    metalType={metalType}
                    purityLabel={purityLabel}
                    grossWeight={grossWeight}
                    purityConvertedWeight={purityConvertedWeight}
                    deductionAmount={deductionAmount}
                    deductionUnit={deductionUnit}
                    deductionValue={deductionValue}
                    netWeight={netWeight}
                    appliedRate={appliedRate}
                    totalValue={totalValue}
                    formatNumber={formatNumber}
                    formatCurrency={formatCurrency}
                    handleAddToInvoice={handleAddToInvoice}
                    setGrossWeight={setGrossWeight}
                    setDeductionValue={setDeductionValue}
                />
            </div>

            <CalculationHistory 
                history={history}
                setHistory={setHistory}
                formatNumber={formatNumber}
                showToast={showToast}
            />
        </div>
    );
};

export default ExchangeCalculator;
    