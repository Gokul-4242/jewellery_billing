import React from 'react';
import styles from './Dashboard.module.scss';
import StatsCard from './StatsCard';
import InventoryTable from '../inventory/InventoryTable';
import { Button } from '../../components/common';
import { useInventory } from '../../context/InventoryContext';

import { useRates } from '../../context/RateContext';
import { useSettings } from '../../context/SettingsContext';
import ExportReportModal from './ExportReportModal';
import { useTransactions } from '../../context/useTransactions';

import type { Transaction } from '../../types/Transaction';

const DashboardHome: React.FC = () => {
    const { products } = useInventory();
    const { rates, getTrend } = useRates();
    const { settings } = useSettings();
    const { transactions } = useTransactions();

    const [tableFilter, setTableFilter] = React.useState<'All' | 'Alerts'>('All');
    const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
    const [isAlertDismissed, setIsAlertDismissed] = React.useState(false);
    const [isOrderAlertDismissed, setIsOrderAlertDismissed] = React.useState(false);
    const inventoryRef = React.useRef<HTMLDivElement>(null);

    // Calculate Market Fluctuation
    const goldTrend = getTrend(rates.gold22k, rates.previous?.gold22k);
    const hasSignificantFluctuation = Number.parseFloat(goldTrend.percent) >= 2;
    const showMarketAlert = settings.notifications.marketAlerts && hasSignificantFluctuation && !isAlertDismissed;

    // Calculate Order Reminders
    const upcomingOrders = transactions.filter((t: Transaction) => {
        if (!t.deliveryDate || t.status === 'Completed' || t.status === 'Cancelled') return false;
        const deadline = new Date(t.deliveryDate);
        const now = new Date();
        const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 48; // Due within 48 hours
    });

    const newOrdersCount = transactions.filter((t: Transaction) => {
        const orderDate = new Date(t.date);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
    }).length;

    const showOrderAlert = (upcomingOrders.length > 0 || newOrdersCount > 0) && !isOrderAlertDismissed;



    // Calculate Stats
    const goldStock = products
        .filter(p => (p.material || '').toLowerCase().includes('gold'))
        .reduce((sum, p) => sum + (p.weight * (p.quantity || 0)), 0);

    const silverStock = products
        .filter(p => (p.material || '').toLowerCase().includes('silver'))
        .reduce((sum, p) => sum + (p.weight * (p.quantity || 0)), 0);

    const lowStockCount = products.filter(p => p.status === 'Low Stock').length;
    const outOfStockCount = products.filter(p => p.status === 'Out of Stock').length;

    // Valuation based on current market rates and all cost components
    const totalValuation = products
        .reduce((sum, p) => {
            const material = (p.material || '').toLowerCase();
            let rate = 0;
            if (material.includes('gold')) {
                rate = material.includes('24k') ? rates.gold24k : rates.gold22k;
            } else if (material.includes('silver')) {
                rate = rates.silver;
            }
            
            const wastage = p.wastagePercent || 0;
            const effectiveWeight = p.weight * (1 + wastage / 100);
            const itemMetalValue = effectiveWeight * rate;
            const itemMakingValue = (p.makingCharge || 0) * p.weight;
            const itemStoneValue = p.stoneCost || 0;
            
            const totalItemValue = itemMetalValue + itemMakingValue + itemStoneValue;
            return sum + (totalItemValue * (p.quantity || 0));
        }, 0);

    // Valuation trend calculation
    const previousGoldRate = rates.previous?.gold22k || rates.gold22k;
    const previousSilverRate = rates.previous?.silver || rates.silver;
    const previousValuation = (goldStock * previousGoldRate) + (silverStock * previousSilverRate);
    const valuationTrend = getTrend(totalValuation, previousValuation);

    const handleAlertClick = () => {
        setTableFilter('Alerts');
        inventoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={styles.contentWrapper}>
            {/* Market Alert Banner */}
            {showMarketAlert && (
                <div className={styles.alertBanner}>
                    <div className={styles.alertContent}>
                        <span className="material-symbols-outlined">trending_up</span>
                        <p>
                            <strong>Market Alert:</strong> Gold prices have shifted by {goldTrend.percent}% {goldTrend.direction}. 
                            Update your item prices to maintain margins.
                        </p>
                    </div>
                    <button className={styles.dismissBtn} onClick={() => setIsAlertDismissed(true)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            )}

            {/* Order Reminder Banner */}
            {showOrderAlert && (
                <div className={`${styles.alertBanner} ${styles.infoAlert}`}>
                    <div className={styles.alertContent}>
                        <span className="material-symbols-outlined">notifications_active</span>
                        <p>
                            <strong>Order Reminder:</strong> {upcomingOrders.length > 0 ? `${upcomingOrders.length} orders are due soon.` : ''} 
                            {newOrdersCount > 0 ? ` You have ${newOrdersCount} new orders today.` : ''}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="secondary" onClick={() => window.location.href = '/dashboard/orders'}>
                            View Orders
                        </Button>
                        <button className={styles.dismissBtn} onClick={() => setIsOrderAlertDismissed(true)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Page Heading */}
            <div className={styles.pageHeader}>
                <div className={styles.titleSection}>
                    <h2>Stock Overview</h2>
                    <p>Manage your gold and silver inventory, track valuations in real-time, and update product listings.</p>
                </div>
                <div className={styles.actions}>
                    <Button 
                        variant="secondary" 
                        icon="file_download"
                        onClick={() => setIsExportModalOpen(true)}
                    >
                        Export Report
                    </Button>

                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <StatsCard
                    label="Total Gold Stock"
                    value={goldStock.toFixed(3)}
                    unit="g"
                    icon="workspace_premium"
                    trendLabel="In Stock"
                    trendDirection="up"
                    isHighlight={false}
                />
                <StatsCard
                    label="Total Silver Stock"
                    value={silverStock.toFixed(3)}
                    unit="g"
                    icon="diamond"
                    trendLabel="In Stock"
                    trendDirection="up"
                    isHighlight={false}
                />
                <StatsCard
                    label="Stock Alerts"
                    value={lowStockCount + outOfStockCount}
                    unit="Items"
                    icon="warning"
                    trend={outOfStockCount > 0 ? `${outOfStockCount} Out of Stock` : "No urgent issues"}
                    trendLabel={lowStockCount > 0 ? `${lowStockCount} Low` : ""}
                    trendDirection={outOfStockCount > 0 ? "down" : "flat"}
                    isHighlight={false}
                    onClick={handleAlertClick}
                />
                <StatsCard
                    label="Total Inventory Value"
                    value={`₹${totalValuation.toLocaleString('en-IN')}`}
                    icon="monetization_on"
                    trend={`₹${rates.gold22k}/g Gold`}
                    trendLabel={valuationTrend.direction === 'stable' ? 'Stable Market' : 'Market Value'}
                    trendDirection={valuationTrend.direction === 'stable' ? 'flat' : valuationTrend.direction}
                    isHighlight={true}
                />
            </div>

            {/* Main Interface */}
            <div ref={inventoryRef}>
                <InventoryTable initialStatusFilter={tableFilter} />
            </div>
            <ExportReportModal 
                isOpen={isExportModalOpen} 
                onClose={() => setIsExportModalOpen(false)} 
            />
        </div>
    );
};

export default DashboardHome;
