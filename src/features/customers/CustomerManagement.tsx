import React, { useState, useMemo } from 'react';
import styles from './CustomerManagement.module.scss';
import { Button } from '../../components/common';
import { useCustomers } from '../../context/CustomerContext';
import type { Customer } from '../../types/Customer';

interface CustomerManagementProps {
    onSelectCustomer?: (customer: Customer) => void;
    onEditCustomer?: (customer: Customer) => void;
    onAddCustomer?: () => void;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ onSelectCustomer, onEditCustomer, onAddCustomer }) => {
    const { customers } = useCustomers();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');

    // Filtering and Sorting Logic
    const filteredCustomers = useMemo(() => {
        let result = [...customers];

        // Search Filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(lowerSearch) ||
                c.phone.includes(lowerSearch) ||
                c.id.toLowerCase().includes(lowerSearch) ||
                c.email.toLowerCase().includes(lowerSearch)
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'spend_desc':
                    return b.totalSpend - a.totalSpend;
                case 'spend_asc':
                    return a.totalSpend - b.totalSpend;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'recent':
                default:
                    // For mock purposes, "recent" just uses ID or assuming lastVisit order
                    // In a real app, this would use a timestamp
                    return b.id.localeCompare(a.id);
            }
        });

        return result;
    }, [searchTerm, sortBy, customers]);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });
    };


    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first, last, and pages around current
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className={styles.container}>
            {/* Page Heading */}
            <header className={styles.pageHeader}>
                <div className={styles.titleBlock}>
                    <h1>Customer Management</h1>
                    <p>
                        Manage customer records, track VIP status, view purchase history, and update contact profiles for personalized service.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="secondary" icon="file_download">
                        Export List
                    </Button>
                    <Button variant="primary" icon="add" onClick={onAddCustomer}>
                        Add Customer
                    </Button>
                </div>
            </header>

            {/* Stats Overview */}
            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.cardTop}>
                        <span className={styles.label}>Total Customers</span>
                        <span className="material-symbols-outlined icon">group</span>
                    </div>
                    <p className={styles.value}>1,240</p>
                    <div className={`${styles.trend} ${styles.up}`}>
                        <span className="material-symbols-outlined trendIcon">trending_up</span>
                        <span>+5% vs last month</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.cardTop}>
                        <span className={styles.label}>New This Month</span>
                        <span className="material-symbols-outlined icon">person_add</span>
                    </div>
                    <p className={styles.value}>45</p>
                    <div className={`${styles.trend} ${styles.up}`}>
                        <span className="material-symbols-outlined trendIcon">trending_up</span>
                        <span>+12% vs last month</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.cardTop}>
                        <span className={styles.label}>VIP Clients</span>
                        <span className="material-symbols-outlined icon">diamond</span>
                    </div>
                    <p className={styles.value}>120</p>
                    <div className={`${styles.trend} ${styles.neutral}`}>
                        <span>Stable</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.cardTop}>
                        <span className={styles.label}>Avg. Spend</span>
                        <span className="material-symbols-outlined icon">currency_rupee</span>
                    </div>
                    <p className={styles.value}>₹42k</p>
                    <div className={`${styles.trend} ${styles.up}`}>
                        <span className="material-symbols-outlined trendIcon">trending_up</span>
                        <span>+2.4%</span>
                    </div>
                </div>
            </section>

            {/* Filters & Search Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <label>Search</label>
                    <div className={styles.inputWrapper}>
                        <span className="material-symbols-outlined searchIcon">search</span>
                        <input
                            type="text"
                            placeholder="Search by name, phone, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <label>Sort By</label>
                        <div className={styles.selectWrapper}>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="recent">Recently Active</option>
                                <option value="spend_desc">Highest Spend</option>
                                <option value="spend_asc">Lowest Spend</option>
                                <option value="name">Name (A-Z)</option>
                            </select>
                            <span className="material-symbols-outlined dropdownIcon">sort</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Data Table */}
            <div className={styles.tableContainer}>
                <div className={styles.tableWrapper}>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Contact Info</th>
                                <th>Total Spend</th>
                                <th>Last Visit</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCustomers.length > 0 ? (
                                paginatedCustomers.map((customer) => (
                                    <tr key={customer.id} onClick={() => onSelectCustomer?.(customer)} style={{ cursor: onSelectCustomer ? 'pointer' : 'default' }}>
                                        <td style={{ fontFamily: 'monospace', color: '#b9b09d' }}>#{customer.id}</td>
                                        <td>
                                            <div className={styles.custInfo}>
                                                {customer.avatar ? (
                                                    <img src={customer.avatar} alt={customer.name} className={styles.avatar} />
                                                ) : (
                                                    <div className={styles.initials}>
                                                        {customer.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                )}
                                                <div className={styles.details}>
                                                    <span className={styles.name}>{customer.name}</span>
                                                    <span className={styles.joined}>Joined {customer.joinedDate}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.contactBlock}>
                                                <div className={styles.phone}>
                                                    <span className="material-symbols-outlined icon">call</span>
                                                    {customer.phone}
                                                </div>
                                                <div className={styles.email}>
                                                    <span className="material-symbols-outlined icon">mail</span>
                                                    {customer.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.spendBlock}>
                                                <p className={styles.amount}>
                                                    {formatCurrency(customer.totalSpend)}
                                                </p>
                                                <p className={styles.transactions}>{customer.transactionCount} Transactions</p>
                                            </div>
                                        </td>
                                        <td className={styles.lastVisit}>{customer.lastVisit}</td>
                                        <td align="right">
                                            <div className={styles.actions}>
                                                <Button
                                                    variant="ghost"
                                                    icon="visibility"
                                                    onClick={(e) => { e.stopPropagation(); onSelectCustomer?.(customer); }}
                                                    title="View Profile"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    icon="edit"
                                                    onClick={(e) => { e.stopPropagation(); onEditCustomer?.(customer); }}
                                                    title="Edit Details"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#b9b09d' }}>
                                        No customers found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredCustomers.length > 0 && (
                    <footer className={styles.pagination}>
                        <p className={styles.info}>
                            Showing <strong>{((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)}</strong> of <strong>{filteredCustomers.length}</strong> {filteredCustomers.length === 1 ? 'customer' : 'customers'}
                        </p>
                        <div className={styles.pages}>
                            <button 
                                className={styles.iconBtn} 
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            
                            {getPageNumbers().map((page, index) => (
                                page === '...' ? (
                                    <span key={`dots-${index}`} className={styles.dots}>...</span>
                                ) : (
                                    <button 
                                        key={page} 
                                        className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                                        onClick={() => handlePageChange(page as number)}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}

                            <button 
                                className={styles.iconBtn} 
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default CustomerManagement;
