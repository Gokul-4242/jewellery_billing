import React, { useRef, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import styles from './InvoiceViewer.module.scss';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import type { InvoiceData, BillingItem } from './types';
import { useTransactions } from '../../context/TransactionContext';
import { useCustomers } from '../../context/CustomerContext';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import signImg from '../../assets/sign in inovice page.png';

const InvoiceViewer: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const componentRef = useRef<HTMLDivElement>(null);
    
    // Contexts
    const { transactions } = useTransactions();
    const { getCustomerById } = useCustomers();
    const { showToast } = useToast();
    const { settings } = useSettings();

    // Resolve Data
    const data: InvoiceData | null = useMemo(() => {
        // 1. Try State (fresh invoice)
        if (location.state?.data) {
            return location.state.data as InvoiceData;
        }

        // 2. Try ID lookup
        if (id) {
            const tx = transactions.find(t => t.id === id);
            if (tx) {
                const customer = tx.customerId ? getCustomerById(tx.customerId) : undefined;
                
                return {
                    invoiceNo: tx.invoiceNo,
                    date: new Date(tx.date).toLocaleDateString(),
                    customer: {
                        name: tx.customerName,
                        phone: customer?.phone || 'N/A',
                        address: 'Address not stored', // Assumption
                        email: customer?.email
                    },
                    items: tx.items.map(item => ({ ...item, productId: item.id })) as BillingItem[],
                    exchangeItems: tx.exchangeItems || [],
                    subtotal: tx.subtotal,
                    gst: tx.gst,
                    discount: tx.discount,
                    grandTotal: tx.grandTotal,
                    goldRate: tx.goldRate || 0,
                    paymentMethod: tx.paymentMethod,
                    status: tx.status as 'Completed' | 'Pending' | 'Cancelled'
                };
            }
        }
        return null;
    }, [id, location.state, transactions, getCustomerById]);

    const [currentStatus, setCurrentStatus] = useState<'Completed' | 'Pending' | 'Cancelled'>(
        (data?.status as 'Completed' | 'Pending' | 'Cancelled') || 'Completed'
    );
    const [prevDataId, setPrevDataId] = useState(data?.invoiceNo);

    if (data?.invoiceNo !== prevDataId) {
        setPrevDataId(data?.invoiceNo);
        if (data?.status) {
            setCurrentStatus(data.status as 'Completed' | 'Pending' | 'Cancelled');
        }
    }

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Invoice-${data?.invoiceNo || 'Draft'}`,
    });

    const handleDownloadPDF = () => {
        if (!componentRef.current) return;
        const element = componentRef.current;
        const opt = {
            margin: 0,
            filename: `Invoice-${data?.invoiceNo || 'draft'}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
        };

        html2pdf().from(element).set(opt).save();
    };

    if (!data) {
        return (
            <div className={styles.invoiceContainer}>
                <div style={{ padding: '2rem', color: 'white' }}>
                    <h2>Invoice Not Found</h2>
                    <p>The requested invoice data could not be retrieved.</p>
                    <button onClick={() => navigate('/dashboard/billing')}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.invoiceContainer}>
            <div className={styles.invoiceContent}>
                <main className={styles.main}>
                    <div className={styles.invoiceWrapper}>
                        {/* Top Actions */}
                        <div className={styles.topActions}>
                            <div className={styles.title}>
                                <h2>Invoice #{data.invoiceNo}</h2>
                                <p>Created on {data.date}</p>
                            </div>
                            <div className={styles.buttons}>
                                <div className={styles.statusToggle}>
                                    <label>Status:</label>
                                    <select 
                                        value={currentStatus} 
                                        onChange={(e) => {
                                            const newStatus = e.target.value as 'Completed' | 'Pending' | 'Cancelled';
                                            setCurrentStatus(newStatus);
                                            showToast(`Status updated to ${newStatus} for this invoice view`, 'info');
                                        }}
                                        className={styles.statusSelect}
                                    >
                                        <option value="Completed">Paid (Success)</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <button className={styles.secondary} onClick={() => handlePrint()}>
                                    <span className="material-symbols-outlined">print</span>
                                    Print
                                </button>
                                <button className={styles.secondary} onClick={handleDownloadPDF}>
                                    <span className="material-symbols-outlined">download</span>
                                    PDF
                                </button>
                                <button className={styles.primary}>
                                    <span className="material-symbols-outlined">mail</span>
                                    Send Email
                                </button>
                                <button className={styles.secondary} onClick={() => navigate(-1)}>
                                    <span className="material-symbols-outlined">close</span>
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Invoice Paper */}
                        <div className={styles.paper} ref={componentRef}>
                            {/* Invoice Header */}
                            <div className={styles.invoiceHeader}>
                                <div className={styles.brandInfo}>
                                    <div className={styles.logoBox}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>diamond</span>
                                    </div>
                                    <div>
                                        <h3>{settings.name}</h3>
                                        <p>{settings.location}</p>
                                    </div>
                                </div>
                                <div className={styles.paymentStatus}>
                                    {currentStatus === 'Completed' ? (
                                        <div className={classNames(styles.badge, styles.paid)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                                            PAID
                                        </div>
                                    ) : (
                                        <div className={classNames(styles.badge, currentStatus === 'Cancelled' ? styles.cancelled : styles.pending)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                                {currentStatus === 'Cancelled' ? 'cancel' : 'schedule'}
                                            </span>
                                            {currentStatus.toUpperCase()}
                                        </div>
                                    )}
                                    <p className={styles.method}>Payment via {data.paymentMethod || 'Cash'}</p>
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className={styles.addresses}>
                                <div className={styles.billedFrom}>
                                    <h4>Billed From</h4>
                                    <div className={styles.details}>
                                        <p className={styles.name}>{settings.name}</p>
                                        <p>{settings.address}</p>
                                        <p>Contact: {settings.contact}</p>
                                        <p>GSTIN: {settings.gstNo}</p>
                                        <p className={styles.email}>{settings.email}</p>
                                    </div>
                                </div>
                                <div className={styles.billedTo}>
                                    <h4>Billed To</h4>
                                    <div className={styles.details}>
                                        <p className={styles.name}>{data.customer.name}</p>
                                        <p>{data.customer.address}</p>
                                        <p>Phone: +91 {data.customer.phone}</p>
                                        <p className={styles.email}>{data.customer.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Meta Grid */}
                            <div className={styles.metaGrid}>
                                <div className={styles.item}>
                                    <span className={styles.label}>Invoice No</span>
                                    <span className={styles.value}>#{data.invoiceNo}</span>
                                </div>
                                <div className={styles.item}>
                                    <span className={styles.label}>Invoice Date</span>
                                    <span className={styles.value}>{data.date}</span>
                                </div>
                                <div className={styles.item}>
                                    <span className={styles.label}>Due Date</span>
                                    <span className={styles.value}>{data.date}</span>
                                </div>
                                <div className={styles.item}>
                                    <span className={styles.label}>Gold Rate</span>
                                    <span className={classNames(styles.value, styles.highlight)}>₹{data.goldRate} /g</span>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className={styles.tableSection}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Item Description</th>
                                            <th className={styles.center}>Purity</th>
                                            <th className={styles.right}>Gross Wt (g)</th>
                                             <th className={styles.right}>Rate/g</th>
                                             <th className={styles.right}>Wast%</th>
                                              <th className={styles.right}>Making/g</th>
                                             <th className={styles.right}>Disc</th>
                                             <th className={styles.right}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className={styles.itemName}>
                                                        <span className={styles.bold}>{item.name}</span>
                                                        <span className={styles.sub}>{item.code}</span>
                                                    </div>
                                                </td>
                                                <td className={styles.center}>{item.purity}</td>
                                                <td className={classNames(styles.right, styles.tabular)}>{item.weight.toFixed(3)}</td>
                                                 <td className={classNames(styles.right, styles.tabular)}>₹{item.rate.toFixed(2)}</td>
                                                 <td className={classNames(styles.right, styles.tabular)}>{(item.wastage || 0)}%</td>
                                                 <td className={classNames(styles.right, styles.tabular)}>₹{item.makingCharges.toFixed(2)}</td>
                                                 <td className={classNames(styles.right, styles.tabular, styles.red)}>₹{(item.discount || 0).toFixed(2)}</td>
                                                 <td className={classNames(styles.right, styles.bold, styles.tabular)}>₹{item.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Exchange Section */}
                            {data.exchangeItems.length > 0 && (
                                <div className={styles.exchangeSection}>
                                    <h4>Exchange Details (Old Gold / Silver)</h4>
                                    <div className={classNames(styles.tableSection, styles.wrapper)}>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Old Item Description</th>
                                                    <th className={styles.center}>Purity</th>
                                                    <th className={styles.right}>Net Wt (g)</th>
                                                    <th className={styles.right}>Credit Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.exchangeItems.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <div className={styles.itemName}>
                                                                <span className={styles.bold}>{item.description}</span>
                                                            </div>
                                                        </td>
                                                        <td className={styles.center}>{item.purity}%</td>
                                                        <td className={classNames(styles.right, styles.tabular)}>{item.weight.toFixed(3)}</td>
                                                        <td className={classNames(styles.right, styles.tabular, styles.credit)}>- ₹{item.value.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Footer Summary */}
                            <div className={styles.summarySection}>
                                <div className={styles.terms}>
                                    <h5>Terms & Conditions</h5>
                                    <ul>
                                        {/* <li>Goods once sold cannot be taken back, only exchanged as per current rates.</li>
                                        <li>Subject to Mumbai Jurisdiction only.</li>
                                        <li>E. & O.E.</li> */}
                                        <li>Please keep this invoice for future reference.</li>
                                    </ul>
                                </div>
                                
                                <div className={styles.totals}>
                                    <div className={styles.row}>
                                        <span className={styles.label}>Subtotal</span>
                                        <span className={styles.value}>₹{(data.subtotal - data.items.reduce((acc, item) => acc + (item.weight * (item.wastage || 0) / 100 * item.rate), 0)).toFixed(2)}</span>
                                    </div>
                                    <div className={styles.row}>
                                        <span className={styles.label}>Wastage Value</span>
                                        <span className={styles.value}>₹{(data.items.reduce((acc, item) => acc + (item.weight * (item.wastage || 0) / 100 * item.rate), 0)).toFixed(2)}</span>
                                    </div>
                                    <div className={styles.row}>
                                        <span className={styles.label}>GST (3%)</span>
                                        <span className={styles.value}>₹{data.gst.toFixed(2)}</span>
                                    </div>
                                    <div className={classNames(styles.row, styles.gross)}>
                                        <span className={styles.label}>Gross Total</span>
                                        <span className={styles.value}>₹{(data.subtotal + data.gst).toFixed(2)}</span>
                                    </div>
                                    
                                    <div className={styles.divider}></div>
                                    
                                    {data.exchangeItems.length > 0 && (
                                        <div className={classNames(styles.row, styles.exchange)}>
                                            <span className={styles.label}>Less: Exchange Credit</span>
                                            <span className={styles.value}>- ₹{data.exchangeItems.reduce((acc, i) => acc + i.value, 0).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className={classNames(styles.row, styles.discount)}>
                                        <span className={styles.label}>Less: Discount</span>
                                        <span className={styles.value}>- ₹{data.discount.toFixed(2)}</span>
                                    </div>
                                    
                                    <div className={styles.divider}></div>
                                    
                                    <div className={styles.netPayable}>
                                        <span className={styles.label}>Net Payable Amount</span>
                                        <span className={styles.value}>₹{data.grandTotal.toFixed(2)}</span>
                                    </div>
                                    <div className={styles.words}>
                                        (Amount in words to be implemented)
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Footer */}
                            <div className={styles.footer}>
                                <div className={styles.thankYou}>
                                    <p>Thank you for your business!</p>
                                    <p>www.vghjewellers.com</p>
                                </div>
                                <div className={styles.signature}>
                                    <div 
                                        className={styles.signImg}
                                        style={{ backgroundImage: `url("${signImg}")` }}
                                    ></div>
                                    <p>Authorized Signatory</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ height: '2rem' }}></div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InvoiceViewer;
