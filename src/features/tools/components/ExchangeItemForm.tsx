import React from 'react';
import classNames from 'classnames';
import styles from '../ExchangeCalculator.module.scss';
import { FormSelect, CustomDropdown } from '../../../components/common';

interface ExchangeItemFormProps {
    metalType: 'gold' | 'silver';
    setMetalType: (value: 'gold' | 'silver') => void;
    grossWeight: number;
    setGrossWeight: (value: number) => void;
    grossWeightRef: React.RefObject<HTMLInputElement | null>;
    purityLabel: string;
    setPurityLabel: (value: string) => void;
    goldPurities: string[];
    setGoldPurities: React.Dispatch<React.SetStateAction<string[]>>;
    silverPurities: string[];
    setSilverPurities: React.Dispatch<React.SetStateAction<string[]>>;
    deductionValue: number;
    setDeductionValue: (value: number) => void;
    deductionValueRef: React.RefObject<HTMLInputElement | null>;
    deductionUnit: 'percent' | 'grams';
    setDeductionUnit: (value: 'percent' | 'grams') => void;
    showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ExchangeItemForm: React.FC<ExchangeItemFormProps> = ({
    metalType,
    setMetalType,
    grossWeight,
    setGrossWeight,
    grossWeightRef,
    purityLabel,
    setPurityLabel,
    goldPurities,
    setGoldPurities,
    silverPurities,
    setSilverPurities,
    deductionValue,
    setDeductionValue,
    deductionValueRef,
    deductionUnit,
    setDeductionUnit,
    showToast
}) => {
    return (
        <div className={styles.formColumn}>
            <h3>Item Details</h3>

            <fieldset className={styles.formGroup}>
                <legend>Select Metal Type</legend>
                <div className={styles.metalSelector}>
                    <label
                        htmlFor="metal-gold"
                        className={classNames(styles.option, metalType === 'gold' && styles.active)}
                    >
                        <input
                            id="metal-gold"
                            type="radio"
                            name="metalType"
                            value="gold"
                            checked={metalType === 'gold'}
                            onChange={() => setMetalType('gold')}
                            className={styles.radioInput}
                        />
                        <span>Gold</span>
                    </label>
                    <label
                        htmlFor="metal-silver"
                        className={classNames(styles.option, metalType === 'silver' && styles.activeSilver)}
                    >
                        <input
                            id="metal-silver"
                            type="radio"
                            name="metalType"
                            value="silver"
                            checked={metalType === 'silver'}
                            onChange={() => setMetalType('silver')}
                            className={styles.radioInput}
                        />
                        <span>Silver</span>
                    </label>
                </div>
            </fieldset>

            <div className={styles.gridRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="gross-weight">Gross Weight (grams)</label>
                    <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined icon">scale</span>
                        <input
                            id="gross-weight"
                            ref={grossWeightRef}
                            type="number"
                            step="0.001"
                            placeholder="0.000"
                            value={grossWeight}
                            onChange={(e) => setGrossWeight(Number.parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="purity-select">Purity ({metalType === 'gold' ? 'Karat' : 'Purity'})</label>
                    <CustomDropdown
                        value={purityLabel}
                        options={metalType === 'gold' ? goldPurities : silverPurities}
                        onChange={(val) => setPurityLabel(val)}
                        onAddOption={(val) => {
                            if (metalType === 'gold') setGoldPurities(prev => [...prev, val]);
                            else setSilverPurities(prev => [...prev, val]);
                            showToast(`Added '${val}' to purity list`, 'success');
                        }}
                        allowCustom={true}
                        placeholder="Select Purity..."
                        className={styles.purityDropdown}
                        triggerClassName="purity-trigger"
                        menuClassName="purity-menu"
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="deduction-value">
                    <span>Deductions (Melting/Wastage)</span>
                    <span className={styles.mutedHint}>Standard: 2-5%</span>
                </label>
                <div className={styles.deductionGrid}>
                    <div className={`${styles.inputWrapper} ${styles.inputCol}`}>
                        <span className="material-symbols-outlined icon">trending_down</span>
                        <input
                            id="deduction-value"
                            ref={deductionValueRef}
                            type="number"
                            step="0.1"
                            placeholder="0"
                            value={deductionValue}
                            onChange={(e) => setDeductionValue(Number.parseFloat(e.target.value) || 0)}
                        />
                    </div>
                    <div className={styles.unitCol}>
                        <FormSelect
                            value={deductionUnit}
                            options={[
                                { value: 'percent', label: '%' },
                                { value: 'grams', label: 'gms' },
                            ]}
                            onChange={(val) => setDeductionUnit(val as 'percent' | 'grams')}
                            className={styles.unitSelect}
                        />
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
    );
};
