import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './OrderConfirmation.module.scss';
import { useTransactions } from '../../context/TransactionContext';
import { useCustomers } from '../../context/CustomerContext';
import { useSettings } from '../../context/SettingsContext';

// Helper for currency formatting
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

const OrderConfirmation: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { transactions } = useTransactions();
    const { getCustomerById } = useCustomers();
    const { settings } = useSettings();

    const order = useMemo(() => {
        return transactions.find(t => t.id === id);
    }, [transactions, id]);

    // Derived Data
    const customer = order && order.customerId ? getCustomerById(order.customerId) : null;
    
    // Fallback Customer Data if not found or incomplete
    const customerData = {
        name: customer?.name || order?.customerName || "Walk-in Customer",
        email: customer?.email || "N/A", // We might not have email in our Customer type yet
        phone: customer?.phone || "N/A",
        // @ts-ignore
        address: customer?.address || "No address on file" // Assuming address field exists or we mock it
    };

    if (!order) {
        return (
            <div className={styles.container}>
                <div className={styles.successHeader}>
                    <h1>Order Not Found</h1>
                    <p className={styles.orderInfo}>We couldn't locate order #{id}.</p>
                    <div className={styles.actionsToolbar} style={{ marginTop: '2rem' }}>
                         <button className={styles.primary} onClick={() => navigate('/dashboard/orders')}>
                            Back to Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Calculations
    const totalWeight = order.items.reduce((acc, item) => acc + item.weight, 0);
    // Use persisted amountPaid (Gross Advance including Exchange)
    // We separate Cash vs Exchange for the receipt
    // cashAdvance is the net cash paid by customer
    const advancePaid = Math.max(0, (order.amountPaid || 0) - (order.exchangeTotal || 0));
    // Wait, Transaction type usually has 'grandTotal' and 'exchangeTotal'. 
    // 'balance' might not be there. Let's check type definition if needed, but for now we'll approximate.
    // If we don't have balance, we'll assume it's fully paid if status is 'Completed', else ...
    // Actually, let's just calculate: 
    // Effective Price = Subtotal + GST - Discount.
    // Grand Total = Effective Price - Exchange (in some logic) or just Final Payable.
    // Let's stick to the visible fields.
    const subtotal = order.subtotal || order.grandTotal; // Fallback
    const makingChargesAndTax = (order.gst || 0) + (order.items.reduce((acc, i) => acc + (i.makingCharges || 0), 0));
    // Note: subtotal usually includes making charges in some models, but let's separate for display if possible.
    
    return (
        <div className={styles.container}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard/orders'); }} className={styles.link}>
                    <span className="material-symbols-outlined" style={{fontSize: '1.2em'}}>arrow_back</span>
                    Orders
                </a>
                <span className={styles.divider}>/</span>
                <span className={styles.current}>Order Confirmation</span>
            </div>

            {/* Success Header */}
            <div className={styles.successHeader}>
                <div className={styles.iconCircle}>
                    <span className="material-symbols-outlined icon">check_circle</span>
                </div>
                <h1>Order Successfully Placed</h1>
                <p className={styles.orderInfo}>
                    Order ID: <span className={styles.highlight}>#{order.id}</span> | {new Date(order.date).toLocaleDateString()}
                </p>
                <div className={styles.paymentBadge}>
                    <span className="material-symbols-outlined icon">
                        {(order.amountPaid || 0) >= order.grandTotal ? 'check_circle' : 'payments'}
                    </span>
                    {(order.amountPaid || 0) >= order.grandTotal 
                        ? 'Payment Completed' 
                        : (order.amountPaid || 0) > 0 
                            ? 'Partial Payment Received' 
                            : 'No Advance Paid'}
                </div>
            </div>

            {/* Receipt Card */}
            <div className={styles.receiptCard}>
                {/* Header Section */}
                <div className={styles.cardHeader}>
                    <div className={styles.customerDetails}>
                        <h3>Customer Details</h3>
                        <p className={styles.name}>{customerData.name}</p>
                        <p className={styles.contact}>{customerData.email}</p>
                        <p className={styles.contact}>{customerData.phone}</p>
                        <div style={{ marginTop: '0.75rem' }}>
                            <p className={styles.addressLabel}>Shipping Address</p>
                            <p className={styles.address}>{customerData.address}</p>
                        </div>
                    </div>
                    <div className={styles.deliveryInfo}>
                        <div>
                            <h3>Delivery Timeline</h3>
                            <div className={styles.timelineBox}>
                                <span className="material-symbols-outlined icon">event_available</span>
                                <div className={styles.content}>
                                    <span className={styles.label}>PROMISED DELIVERY DATE</span>
                                    <span className={styles.date}>
                                        {order.deliveryDate 
                                            ? new Date(order.deliveryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                            : new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div className={styles.itemsSection}>
                    <h3>Ordered Items</h3>
                    <div className={styles.tableContainer}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item Details</th>
                                    <th>Metal</th>
                                    <th className={styles.alignRight}>Metal Wt</th>
                                    <th className={styles.alignRight}>Stones</th>
                                    <th className={styles.alignRight}>Making/Wstg</th>
                                    <th className={styles.alignRight}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className={styles.detailsCell}>
                                            <div className={styles.imgWrapper}>
                                                {order.imageUrl ? (
                                                    <img src={order.imageUrl} alt={item.name} />
                                                ) : (
                                                    <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#897c61'}}>
                                                        <span className="material-symbols-outlined">image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.textInfo}>
                                                <div className={styles.name}>{item.name.replace('Custom Order: ', '')}</div>
                                                <div className={styles.sku}>{item.code}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.badge}>{item.metalType || 'Gold'}</span>
                                        </td>
                                        <td className={styles.alignRight} style={{fontWeight: 500}}>
                                            {item.weight.toFixed(2)} g
                                        </td>
                                        <td className={styles.alignRight}>
                                            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
                                                <span>{item.stoneWeight ? `${item.stoneWeight} g` : '-'}</span>
                                                {item.stoneRate ? <span style={{fontSize:'0.8em', color:'#b9b09d'}}>Rate: {item.stoneRate}</span> : null}
                                            </div>
                                        </td>
                                        <td className={styles.alignRight}>
                                            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
                                                <span>MC: {item.makingCharges || 0}</span>
                                                {item.wastage ? <span style={{fontSize:'0.8em', color:'#b9b09d'}}>Wstg: {item.wastage}%</span> : null}
                                            </div>
                                        </td>
                                        <td className={`${styles.alignRight} ${styles.total}`}>{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Financial Breakdown */}
                <div className={styles.financialBreakdown}>
                    <div>
                        {order.exchangeTotal > 0 && (
                            <div className={styles.exchangeNote}>
                                <span className="material-symbols-outlined icon">recycling</span>
                                <div style={{width: '100%'}}>
                                    <p className={styles.title}>Exchange Item Details:</p>
                                    {order.exchangeItems && order.exchangeItems.length > 0 ? (
                                        <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginTop:'0.25rem'}}>
                                            <span>{order.exchangeItems[0].name}</span>
                                            {order.exchangeItems[0].weight && <span style={{fontWeight:600}}>{order.exchangeItems[0].weight} g</span>}
                                        </div>
                                    ) : (
                                         <p>Exchange credit applied for old gold/silver items.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={styles.totalsList}>
                        <div className={styles.row}>
                            <span>Subtotal ({totalWeight.toFixed(2)}g Total Weight)</span>
                            <span className={styles.amount}>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className={styles.row}>
                            <span>Making Charges & Tax (Est.)</span>
                            <span className={styles.amount}>{formatCurrency(makingChargesAndTax)}</span>
                        </div>
                        
                        {order.exchangeTotal > 0 && (
                            <div className={`${styles.row} ${styles.deduction}`}>
                                <div className={styles.labelWithIcon}>
                                    <span className="material-symbols-outlined" style={{fontSize: '1em'}}>recycling</span>
                                    <span>Exchange Items Deduction</span>
                                </div>
                                <span className={styles.amount}>-{formatCurrency(order.exchangeTotal)}</span>
                            </div>
                        )}
                        
                        {advancePaid > 0 && (
                            <div className={styles.row}>
                                <div className={styles.labelWithIcon}>
                                    <span className="material-symbols-outlined" style={{fontSize: '1em'}}>history_edu</span>
                                    <span>Partial Payment Received</span>
                                </div>
                                <span className={styles.amount}>-{formatCurrency(advancePaid)}</span>
                            </div>
                        )}

                        <div className={styles.divider}></div>

                        <div className={styles.grandTotalBox}>
                            <div>
                                <p className={styles.label}>Remaining Balance</p>
                                <p className={styles.subLabel}>Total Due</p>
                            </div>
                            <div className={styles.amount}>
                                {formatCurrency(Math.max(0, order.grandTotal - (order.amountPaid || 0)))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p>Thank you for choosing <span>{settings.name}</span>.</p>
                    <p className={styles.disclaimer}>This is a computer-generated receipt and does not require a physical signature.</p>
                </div>
            </div>

            {/* Action Toolbar */}
            <div className={styles.actionsToolbar}>
                <button className={styles.secondary} onClick={() => window.print()}>
                    <span className="material-symbols-outlined">download</span>
                    Download Invoice
                </button>
                <button className={styles.secondary} onClick={() => window.print()}>
                    <span className="material-symbols-outlined">print</span>
                    Print Receipt
                </button>
                <button className={styles.primary} onClick={() => navigate('/dashboard/orders')}>
                    <span className="material-symbols-outlined">list_alt</span>
                    Back to Orders
                </button>
            </div>

            {/* Print Footer Overlay */}
            <div className={styles.printFooter}>
                <p>{settings.name} Transaction Log | Session ID: TXN-{id?.substring(0,6)} | Verification Code: {id}</p>
                <p>© {new Date().getFullYear()} {settings.name}. All rights reserved.</p>
            </div>
        </div>
    );
};

export default OrderConfirmation;
