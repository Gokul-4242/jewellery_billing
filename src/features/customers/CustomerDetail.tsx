import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CustomerDetail.module.scss';
import { Button } from '../../components/common';
import type { Customer } from '../../types/Customer';
import { useTransactions } from '../../context/useTransactions'; // Assuming context exists
import { useCustomers } from '../../context/useCustomers';

interface CustomerDetailProps {
    customer: Customer;
    onBack: () => void;
    onEdit: (customer: Customer) => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onBack, onEdit }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Purchase History');
    const [newNote, setNewNote] = useState('');
    const { updateCustomer } = useCustomers();
    const { transactions } = useTransactions();

    // Filter transactions for this customer
    // Note: In real app, we filter by ID. Mocks might not have IDs set perfectly, checking matching logic.
    const customerTransactions = transactions.filter(t => t.customerId === customer.id || t.customerName === customer.name);

    // Calculate dynamic stats
    const totalOrders = customerTransactions.length;
    // totalSpend is already in customer object but could be recalculated. User likely wants consistent data.
    // Let's use customer object for single source of truth for aggregate data, or recalculate if desired.
    // The prompt asks for "dynamic data". Recalculating ensures it stays in sync.
    const calculatedTotalSpend = customerTransactions.reduce((sum, t) => sum + t.grandTotal, 0);
    const lastPurchaseDate = customerTransactions.length > 0 
        ? new Date(Math.max(...customerTransactions.map(t => new Date(t.date).getTime()))).toLocaleDateString()
        : 'Never';

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;

        const note = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            author: 'Current Staff', // Ideally from auth context
            text: newNote
        };

        const updatedCustomer = {
            ...customer,
            notes: [note, ...(customer.notes || [])]
        };

        updateCustomer(updatedCustomer);
        setNewNote('');
    };

    return (
        <div className={styles.container}>
            {/* Breadcrumbs */}
            <nav className={styles.breadcrumbs}>
                <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Home</a>
                <span>/</span>
                <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Customers</a>
                <span>/</span>
                <span className={styles.current}>{customer.name}</span>
            </nav>

            {/* Profile Header */}
            <div className={styles.profileHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.profileInfo}>
                        <div className={styles.avatarWrapper}>
                            {customer.avatar ? (
                                <img src={customer.avatar} alt={customer.name} className={styles.avatar} />
                            ) : (
                                <div className={`${styles.avatar} flex items-center justify-center bg-surface-dark text-white text-4xl font-bold`}>
                                    {customer.name.split(' ').map(n => n[0]).join('')}
                                </div>
                            )}
                        </div>
                        <div className={styles.textDetails}>
                            <h1>{customer.name}</h1>
                            <p className={styles.subText}>Customer ID #{customer.id} • Joined {customer.joinedDate || 'Recent'}</p>
                            <div className={styles.tags}>
                                <span className={`${styles.tag} ${styles.active}`}>
                                    <span className={styles.dot}></span> Active
                                </span>
                                <span className={`${styles.tag} ${styles.location}`}>
                                    { /* Location is not in core type, removing or making purely optional if data existed */ }
                                    {[customer.city, customer.state].filter(Boolean).join(', ') || 'Tamil Nadu, India'} 
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <Button variant="secondary" icon="edit" onClick={() => onEdit(customer)}>
                            Edit Profile
                        </Button>
                        <Button variant="primary" icon="add" onClick={() => navigate('/dashboard/orders/new', { state: { customerId: customer.id } })}>
                            New Order
                        </Button>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.iconWrapper} ${styles.primary}`}>
                            <span className="material-symbols-outlined icon">payments</span>
                        </div>
                        <span className={styles.label}>Lifetime Value</span>
                    </div>
                    {/* Strictly dynamic: calculated from transactions only */}
                    <p className={styles.value}>{formatCurrency(calculatedTotalSpend)}</p>
                    <p className={`${styles.subInfo} ${styles.up}`}>
                        <span className="material-symbols-outlined trendIcon">trending_up</span> Based on {totalOrders} orders
                    </p>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.iconWrapper} ${styles.blue}`}>
                            <span className="material-symbols-outlined icon">shopping_bag</span>
                        </div>
                        <span className={styles.label}>Total Orders</span>
                    </div>
                    <p className={styles.value}>{totalOrders}</p>
                    <p className={`${styles.subInfo} ${styles.muted}`}>Last purchase {lastPurchaseDate}</p>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.iconWrapper} ${styles.purple}`}>
                            <span className="material-symbols-outlined icon">sell</span>
                        </div>
                        <span className={styles.label}>Avg. Ticket</span>
                    </div>
                    <p className={styles.value}>
                        {formatCurrency(totalOrders > 0 ? calculatedTotalSpend / totalOrders : 0)}
                    </p>
                    <p className={`${styles.subInfo} ${styles.muted}`}>Average per order</p>
                </div>
            </div>

            {/* Content Body */}
            <div className={styles.mainGrid}>
                {/* Left Column: Details & Notes */}
                <div className={styles.leftColumn}>
                    {/* Personal Info Card */}
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>
                            <h3>Client Details</h3>
                            <Button variant="ghost" icon="edit" onClick={() => onEdit(customer)}>Edit</Button>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.detailItem}>
                                <span className="material-symbols-outlined icon">mail</span>
                                <div className={styles.info}>
                                    <p className={styles.label}>Email Address</p>
                                    <p className={styles.text}><a href={`mailto:${customer.email}`}>{customer.email}</a></p>
                                </div>
                            </div>
                            <div className={styles.detailItem}>
                                <span className="material-symbols-outlined icon">call</span>
                                <div className={styles.info}>
                                    <p className={styles.label}>Phone Number</p>
                                    <p className={styles.text}><a href={`tel:${customer.phone}`}>{customer.phone}</a></p>
                                </div>
                            </div>
                            <div className={styles.detailItem}>
                                <span className="material-symbols-outlined icon">location_on</span>
                                <div className={styles.info}>
                                    <p className={styles.label}>Shipping Address</p>
                                    <p className={styles.text}>{customer.address ? `${customer.address}${customer.city ? ', ' + customer.city : ''}${customer.state ? ', ' + customer.state : ''}${customer.zip ? ' - ' + customer.zip : ''}` : 'Not provided'}</p>
                                </div>
                            </div>
                            {/* Removed Birthday/Anniversary details */}
                        </div>
                    </div>

                    {/* Notes Widget */}
                    <div className={`${styles.card} ${styles.notesWidget}`}>
                        <div className={styles.cardTitle}>
                            <h3>Staff Notes</h3>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.notesList}>
                                {customer.notes && customer.notes.length > 0 ? (
                                    customer.notes.map(note => (
                                        <div key={note.id} className={styles.noteItem}>
                                            <p className={styles.noteMeta}>{note.date} • by {note.author}</p>
                                            <p className={styles.noteText}>{note.text}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noteText} style={{ fontStyle: 'italic', color: '#94a3b8' }}>No notes added yet.</p>
                                )}
                            </div>
                            <div className={styles.noteInputWrapper}>
                                <textarea
                                    placeholder="Add a new note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                />
                                <button className={styles.sendBtn} onClick={handleAddNote}>
                                    <span className="material-symbols-outlined icon">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: History & Gallery */}
                <div className={styles.rightColumn}>
                    {/* Visual Gallery - Placeholder for now as we don't have images in transaction items easily accessible without mapping products, but we can try */}
                    <div className={`${styles.card} ${styles.gallerySection}`}>
                        <div className={styles.cardContent}>
                            <div className={styles.galleryHeader}>
                                <h3>Recent Purchases</h3>
                                <a href="#" className={styles.viewAll}>View Gallery</a>
                            </div>
                            <div className={styles.galleryList}>
                                {customerTransactions.length > 0 ? (
                                    customerTransactions.slice(0, 4).map(order => (
                                        <div key={order.id} className={styles.galleryItem}>
                                            {/* Logic to get image from first item would go here, using placeholder for now */}
                                            <div className={styles.imgWrapper} style={{ backgroundColor: '#2d2d2d' }}>
                                                <div className={styles.overlay}>
                                                    <span className="material-symbols-outlined text-white">visibility</span>
                                                </div>
                                            </div>
                                            <p className={styles.itemName}>{order.items[0]?.name || 'Unknown Item'}</p>
                                            <p className={styles.itemPrice}>{formatCurrency(order.grandTotal)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: '#94a3b8' }}>No purchase history.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Purchase History Tabs & Table */}
                    <div className={`${styles.card} ${styles.tabsSection}`}>
                        <div className={styles.tabsHeader}>
                            <button
                                className={activeTab === 'Purchase History' ? styles.active : ''}
                                onClick={() => setActiveTab('Purchase History')}
                            >
                                Purchase History
                            </button>
                            <button
                                className={activeTab === 'Wishlist' ? styles.active : ''}
                                onClick={() => setActiveTab('Wishlist')}
                            >
                                Wishlist (0)
                            </button>
                            <button
                                className={activeTab === 'Repairs & Service' ? styles.active : ''}
                                onClick={() => setActiveTab('Repairs & Service')}
                            >
                                Repairs & Service
                            </button>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.historyTable}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Order ID</th>
                                        <th>Items</th>
                                        <th>Payment</th>
                                        <th style={{ textAlign: 'right' }}>Total</th>
                                        <th style={{ textAlign: 'center' }}>Invoice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerTransactions.length > 0 ? (
                                        customerTransactions.map(order => (
                                            <tr key={order.id}>
                                                <td style={{ whiteSpace: 'nowrap' }}>{new Date(order.date).toLocaleDateString()}</td>
                                                <td style={{ color: '#b9b09d', fontFamily: 'monospace' }}>#{order.invoiceNo}</td>
                                                <td>
                                                    <div className={styles.orderItem}>
                                                        <span>{order.items.map(i => i.name).join(', ')}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={styles.tag}>{order.paymentMethod}</span>
                                                </td>
                                                <td style={{ textAlign: 'right' }} className={styles.orderTotal}>
                                                    {formatCurrency(order.grandTotal)}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button className={styles.invoiceBtn} title="Download Invoice">
                                                        <span className="material-symbols-outlined icon">description</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination removed for now as we show all */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;
