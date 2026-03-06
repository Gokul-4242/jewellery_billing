import React from 'react';
import styles from './DailySummary.module.scss';
import { useTransactions } from '../../context/TransactionContext';
import { useRates } from '../../context/RateContext';

import { useNavigate } from 'react-router-dom';

const DailySummary: React.FC = () => {
    const navigate = useNavigate();
    const { getTodayStats, getTransactionsByDate } = useTransactions();
    const { rates } = useRates();
    
    // Get live stats
    const stats = getTodayStats();
    
    // Get today's transactions
    const today = new Date();
    const todaysTransactions = getTransactionsByDate(today);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={styles.container}>


            {/* Page Heading */}
            <div className={styles.pageHeader}>
                <div className={styles.titleSection}>
                    <h1>Daily Business Summary</h1>
                    <p>Performance report for {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className={styles.actions}>
                    <button className={styles.primary} onClick={handlePrint}>
                        <span className={`material-symbols-outlined ${styles.icon}`}>print</span> Print Report
                    </button>
                    <button className={styles.secondary} onClick={() => alert('PDF Download Coming Soon')}>
                        <span className={`material-symbols-outlined ${styles.icon}`}>download</span> Download PDF
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className={styles.statsGrid}>
                {/* Card 1 */}
                <div className={styles.statsCard}>
                    <p className={styles.label}>Total Sales</p>
                    <p className={styles.value}>₹{stats.totalSales.toLocaleString('en-IN')}</p>
                    <div className={`${styles.trend} ${styles.positive}`}>
                        <span className={`material-symbols-outlined ${styles.trendIcon}`}>trending_up</span>
                        <span>Today's Revenue</span>
                    </div>
                </div>
                {/* Card 2 */}
                <div className={styles.statsCard}>
                    <p className={styles.label}>Total Weight Sold</p>
                    <p className={styles.value}>G: {stats.totalWeightNodes.gold.toFixed(1)}g | S: {stats.totalWeightNodes.silver.toFixed(1)}g</p>
                    <div className={`${styles.trend} ${styles.mutedText}`}>
                        <span className={`material-symbols-outlined ${styles.trendIcon}`}>scale</span>
                        <span>Across all items</span>
                    </div>
                </div>
                {/* Card 3 */}
                <div className={styles.statsCard}>
                    <p className={styles.label}>Total Exchange</p>
                    <p className={styles.value}>₹{stats.totalExchange.toLocaleString('en-IN')}</p>
                    <div className={`${styles.trend} ${styles.positive}`}>
                        <span className={`material-symbols-outlined ${styles.trendIcon}`}>currency_exchange</span>
                        <span>Value Traded In</span>
                    </div>
                </div>
                {/* Card 4 */}
                <div className={styles.statsCard}>
                    <p className={styles.label}>Transaction Count</p>
                    <div className={styles.cardFooter}>
                         <p className={styles.value}>{stats.transactionCount}</p>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.fill} style={{ width: '100%' }}></div>
                    </div>
                </div>
            </div>

            <div className={styles.mainGrid}>
                {/* Left Column */}
                <div className={styles.leftColumn}>
                    {/* Market Rates (Keep Static/Mock for now or integrate an API later) */}
                    <section>
                         <div className={styles.sectionTitle}>
                            <h2>Market Rates (Today)</h2>
                            <span className={styles.subtitle}>Last updated: 10:00 AM</span>
                        </div>
                        <div className={styles.marketRates}>
                            <div className={styles.rateCard}>
                                <div className={styles.header}>
                                    <span className={styles.metalName}>Gold (22K)</span>
                                    <span className={`material-symbols-outlined ${styles.icon}`}>diamond</span>
                                </div>
                                <div className={styles.rates}>
                                    <div className={styles.rateBlock}>
                                        <p className={styles.rateLabel}>Standard</p>
                                        <p className={styles.rateValue}>₹{rates.gold22k.toLocaleString('en-IN')}/g</p>
                                    </div>
                                    <div className={`${styles.rateBlock} ${styles.current}`}>
                                        <p className={styles.rateLabel}>Today</p>
                                        <p className={styles.rateValue}>₹{rates.gold22k.toLocaleString()}/g</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`${styles.rateCard} ${styles.silver}`}>
                                <div className={styles.header}>
                                    <span className={`${styles.metalName} ${styles.silverText}`}>Silver</span>
                                    <span className={`material-symbols-outlined ${styles.icon} ${styles.silverIcon}`}>layers</span>
                                </div>
                                <div className={styles.rates}>
                                    <div className={styles.rateBlock}>
                                        <p className={styles.rateLabel}>Standard</p>
                                        <p className={styles.rateValue}>₹{rates.silver.toLocaleString('en-IN')}/g</p>
                                    </div>
                                    <div className={`${styles.rateBlock} ${styles.current}`}>
                                        <p className={styles.rateLabel}>Today</p>
                                        <p className={styles.rateValue}>₹{rates.silver.toLocaleString()}/g</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Recent Transactions - DYNAMIC */}
                    <section>
                        <div className={styles.sectionTitle}>
                             <h2>Day's Transactions</h2>
                        </div>
                        <div className={styles.transactionsTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Payment</th>
                                        <th className={styles.textRight}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todaysTransactions.map(tx => (
                                        <tr 
                                            key={tx.id} 
                                            onClick={() => navigate(`/dashboard/invoice/view/${tx.id}`)}
                                            className={styles.clickable}
                                        >
                                            <td className={styles.id}>#{tx.invoiceNo.split('-')[1]}-{tx.invoiceNo.split('-')[2]}</td>
                                            <td className={styles.customer}>{tx.customerName}</td>
                                            <td className={styles.item}>{tx.items.length > 0 ? `${tx.items[0].name} (${tx.items.length > 1 ? '+' + (tx.items.length - 1) + ' more' : ''})` : 'No items'}</td>
                                            <td>
                                                <span className={`${styles.badge} ${tx.paymentMethod === 'UPI' || tx.paymentMethod === 'Card' ? styles.online : styles.cash}`}>
                                                    {tx.paymentMethod}
                                                </span>
                                            </td>
                                            <td className={styles.amount}>₹{tx.grandTotal.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                    {todaysTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className={styles.emptyMessage}>
                                                No transactions found for today.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Right Column (Placeholder for top selling as logic is complex for simple mock) */}
                <div className={styles.rightColumn}>
                     {/* Top Selling */}
                     <section>
                        <div className={styles.sectionTitle}>
                             <h2>Top Selling Items</h2>
                        </div>
                        <div className={styles.topItems}>
                            <div className={styles.itemCard}>
                                <div className={`${styles.iconBox} ${styles.gold}`}>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                </div>
                                <div className={styles.info}>
                                    <p className={styles.name}>Gold Rings</p>
                                    <p className={styles.description}>Most popular category</p>
                                </div>
                            </div>
                        </div>
                     </section>
                     {/* Payment Breakdown */}
                     <section>
                         <div className={styles.sectionTitle}>
                             <h2>Payment Breakdown</h2>
                        </div>
                        <div className={styles.paymentBreakdown}>
                            <div className={styles.breakdownList}>
                                <div className={styles.breakdownItem}>
                                    <div className={styles.header}>
                                        <span className={styles.label}>Cash Payments</span>
                                        <span className={styles.amount}>₹{stats.paymentBreakdown.Cash.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className={styles.progressTrack}>
                                        <div className={`${styles.progressFill} ${styles.primary}`} style={{ width: `${stats.totalSales ? (stats.paymentBreakdown.Cash / stats.totalSales * 100) : 0}%` }}></div>
                                    </div>
                                </div>
                                <div className={styles.breakdownItem}>
                                    <div className={styles.header}>
                                        <span className={styles.label}>Credit/Debit Card</span>
                                        <span className={styles.amount}>₹{stats.paymentBreakdown.Card.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className={styles.progressTrack}>
                                        <div className={`${styles.progressFill} ${styles.secondary}`} style={{ width: `${stats.totalSales ? (stats.paymentBreakdown.Card / stats.totalSales * 100) : 0}%` }}></div>
                                    </div>
                                </div>
                                <div className={styles.breakdownItem}>
                                    <div className={styles.header}>
                                        <span className={styles.label}>UPI / Digital Wallet</span>
                                        <span className={styles.amount}>₹{stats.paymentBreakdown.UPI.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className={styles.progressTrack}>
                                        <div className={`${styles.progressFill} ${styles.tertiary}`} style={{ width: `${stats.totalSales ? (stats.paymentBreakdown.UPI / stats.totalSales * 100) : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </section>
                </div>
            </div>
        </div>
    );
};

export default DailySummary;
