import React, { useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from './CreateOrder.module.scss';
import { useCustomers } from '../../context/CustomerContext';
import { useTransactions } from '../../context/TransactionContext';
import { useToast } from '../../context/ToastContext';
import { useRates } from '../../context/RateContext';
import { FormSelect } from '../../components/common';
import type { Transaction } from '../../types/Transaction';

const CreateOrder: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { customers } = useCustomers();
    const { transactions, addTransaction, updateTransaction } = useTransactions();
    const { showToast } = useToast();
    const { rates } = useRates();

    // Form State (lazy initializers populate from existing order on mount, avoiding setState in useEffect)
    const [customerId, setCustomerId] = useState(() => {
        if (id) return transactions.find(t => t.id === id)?.customerId || '';
        return (location.state as { customerId?: string })?.customerId || '';
    });
    const [description, setDescription] = useState(() => {
        const item = id ? transactions.find(t => t.id === id)?.items[0] : null;
        return item ? item.name.replace('Custom Order: ', '').replace('...', '') : '';
    });
    const [deliveryDate, setDeliveryDate] = useState(() => {
        const order = id ? transactions.find(t => t.id === id) : null;
        const dateSource = order?.deliveryDate || order?.date;
        return dateSource ? new Date(dateSource).toISOString().split('T')[0] : '';
    });
    const [urgency, setUrgency] = useState('normal');
    const [valuationRef, setValuationRef] = useState(() => {
        const order = id ? transactions.find(t => t.id === id) : null;
        return order?.exchangeItems?.[0]?.name || '';
    });
    const [imagePreview, setImagePreview] = useState<string | null>(() => {
        const order = id ? transactions.find(t => t.id === id) : null;
        return order?.imageUrl || null;
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const customerDivRef = useRef<HTMLDivElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const deliveryDateRef = useRef<HTMLInputElement>(null);
    // Item Details State
    const [metalType, setMetalType] = useState(() => {
        const item = id ? transactions.find(t => t.id === id)?.items[0] : null;
        return item?.metalType || 'Gold';
    });
    const [metalWeight, setMetalWeight] = useState(() => {
        const item = id ? transactions.find(t => t.id === id)?.items[0] : null;
        return item?.weight ? item.weight.toString() : '';
    });
    const [stoneWeight, setStoneWeight] = useState(() => {
        const item = id ? transactions.find(t => t.id === id)?.items[0] : null;
        return item?.stoneWeight ? item.stoneWeight.toString() : '';
    });
    const [stoneRate, setStoneRate] = useState(() => {
        const item = id ? transactions.find(t => t.id === id)?.items[0] : null;
        return item?.stoneRate ? item.stoneRate.toString() : '';
    });
    const [makingCharges, setMakingCharges] = useState(() => {
        const item = id ? transactions.find(t => t.id === id)?.items[0] : null;
        return item?.makingCharges ? item.makingCharges.toString() : '';
    });
    const [wastagePercentage, setWastagePercentage] = useState(() => {
        const item = id ? transactions.find(t => t.id === id)?.items[0] : null;
        return item?.wastage ? item.wastage.toString() : '';
    });

    // Financials (Strings for input handling)
    const [totalAmountStr, setTotalAmount] = useState(() => {
        const order = id ? transactions.find(t => t.id === id) : null;
        return order ? order.grandTotal.toString() : '0.00';
    });
    const [advanceStr, setAdvance] = useState('0.00');
    const [exchangeCreditStr, setExchangeCredit] = useState(() => {
        const order = id ? transactions.find(t => t.id === id) : null;
        return order ? order.exchangeTotal.toString() : '0.00';
    });
    const [exchangeWeight, setExchangeWeight] = useState(() => {
        const order = id ? transactions.find(t => t.id === id) : null;
        return order?.exchangeItems?.[0]?.weight?.toString() || '';
    });
    
    // Auto-calculate state - default to true for new orders, false for edits
    const [autoCalculate, setAutoCalculate] = useState(!id);



    // Stable IDs for this form session (generated once on mount via lazy initializer)
    const [orderIdRef] = useState(() => id ? id : `ORD-${Date.now()}`);
    const [invoiceNoRef] = useState(() => `INV-${Math.floor(Math.random() * 10000)}`);
    const [itemIdRef] = useState(() => `item-${Date.now()}`);
    const [exchangeIdRef] = useState(() => `ex-${Date.now()}`);

    // Derived State
    const selectedCustomer = customers.find(c => c.id === customerId);
    
    // Auto-Calculate Total (derived, no setState in effect)
    const autoCalculatedTotal = (() => {
        if (!autoCalculate) return null;
        const weight = parseFloat(metalWeight) || 0;
        const wastage = parseFloat(wastagePercentage) || 0;
        const making = parseFloat(makingCharges) || 0;
        const stone = parseFloat(stoneRate) || 0;
        let rate = 0;
        if (metalType === 'Gold') rate = rates.gold22k;
        else if (metalType === 'Gold-18k') rate = rates.gold22k * (18/22);
        else if (metalType === 'Silver') rate = rates.silver;
        if (rate > 0) {
            const metalCost = weight * rate;
            const wastageCost = metalCost * (wastage / 100);
            return (metalCost + wastageCost + making + stone).toFixed(2);
        }
        return null;
    })();
    const effectiveTotalAmountStr = (autoCalculate && autoCalculatedTotal) ? autoCalculatedTotal : totalAmountStr;
    
    // Parsing Helpers
    const parseCurrency = (str: string) => parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
    const totalAmount = parseCurrency(effectiveTotalAmountStr);
    const advance = parseCurrency(advanceStr);
    const exchangeCredit = parseCurrency(exchangeCreditStr);
    
    const cashToPay = Math.max(0, advance - exchangeCredit);
    const remaining = Math.max(0, totalAmount - advance); 


    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate('/dashboard/orders');
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!customerId) {
            showToast("Please select a customer to proceed", "error", "Missing Information");
            customerDivRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (!description.trim()) {
            showToast("Please provide a detailed description for the order", "error", "Missing Information");
            descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => descriptionRef.current?.focus(), 500);
            return;
        }
        if (!deliveryDate) {
            showToast("Please select a target delivery date", "error", "Missing Information");
            deliveryDateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => deliveryDateRef.current?.focus(), 500);
            return;
        }

        const orderData = {
             id: id || orderIdRef,
             invoiceNo: id ? (transactions.find(t => t.id === id)?.invoiceNo || '') : invoiceNoRef,
             date: id ? (transactions.find(t => t.id === id)?.date || new Date().toISOString()) : new Date().toISOString(), 
             deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
             customerName: selectedCustomer?.name || 'Unknown',
             customerId: customerId,
             items: [
                 {
                     id: itemIdRef,
                     name: `Custom Order: ${description}`,
                     code: 'CUST-BESPOKE',
                     weight: parseFloat(metalWeight) || 0,
                     purity: 'N/A',
                     metalType: metalType,
                     stoneWeight: parseFloat(stoneWeight) || 0,
                     stoneRate: parseFloat(stoneRate) || 0,
                     makingCharges: parseFloat(makingCharges) || 0,
                     wastage: parseFloat(wastagePercentage) || 0,
                     rate: 0,
                     total: totalAmount 
                 }
             ],
             subtotal: totalAmount,
             gst: 0,
             discount: 0,
             exchangeTotal: exchangeCredit,
             exchangeItems: exchangeCredit > 0 || valuationRef ? [
                 {
                     id: exchangeIdRef,
                     name: valuationRef,
                     weight: parseFloat(exchangeWeight) || 0,
                     value: exchangeCredit,
                     purity: 'N/A'
                 }
             ] : [],
             grandTotal: totalAmount,
             amountPaid: advance,
             paymentMethod: 'Split', 
             status: id ? (transactions.find(t => t.id === id)?.status || 'Pending') : 'Pending',
             imageUrl: imagePreview || undefined
        } as Transaction;

        if (id) {
            updateTransaction(orderData);
            showToast("Order updated successfully", "success", "Order Updated");
            navigate(`/dashboard/orders/confirmation/${orderData.id}`);
        } else {
            addTransaction(orderData);
            showToast("Custom order created successfully", "success", "Order Created");
            navigate(`/dashboard/orders/confirmation/${orderData.id}`);
        }
    };

    return (
        <div className={styles.container}>
            {/* Breadcrumbs */}
            <nav className={styles.breadcrumbs}>
                <a href="#" onClick={handleBack} className={styles.link}>Orders</a>
                <span className={styles.divider}>/</span>
                <span className={styles.current}>New Custom Order</span>
            </nav>

            {/* Page Heading */}
            <div className={styles.pageHeader}>
                <h1>{id ? 'Edit Order' : 'Custom Order Entry Form'}</h1>
                <p>{id ? 'Update order specifications.' : 'Record detailed specifications for bespoke jewellery pieces.'}</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Customer Information */}
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>
                        <span className="material-symbols-outlined icon">person</span>
                        Customer Information
                    </h2>
                    <div className={styles.gridTwo}>
                        <div className={styles.fieldGroup} ref={customerDivRef}>
                            <label>Select Customer <span className={styles.required}>*</span></label>
                            <FormSelect 
                                value={customerId} 
                                onChange={(val) => setCustomerId(val)}
                                options={[
                                    ...customers.map(c => ({ value: c.id, label: `${c.name} - ${c.phone}` })),
                                    { value: 'new', label: '+ Add New Customer (Not implemented)' }
                                ]}
                                placeholder="Select existing customer..."
                                label="Customer Selection"
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Contact Number</label>
                            <input type="text" value={selectedCustomer?.phone || ''} readOnly placeholder="Auto-filled" />
                        </div>
                    </div>
                </div>

                {/* Order Specifications */}
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>
                        <span className="material-symbols-outlined icon">draw</span>
                        Order Specifications
                    </h2>
                    <div className={styles.gridThree}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className={styles.fieldGroup}>
                                <label>Detailed Description <span className={styles.required}>*</span></label>
                                <textarea 
                                    ref={descriptionRef}
                                    placeholder="Specify metal type (18k Gold, Sterling Silver), stone details, engravings, sizing, and design nuances..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>
                            <div className={styles.gridTwo}>
                                <div className={styles.fieldGroup}>
                                    <label>Target Delivery Date <span className={styles.required}>*</span></label>
                                    <input 
                                        ref={deliveryDateRef}
                                        type="date" 
                                        value={deliveryDate}
                                        onChange={(e) => setDeliveryDate(e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Urgency Level</label>
                                    <FormSelect 
                                        value={urgency} 
                                        onChange={(val) => setUrgency(val)}
                                        options={[
                                            { value: 'normal', label: 'Normal (4-6 weeks)' },
                                            { value: 'rush', label: 'Rush (2 weeks)' },
                                            { value: 'express', label: 'Express (7 days)' }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Image Upload */}
                        <div className={styles.fieldGroup} style={{ height: '100%' }}>
                            <label>Item Model Image / Sketch</label>
                            <div 
                                className={styles.imageUpload} 
                                onClick={() => fileInputRef.current?.click()}
                                style={{ 
                                    backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative'
                                }}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageUpload} 
                                    style={{ display: 'none' }} 
                                    accept="image/*"
                                />
                                {!imagePreview ? (
                                    <>
                                        <span className="material-symbols-outlined uploadIcon">add_a_photo</span>
                                        <p>Upload sketch or reference photo (JPG, PNG)</p>
                                    </>
                                ) : (
                                    <button 
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={handleRemoveImage}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'rgba(0,0,0,0.6)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '30px',
                                            height: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metal & Cost Details */}
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>
                        <span className="material-symbols-outlined icon">diamond</span>
                        Metal & Cost Details
                    </h2>
                    <div className={styles.gridTwo}>
                         <div className={styles.fieldGroup}>
                            <label>Metal Type</label>
                            <FormSelect 
                                value={metalType} 
                                onChange={(val) => setMetalType(val)}
                                options={[
                                    { value: 'Gold', label: 'Gold (22k)' },
                                    { value: 'Gold-18k', label: 'Gold (18k)' },
                                    { value: 'Silver', label: 'Silver' },
                                    { value: 'Platinum', label: 'Platinum' }
                                ]}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Metal Weight (g)</label>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={metalWeight}
                                onChange={(e) => setMetalWeight(e.target.value)}
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div className={styles.gridThree} style={{ marginTop: '1.5rem' }}>
                         <div className={styles.fieldGroup}>
                            <label>Stone Weight (cts/g)</label>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={stoneWeight}
                                onChange={(e) => setStoneWeight(e.target.value)}
                                step="0.01"
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Stone Rate</label>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={stoneRate}
                                onChange={(e) => setStoneRate(e.target.value)}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                             {/* Placeholder to balance grid if needed, or maybe Total Stone Cost read-only */}
                             <label style={{ visibility: 'hidden' }}>Spacer</label>
                        </div>
                    </div>
                     <div className={styles.gridTwo} style={{ marginTop: '1.5rem' }}>
                        <div className={styles.fieldGroup}>
                            <label>Making Charges (Fixed)</label>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={makingCharges}
                                onChange={(e) => setMakingCharges(e.target.value)}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Wastage Percentage (%)</label>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={wastagePercentage}
                                onChange={(e) => setWastagePercentage(e.target.value)}
                                step="0.1"
                            />
                        </div>
                    </div>
                </div>

                {/* Exchange & Financials Split */}
                <div className={styles.gridTwo}>
                    {/* Exchange Item */}
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>
                            <span className="material-symbols-outlined icon">autorenew</span>
                            Exchange Item
                        </h2>
                        <p style={{ color: '#b9b09d', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            Link an old gold/silver valuation as part of the initial payment.
                        </p>
                        <div className={styles.fieldGroup}>
                            <label>Exchange Item Name</label>
                            <div className={styles.exchangeInputGroup}>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Old Gold Chain, Silver Ring" 
                                    value={valuationRef}
                                    onChange={(e) => setValuationRef(e.target.value)}
                                    style={{ flex: 2 }}
                                />
                                <input 
                                    type="number" 
                                    placeholder="Weight (g)" 
                                    value={exchangeWeight}
                                    onChange={(e) => setExchangeWeight(e.target.value)}
                                    step="0.01"
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>
                        
                        {/* Exchange Amount Input (Hidden or visible? Mockup had result, assume editable for now) */}
                         <div className={styles.fieldGroup} style={{ marginTop: '1rem' }}>
                            <label>Exchange Value Adjustment</label>
                             <input 
                                type="text" 
                                value={'₹' + exchangeCreditStr} 
                                onChange={(e) => setExchangeCredit(e.target.value.replace(/[^0-9.]/g, ''))}
                            />
                        </div>

                        <div className={styles.creditDisplay}>
                            <div className={styles.row}>
                                <span className={styles.label}>Exchange Credit Applied:</span>
                                <span className={styles.amount}>₹{exchangeCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className={styles.detail}>Effective for this order</div>
                        </div>
                    </div>

                    {/* Financials */}
                <div className={`${styles.formSection} ${styles.financialsSection}`}>
                    <div className={styles.sectionTitle} style={{justifyContent: 'space-between'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                            <span className="material-symbols-outlined icon">calculate</span>
                            Order Financials
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.875rem', fontWeight:400}}>
                             <input 
                                type="checkbox" 
                                checked={autoCalculate} 
                                onChange={(e) => setAutoCalculate(e.target.checked)}
                                id="autoCalc"
                             />
                             <label htmlFor="autoCalc" style={{cursor:'pointer', color: autoCalculate ? '#e29d12' : '#b9b09d'}}>Auto-Calculate from Rates</label>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {autoCalculate && (
                            <div style={{marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#b9b09d'}}>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.25rem'}}>
                                    <span>Metal Cost ({metalWeight || 0}g x ₹{metalType === 'Gold' ? rates.gold22k : (metalType === 'Silver' ? rates.silver : 0)})</span>
                                    <span>₹{((parseFloat(metalWeight)||0) * (metalType === 'Gold' ? rates.gold22k : (metalType === 'Silver' ? rates.silver : rates.gold22k*(18/22)))).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                                </div>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.25rem'}}>
                                    <span>Wastage ({wastagePercentage || 0}%)</span>
                                    <span>₹{(((parseFloat(metalWeight)||0) * (metalType === 'Gold' ? rates.gold22k : (metalType === 'Silver' ? rates.silver : rates.gold22k*(18/22)))) * ((parseFloat(wastagePercentage)||0)/100)).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                                </div>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.25rem'}}>
                                    <span>Making Charges</span>
                                    <span>₹{(parseFloat(makingCharges)||0).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                                </div>
                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                    <span>Stone Charges</span>
                                    <span>₹{(parseFloat(stoneRate)||0).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                                </div>
                                <div style={{borderTop:'1px dashed rgba(255,255,255,0.1)', marginTop:'0.5rem', paddingTop:'0.5rem', display:'flex', justifyContent:'space-between', fontWeight:600, color:'#fff'}}>
                                    <span>Estimated Total</span>
                                    <span>₹{totalAmount.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                                </div>
                            </div>
                        )}

                        <div className={styles.financialRow}>
                            <span className={styles.label}>Estimated Total Amount</span>
                            <input 
                                type="text" 
                                className={styles.inputCurrency}
                                value={'₹' + totalAmountStr}
                                onChange={(e) => {
                                    setTotalAmount(e.target.value.replace(/[^0-9.]/g, ''));
                                    setAutoCalculate(false);
                                }}
                            />
                        </div>
                        <div className={styles.financialRow}>
                            <span className={styles.label}>Initial Advance (Min 30%)</span>
                            <input 
                                type="text" 
                                className={styles.inputCurrency}
                                value={'₹' + advanceStr}
                                onChange={(e) => setAdvance(e.target.value.replace(/[^0-9.]/g, ''))}
                            />
                        </div>
                            <div className={`${styles.financialRow} ${styles.borderTop}`}>
                                <span className={styles.label}>Exchange Credit (Deducted)</span>
                                <span className={`${styles.value} ${styles.deduction}`}>-₹{exchangeCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className={styles.financialRow}>
                                <span className={`${styles.label} ${styles.bold}`}>Cash to Pay Now</span>
                                <span className={`${styles.value} ${styles.highlight}`}>₹{cashToPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className={`${styles.financialRow} ${styles.borderTopBold}`}>
                                <span className={`${styles.label} ${styles.bold}`} style={{ color: '#e29d12' }}>Remaining Balance</span>
                                <span className={`${styles.value} ${styles.primary}`}>₹{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                    <button type="button" className={styles.btnDraft} onClick={() => navigate('/dashboard/orders')}>Cancel</button>
                    <button 
                        type="submit" 
                        className={styles.btnSubmit}
                    >
                        {id ? 'Update Order' : 'Create Order & Generate Invoice'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateOrder;
