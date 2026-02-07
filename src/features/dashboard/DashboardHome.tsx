import React from 'react';
import styles from './Dashboard.module.scss';
import StatsCard from './StatsCard';
import InventoryTable from '../inventory/InventoryTable';
import { Button } from '../../components/common';
import { useInventory } from '../../context/InventoryContext';

import { useRates } from '../../context/RateContext';

const DashboardHome: React.FC = () => {
    const { products } = useInventory();
    const { rates } = useRates();

    const [tableFilter, setTableFilter] = React.useState<'All' | 'Alerts'>('All');
    const inventoryRef = React.useRef<HTMLDivElement>(null);

    // Calculate Stats
    const goldStock = products
        .filter(p => (p.material || '').toLowerCase().includes('gold') && p.status === 'In Stock')
        .reduce((sum, p) => sum + p.weight, 0);

    const silverStock = products
        .filter(p => (p.material || '').toLowerCase().includes('silver') && p.status === 'In Stock')
        .reduce((sum, p) => sum + p.weight, 0);

    const lowStockCount = products.filter(p => p.status === 'Low Stock').length;
    const outOfStockCount = products.filter(p => p.status === 'Out of Stock').length;

    // Valuation based on current market rates
    const totalValuation = (goldStock * rates.gold22k) + (silverStock * rates.silver);

    const handleAlertClick = () => {
        setTableFilter('Alerts');
        inventoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={styles.contentWrapper}>
            {/* Page Heading */}
            <div className={styles.pageHeader}>
                <div className={styles.titleSection}>
                    <h2>Stock Overview</h2>
                    <p>Manage your gold and silver inventory, track valuations in real-time, and update product listings.</p>
                </div>
                <div className={styles.actions}>
                    <Button variant="secondary" icon="file_download">
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
                    trendLabel="Market Value"
                    trendDirection="up"
                    isHighlight={true}
                />
            </div>

            {/* Main Interface */}
            <div ref={inventoryRef}>
                <InventoryTable initialStatusFilter={tableFilter} />
            </div>
        </div>
    );
};

export default DashboardHome;
