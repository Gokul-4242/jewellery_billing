import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './OrderDetail.module.scss';
import { useTransactions } from '../../context/TransactionContext'; // Using context instead of prop drilling

// Helper to format currency
const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });
};

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { transactions, updateTransaction } = useTransactions();
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Find the current transaction
    const order = useMemo(() => {
        return transactions.find(t => t.id === id);
    }, [transactions, id]);

    

    if (!order) {
        return <div className={styles.container}>Order not found.</div>;
    }

    // Derive display values from the Order Transaction
    const orderId = order.invoiceNo || order.id;
    const isUrgent = order.grandTotal > 50000; // Mock logic for 'Urgent' tag based on value
    const hasExchange = order.exchangeTotal > 0;
    const balanceDue = Math.max(0, order.grandTotal - (order.amountPaid || 0));

    // Calculate remaining days
    const targetDate = new Date(order.deliveryDate || order.date);
    const today = new Date();
    // Reset hours to compare dates only
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    // Calculate difference in time and convert to days
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const daysRemainingText = order.status === 'Cancelled' ? "Order Cancelled" : (diffDays > 0 
        ? `${diffDays} Day${diffDays === 1 ? '' : 's'} remaining`
        : diffDays === 0 
            ? "Due Today" 
            : `${Math.abs(diffDays)} Day${Math.abs(diffDays) === 1 ? '' : 's'} Overdue`);

    const getStatusColorClass = (days: number) => {
        if (order.status === 'Cancelled') return styles.error;
        if (days < 0) return styles.error; // Overdue
        if (days <= 3) return styles.warning; // Urgent
        return styles.success; // On track
    };

    const handleStatusClick = (status: string) => {
        if (status === 'Cancelled') {
            setShowCancelModal(true);
            setShowStatusMenu(false);
        } else {
            // @ts-ignore
            updateTransaction({ ...order, status });
            setShowStatusMenu(false);
        }
    };

    const confirmCancellation = () => {
        if (!cancelReason.trim()) return;

        // @ts-ignore
        updateTransaction({ 
            ...order, 
            status: 'Cancelled',
            cancellationReason: cancelReason
        });
        setShowCancelModal(false);
        setCancelReason('');
    };

    return (
        <div className={styles.container}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard/orders'); }} className={styles.link}>Orders</a>
                <span className={styles.separator}>/</span>
                <span className={styles.link}>Custom Requests</span>
                <span className={styles.separator}>/</span>
                <span className={styles.current}>{orderId}</span>
            </div>

            {/* Page Headers */}
            <div className={styles.pageHeader}>
                <div className={styles.titleSection}>
                    <h2>Custom Order Specification</h2>
                    <div className={styles.metaInfo}>
                        <span>Order ID: #{orderId}</span>
                        <span className={styles.dot}></span>
                        <span>Customer: {order.customerName}</span>
                        {isUrgent && <span className={styles.badge}>Urgent</span>}
                        {order.status === 'Cancelled' && <span className={styles.badge} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Cancelled</span>}
                    </div>
                </div>
                <div className={styles.actions}>
                    <button className={styles.secondary}>
                        <span className="material-symbols-outlined icon">print</span>
                        Print Job Card
                    </button>
                    <button 
                        className={styles.primary}
                        onClick={() => navigate(`/dashboard/orders/edit/${order.id}`)}
                    >
                        <span className="material-symbols-outlined icon">edit</span>
                        Edit Specification
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className={styles.mainGrid}>
                
                {/* Left Column: Specs */}
                <div className={styles.leftColumn}>
                    {/* Design Sketch Card */}
                    <div className={`${styles.card} ${styles.whiteBg}`}>
                        <div className={styles.cardHeader}>
                            <h3>
                                <span className="material-symbols-outlined icon">draw</span>
                                Design Model / Sketch
                            </h3>
                            <span className={styles.tag}>Reference Image</span>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.designSection}>
                                <div className={styles.imageContainer}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top right, rgba(226, 157, 18, 0.1), transparent)' }}></div>
                                    {order.imageUrl ? (
                                        <img 
                                            src={order.imageUrl} 
                                            alt="Design Render" 
                                            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                                        />
                                    ) : (
                                        <div style={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            height: '100%',
                                            color: '#b9b09d'
                                        }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '1rem' }}>image_not_supported</span>
                                            <p>No design image uploaded</p>
                                        </div>
                                    )}
                                    {order.imageUrl && (
                                        <button className={styles.zoomBtn}>
                                            <span className="material-symbols-outlined">zoom_in</span>
                                        </button>
                                    )}
                                </div>
                                <div className={styles.detailsContainer}>
                                    <div>
                                        <h4>Design Description</h4>
                                        <p>
                                            {order.items.map(i => i.name.replace('Custom Order: ', '')).join(', ') || "No detailed description available."}
                                        </p>
                                    </div>
                                    <div className={styles.specGrid}>
                                        <div className={styles.specItem}>
                                            <div className={styles.label}>Metal Preference</div>
                                            <div className={styles.value}>
                                                {order.items[0]?.purity || 'Standard Gold'}
                                            </div>
                                        </div>
                                        <div className={styles.specItem}>
                                            <div className={styles.label}>Ring Size</div>
                                            <div className={styles.value}>See Description</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Material & Delivery Split */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        
                        {/* Material Details */}
                        <div className={`${styles.card} ${styles.whiteBg}`}>
                            <div className={styles.cardHeader}>
                                <h3>
                                    <span className="material-symbols-outlined icon">inventory_2</span>
                                    Material Details
                                </h3>
                            </div>
                            <div className={styles.cardBody}>
                                <ul className={styles.materialList}>
                                    <li>
                                        <span className={styles.label}>Est. Gold Weight</span>
                                        <span className={styles.val}>{order.items.reduce((acc, i) => acc + i.weight, 0).toFixed(2)} grams</span>
                                    </li>
                                    <li>
                                        <span className={styles.label}>Purity</span>
                                        <span className={styles.val}>{order.items[0]?.purity || 'Unknown'}</span>
                                    </li>
                                    <li>
                                        <span className={styles.label}>Stone Details</span>
                                        <span className={styles.val}>As per design</span>
                                    </li>
                                    <li>
                                        <span className={styles.label}>Making Charges</span>
                                        <span className={styles.val}>{(order.items[0]?.makingCharges || 0).toLocaleString()}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Commitment/Dates */}
                        <div className={`${styles.card} ${styles.commitmentCard}`}>
                            <div className={styles.bgIcon}>
                                <span className="material-symbols-outlined">event_upcoming</span>
                            </div>
                            <div className={styles.cardHeader} style={{ background: 'transparent', border: 'none' }}>
                                <h3>
                                    <span className="material-symbols-outlined icon">schedule</span>
                                    Commitment
                                </h3>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.commitmentContent}>
                                    <span className={styles.label}>Committed Delivery Date</span>
                                    <span className={styles.date}>{targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    <span className={classNames(styles.countdown, getStatusColorClass(diffDays))}>{daysRemainingText}</span>
                                    
                                    <div className={styles.quote}>
                                        {order.status === 'Cancelled' ? (
                                            <>
                                                <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '0.25rem' }}>Cancellation Reason:</div>
                                                {order.cancellationReason || "No reason provided."}
                                            </>
                                        ) : (
                                            diffDays < 0 ? "Order is delayed. Prioritize immediately." : 
                                            diffDays <= 7 ? "Delivery date approaching soon." : 
                                            "Order is on schedule."
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Special Instructions */}
                    <div className={`${styles.card} ${styles.whiteBg}`}>
                        <div className={styles.cardHeader}>
                            <h3>
                                <span className="material-symbols-outlined icon">note</span>
                                Special Instructions
                            </h3>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.instructionBox}>
                                <p>
                                    {order.items.map(i => i.name.replace('Custom Order: ', '')).join('\n') || "No special instructions provided."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Financials & Tracking */}
                <div className={styles.rightColumn}>
                    
                    {/* Financial Summary */}
                    <div className={`${styles.card} ${styles.financialCard}`}>
                        <div className={styles.header}>
                            <h3>Financial Summary</h3>
                        </div>
                        <div className={styles.body}>
                            <div className={styles.row}>
                                <span>Total Order Value</span>
                                <span className={styles.val}>{formatCurrency(order.grandTotal)}</span>
                            </div>
                            <div className={styles.row}>
                                <span>Partial Payment Received</span>
                                <span className={`${styles.val} ${styles.green}`}>-{formatCurrency(Math.max(0, (order.amountPaid || 0) - (order.exchangeTotal || 0)))}</span>
                            </div>
                            {hasExchange && <div className={styles.row}>
                                <span>Exchange Credit</span>
                                <span className={`${styles.val} ${styles.green}`}>-{formatCurrency(order.exchangeTotal)}</span>
                            </div>}
                            
                            <div className={styles.divider}></div>

                            <div className={styles.totalRow}>
                                <span className={styles.label}>Balance Due</span>
                                <span className={styles.amount}>{formatCurrency(balanceDue)}</span>
                            </div>

                            <button className={styles.payBtn}>Receive Payment</button>
                        </div>
                    </div>

                    {/* Progress Tracker */}
                    <div className={`${styles.card} ${styles.whiteBg}`}>
                        <div className={styles.cardHeader}>
                            <h3>
                                <span className="material-symbols-outlined icon">analytics</span>
                                Progress Tracker
                            </h3>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.progressGrid}>
                                {/* Step 1: Order Placed (Always Done) */}
                                <div className={styles.trackCol}>
                                    <span className={`material-symbols-outlined icon ${styles.success}`}>check_circle</span>
                                    <div className={`${styles.line} ${styles.med} ${order.status !== 'Pending' && order.status !== 'Cancelled' ? styles.success : styles.pending}`}></div>
                                </div>
                                <div className={styles.contentCol}>
                                    <div className={styles.title}>Order Placed</div>
                                    <div className={styles.subtitle}>{new Date(order.date).toLocaleDateString()} • In Store</div>
                                </div>

                                {/* Step 2: Cancelled (Condition) */}
                                {order.status === 'Cancelled' ? (
                                    <>
                                        <div className={styles.trackCol}>
                                            <span className={`material-symbols-outlined icon ${styles.canceled}`}>cancel</span>
                                        </div>
                                        <div className={styles.contentCol}>
                                            <div className={styles.title} style={{ color: '#ef4444' }}>Order Cancelled</div>
                                            <div className={styles.subtitle}>Process Halted</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Step 2: Design Approval */}
                                        <div className={styles.trackCol}>
                                            <span className={`material-symbols-outlined icon ${styles.success}`}>check_circle</span>
                                            <div className={`${styles.line} ${styles.med} ${order.status !== 'Pending' ? styles.success : styles.pending}`}></div>
                                        </div>
                                        <div className={styles.contentCol}>
                                            <div className={styles.title}>Design Approval</div>
                                            <div className={styles.subtitle}>CAD Dept</div>
                                        </div>

                                        {/* Step 3: Production */}
                                        <div className={styles.trackCol}>
                                            {order.status === 'In Production' ? (
                                                <div className={styles.pulseCircle}><div className={styles.inner}></div></div>
                                            ) : (order.status === 'Completed' || order.status === 'Quality Check') ? (
                                                <span className={`material-symbols-outlined icon ${styles.success}`}>check_circle</span>
                                            ) : (
                                                <span className={`material-symbols-outlined icon ${styles.pending}`}>circle</span>
                                            )}
                                            <div className={`${styles.line} ${styles.long} ${(order.status === 'Completed' || order.status === 'Quality Check') ? styles.success : styles.pending}`}></div>
                                        </div>
                                        <div className={styles.contentCol}>
                                            <div className={`${styles.title} ${order.status === 'In Production' ? styles.primary : (order.status === 'Completed' || order.status === 'Quality Check') ? '' : styles.muted}`}>In Production</div>
                                            <div className={styles.subtitle}>{order.status === 'In Production' ? 'Bench: In Progress' : 'Casting Phase'}</div>
                                            {order.status === 'In Production' && (
                                                <div className={styles.progressBar}>
                                                    <div className={styles.fill} style={{ width: '50%' }}></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Step 4: Quality Check */}
                                        <div className={styles.trackCol}>
                                                {order.status === 'Quality Check' ? (
                                                <div className={styles.pulseCircle}><div className={styles.inner}></div></div>
                                            ) : (order.status === 'Completed') ? (
                                                <span className={`material-symbols-outlined icon ${styles.success}`}>check_circle</span>
                                            ) : (
                                                <span className={`material-symbols-outlined icon ${styles.pending}`}>circle</span>
                                            )}
                                            <div className={`${styles.line} ${styles.med} ${order.status === 'Completed' ? styles.success : styles.pending}`}></div>
                                        </div>
                                        <div className={styles.contentCol}>
                                            <div className={`${styles.title} ${order.status === 'Quality Check' ? styles.primary : order.status === 'Completed' ? '' : styles.muted}`}>Quality Check</div>
                                            <div className={styles.subtitle}>Lab Certification</div>
                                        </div>

                                        {/* Step 5: Final Delivery */}
                                        <div className={styles.trackCol}>
                                            <span className={`material-symbols-outlined icon ${order.status === 'Completed' ? styles.success : styles.pending}`}>verified</span>
                                        </div>
                                        <div className={styles.contentCol}>
                                            <div className={`${styles.title} ${order.status === 'Completed' ? '' : styles.muted}`}>Final Delivery</div>
                                            <div className={styles.subtitle}>Target: {new Date(order.date).toLocaleDateString()}</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div style={{ position: 'relative' }}>
                                <button 
                                    className={styles.updateStatusBtn}
                                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                                >
                                    Update Status ({order.status})
                                </button>
                                {showStatusMenu && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        width: '100%',
                                        backgroundColor: '#221c10',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.5rem',
                                        marginTop: '0.5rem',
                                        zIndex: 10,
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                    }}>
                                        {['Pending', 'In Production', 'Quality Check', 'Completed', 'Cancelled'].map(status => (
                                            <button
                                                key={status}
                                                className={styles.dropdownItem}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    textAlign: 'left',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem'
                                                }}
                                                onClick={() => handleStatusClick(status)}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className={`${styles.card} ${styles.whiteBg}`}>
                        <div className={styles.cardHeader}>
                            <h3>
                                <span className="material-symbols-outlined icon">history</span>
                                Activity Log
                            </h3>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.logContainer}>
                                <div className={styles.logItem}>
                                    <div className={styles.avatar}>MS</div>
                                    <div className={styles.logContent}>
                                        <p><span className={styles.bold}>Michael S.</span> moved order to <span className={styles.primary}>In Production</span></p>
                                        <span className={styles.time}>2 hours ago</span>
                                    </div>
                                </div>
                                <div className={styles.logItem}>
                                    <div className={styles.avatar}>SYS</div>
                                    <div className={styles.logContent}>
                                        <p><span className={styles.bold}>System</span> automatically updated CAD approval status.</p>
                                        <span className={styles.time}>Oct 12, 14:20</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {/* Cancellation Modal */}
            {showCancelModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Cancel Order</h3>
                        <p>Please provide a reason for cancelling this order. This will be recorded in the system.</p>
                        <textarea 
                            placeholder="Enter cancellation reason (Required)..." 
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowCancelModal(false)}>Back</button>
                            <button 
                                className={styles.confirmBtn} 
                                onClick={confirmCancellation}
                                disabled={!cancelReason.trim()}
                                style={{ opacity: !cancelReason.trim() ? 0.5 : 1, cursor: !cancelReason.trim() ? 'not-allowed' : 'pointer' }}
                            >
                                Confirm Cancellation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
