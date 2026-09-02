import React from 'react';
import classNames from 'classnames';
import styles from '../ExchangeCalculator.module.scss';
import type { RateTrend } from '../types';

interface ExchangeRateHeaderProps {
    onBack?: () => void;
    goldRate22k: number;
    silverRateFine: number;
    goldTrend: RateTrend;
    silverTrend: RateTrend;
    isEditingRates: boolean;
    setIsEditingRates: (value: boolean) => void;
    setGoldRate22k: (value: number) => void;
    setSilverRateFine: (value: number) => void;
    formatNumber: (num: number, decimals?: number) => string;
    goldRateRef: React.RefObject<HTMLInputElement | null>;
    silverRateRef: React.RefObject<HTMLInputElement | null>;
}

const getTrendIcon = (direction: string) => {
    if (direction === 'up') return 'trending_up';
    if (direction === 'down') return 'trending_down';
    return 'remove';
};

const getTrendClass = (direction: string) => {
    if (direction === 'up') return styles.up;
    if (direction === 'down') return styles.down;
    return styles.stable;
};

export const ExchangeRateHeader: React.FC<ExchangeRateHeaderProps> = ({
    onBack,
    goldRate22k,
    silverRateFine,
    goldTrend,
    silverTrend,
    isEditingRates,
    setIsEditingRates,
    setGoldRate22k,
    setSilverRateFine,
    formatNumber,
    goldRateRef,
    silverRateRef
}) => {
    const goldTrendCls = getTrendClass(goldTrend.direction);
    const goldTrendIc = getTrendIcon(goldTrend.direction);
    
    const silverTrendCls = getTrendClass(silverTrend.direction);
    const silverTrendIc = getTrendIcon(silverTrend.direction);

    return (
        <section className={styles.headerSection}>
            <div className={styles.titleBlock}>
                <div className={styles.rateDisplay}>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className={styles.backBtn}
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                    )}
                    <h1>Exchange Calculator</h1>
                </div>
                <p className={styles.date}>
                    <span className={`material-symbols-outlined ${styles.icon}`}>calendar_today</span> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            <div className={styles.statsBlock}>
                <div className={styles.statCard}>
                    <div className={styles.label}>
                        <span className={classNames("material-symbols-outlined", styles.labelIcon, styles.gold)}>monetization_on</span> Gold Rate (22k)
                    </div>
                    <div className={styles.value}>
                        {isEditingRates ? (
                            <div className={styles.rateInputWrapper}>
                                <span className={styles.currencySymbol}>₹</span>
                                <input
                                    ref={goldRateRef}
                                    type="number"
                                    value={goldRate22k}
                                    onChange={(e) => setGoldRate22k(Number.parseFloat(e.target.value) || 0)}
                                    className={styles.rateInput}
                                />
                            </div>
                        ) : (
                            <div className={styles.rateDisplay}>
                                <span>₹{formatNumber(goldRate22k, 2)} <span className={styles.unit}>/g</span></span>
                                <span className={classNames(styles.trendBadge, goldTrendCls)}>
                                    <span className={`material-symbols-outlined ${styles.trendIcon}`}>
                                        {goldTrendIc}
                                    </span> {goldTrend.percent}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.label}>
                        <span className={classNames("material-symbols-outlined", styles.labelIcon, styles.silver)}>diamond</span> Silver Rate (Fine)
                    </div>
                    <div className={styles.value}>
                        {isEditingRates ? (
                            <div className={styles.rateInputWrapper}>
                                <span className={styles.currencySymbol}>₹</span>
                                <input
                                    ref={silverRateRef}
                                    type="number"
                                    value={silverRateFine}
                                    onChange={(e) => setSilverRateFine(Number.parseFloat(e.target.value) || 0)}
                                    className={styles.rateInput}
                                />
                            </div>
                        ) : (
                            <div className={styles.rateDisplay}>
                                <span>₹{formatNumber(silverRateFine, 2)} <span className={styles.unit}>/g</span></span>
                                <span className={classNames(styles.trendBadge, silverTrendCls)}>
                                    <span className={`material-symbols-outlined ${styles.trendIcon}`}>
                                        {silverTrendIc}
                                    </span>
                                    {silverTrend.percent}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    className={classNames(styles.editBtn, isEditingRates && styles.active)}
                    onClick={() => setIsEditingRates(!isEditingRates)}
                >
                    <span className={`material-symbols-outlined icon`}>
                        {isEditingRates ? 'check' : 'edit'}
                    </span>
                    <span className="text">{isEditingRates ? 'Done' : 'Edit'}</span>
                </button>
            </div >
        </section >
    );
};
