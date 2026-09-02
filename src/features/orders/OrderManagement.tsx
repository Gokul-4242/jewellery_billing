import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OrderManagement.module.scss';
import { Button, CustomDropdown } from '../../components/common'; // Reusing common button if suitable, or just standard HTML buttons as styled
import { useTransactions } from '../../context/useTransactions';
import type { Transaction } from '../../types/Transaction';

const ITEMS_PER_PAGE = 10;

const OrderManagement: React.FC = () => {
    const { transactions } = useTransactions();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [metalFilter, setMetalFilter] = useState<string>('All Orders'); // 'All Orders', 'Gold', 'Silver', 'Custom Alloy'
    const [dateRange, setDateRange] = useState<string>('All Time');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter Logic
    const filteredOrders = useMemo(() => {
        return transactions.filter(order => {
            // Search
            const matchesSearch = 
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

            // Status Filter
            const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

            // Metal Filter
            let matchesMetal = true;
            if (metalFilter !== 'All Orders') {
                const hasGold = order.items.some(i => i.name.toLowerCase().includes('gold') || i.purity.includes('22k') || i.purity.includes('24k') || i.purity.includes('18k'));
                const hasSilver = order.items.some(i => i.name.toLowerCase().includes('silver') || i.purity.includes('925'));
                const hasPlatinum = order.items.some(i => i.name.toLowerCase().includes('platinum'));
                
                if (metalFilter === 'Gold') matchesMetal = hasGold;
                else if (metalFilter === 'Silver') matchesMetal = hasSilver;
                else if (metalFilter === 'Platinum') matchesMetal = hasPlatinum;
                else if (metalFilter === 'Mixed') matchesMetal = hasGold && hasSilver;
            }

            // Date Filter
            let matchesDate = true;
            if (dateRange !== 'All Time') {
                const orderDate = new Date(order.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Normalize today

                if (dateRange === 'Today') {
                    matchesDate = orderDate.toDateString() === today.toDateString();
                } else if (dateRange === 'Last 7 Days') {
                    const last7 = new Date(today);
                    last7.setDate(today.getDate() - 7);
                    matchesDate = orderDate >= last7;
                } else if (dateRange === 'This Month') {
                    matchesDate = orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
                } else if (dateRange === 'Last Month') {
                    const lastMonth = new Date(today);
                    lastMonth.setMonth(today.getMonth() - 1);
                    matchesDate = orderDate.getMonth() === lastMonth.getMonth() && orderDate.getFullYear() === lastMonth.getFullYear();
                }
            }

            return matchesSearch && matchesStatus && matchesMetal && matchesDate;
        });
    }, [transactions, searchTerm, statusFilter, metalFilter, dateRange]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Helper to get formatted date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Helper to get formatted currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });
    };

    // Helper to determine metal type label for display
    const getMetalLabel = (order: Transaction) => {
        const hasGold = order.items.some(i => i.name.toLowerCase().includes('gold') || i.purity.includes('22k') || i.purity.includes('18k'));
        const hasSilver = order.items.some(i => i.name.toLowerCase().includes('silver'));
        
        if (hasGold && hasSilver) return 'Mixed';
        if (hasGold) return '24k Gold'; 
        if (hasSilver) return 'Sterling Silver';
        return 'Other';
    };

    const getMetalClass = (label: string) => {
        if (label.includes('Gold')) return styles.gold;
        if (label.includes('Silver')) return styles.silver;
        return styles.other;
    };

    return (
        <div className={styles.container}>
            {/* Page Heading */}
            <header className={styles.pageHeader}>
                <div className={styles.titleBlock}>
                    <h1>Order Management</h1>
                    <p>Review, update, and process premium metal orders</p>
                </div>
                <Button variant="primary" icon="add" onClick={() => navigate('/dashboard/orders/new')}>
                    New Order
                </Button>
            </header>

            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.filterBar}>
                    {/* Search */}
                    <div className={styles.searchBox}>
                        <div className={styles.inputWrapper}>
                            <span className="material-symbols-outlined searchIcon">search</span>
                            <input 
                                type="text" 
                                placeholder="Search orders by ID or customer name" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filter Chips */}
                    <div className={styles.filterChips} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '150px' }}>
                            <CustomDropdown 
                                options={['All Time', 'Today', 'Last 7 Days', 'This Month', 'Last Month']}
                                value={dateRange}
                                onChange={setDateRange}
                                placeholder="Date Range"
                                label=""
                            />
                        </div>
                        <div style={{ width: '160px' }}>
                            <CustomDropdown 
                                options={['All', 'Pending', 'In Production', 'Quality Check', 'Completed', 'Cancelled']}
                                value={statusFilter}
                                onChange={setStatusFilter}
                                placeholder="Order Status"
                                label=""
                            />
                        </div>
                        <div style={{ width: '150px' }}>
                            <CustomDropdown 
                                options={['All Orders', 'Gold', 'Silver', 'Mixed', 'Platinum']}
                                value={metalFilter}
                                onChange={setMetalFilter}
                                placeholder="Metal Type"
                                label=""
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Metal Filters */}
                <div className={styles.quickFilters}>
                    {['All Orders', 'Gold', 'Silver'].map(filter => (
                        <button 
                            key={filter}
                            className={metalFilter === filter ? styles.active : styles.inactive}
                            onClick={() => setMetalFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className={styles.tableContainer}>
                <div className={styles.tableWrapper}>
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Metal</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.length > 0 ? (
                                paginatedOrders.map(order => {
                                    const metalLabel = getMetalLabel(order);
                                    return (
                                        <tr key={order.id}>
                                            <td className={styles.textPrimary}>#{order.invoiceNo || order.id}</td>
                                            <td>
                                                <div className={styles.customerCell}>
                                                    <div className={styles.initials}>
                                                        {order.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <span className={styles.name}>{order.customerName}</span>
                                                </div>
                                            </td>
                                            <td className={styles.textMuted}>{formatDate(order.date)}</td>
                                            <td>
                                                <span className={`${styles.metalBadge} ${getMetalClass(metalLabel)}`}>
                                                    {metalLabel}
                                                </span>
                                            </td>
                                            <td className={styles.textBold}>{formatCurrency(order.grandTotal)}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                                                    <span className={styles.dot}></span>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`${styles.paymentStatus} ${order.status === 'Completed' ? styles.paid : styles.unpaid}`}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                                                        {order.status === 'Completed' ? 'check_circle' : 'error'}
                                                    </span>
                                                    {order.status === 'Completed' ? 'Paid' : 'Unpaid'}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className={styles.actionBtn}
                                                    onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#b9b09d' }}>
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredOrders.length > 0 && (
                    <div className={styles.pagination}>
                        <p>Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders</p>
                        <div className={styles.pages}>
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            
                            {/* Simplified pagination buttons for now */}
                            {[...Array(Math.min(3, totalPages))].map((_, i) => (
                                <button 
                                    key={i + 1} 
                                    className={currentPage === i + 1 ? styles.active : ''}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                             {totalPages > 3 && <span>...</span>}

                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderManagement;
