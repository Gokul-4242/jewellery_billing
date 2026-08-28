import React, { useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from './CreateOrder.module.scss';
import { useCustomers } from '../../context/useCustomers';
import { useTransactions } from '../../context/useTransactions';
import { useToast } from '../../context/ToastContext';
import { useRates } from '../../context/RateContext';
import { FormSelect } from '../../components/common';
import api from '../../api/axios';
import type { Transaction } from '../../types/Transaction';


const CreateOrder: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { customers } = useCustomers();
    const { transactions, addLocalTransaction, updateTransaction } = useTransactions();
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
    const [totalAmountStr, setTotalAmountStr] = useState(() => {
        const order = id ? transactions.find(t => t.id === id) : null;
        return order ? order.grandTotal.toString() : '0.00';
    });
    const [advanceStr, setAdvanceStr] = useState('0.00');
    const [exchangeCreditStr, setExchangeCreditStr] = useState(() => {
        const order = id ? transactions.find(t => t.id === id) : null;
        return order ? order.exchangeTotal.toString() : '0.00';
    });
    const [exchangeWeight, setExchangeWeight] = useState(() => {
        const order = id ? transactions.find(t => t.id === id) : null;
        return order?.exchangeItems?.[0]?.weight?.toString() || '';
    });
    
    // Auto-calculate state - default to true for new orders, false for edits
    const [autoCalculate, setAutoCalculate] = useState(!id);



    // Stable IDs for this form session (generated once on mount)
    const [orderId] = useState(() => id ?? `ORD-${Date.now()}`);
    const [invoiceNo] = useState(() => {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return `INV-${array[0] % 10000}`;
    });
    const [itemId] = useState(() => `item-${Date.now()}`);
    const [exchangeId] = useState(() => `ex-${Date.now()}`);

    // Derived State
    const selectedCustomer = customers.find(c => c.id === customerId);
    
    // Rate helper function
    const getEffectiveRate = (type: string): number => {
        if (type === 'Gold') return rates.gold22k;
        if (type === 'Gold-18k') return rates.gold22k * (18 / 22);
        if (type === 'Silver') return rates.silver;
        return 0;
    };
    const currentMetalRate = getEffectiveRate(metalType);

    // Auto-Calculate Total (derived, no setState in effect)
    const autoCalculatedTotal = (() => {
        if (!autoCalculate) return null;
        const weight = Number.parseFloat(metalWeight) || 0;
        const wastage = Number.parseFloat(wastagePercentage) || 0;
        const making = Number.parseFloat(makingCharges) || 0;
        const stone = Number.parseFloat(stoneRate) || 0;
        const rate = currentMetalRate;
        if (rate > 0) {
            const metalCost = weight * rate;
            const wastageCost = metalCost * (wastage / 100);
            return (metalCost + wastageCost + making + stone).toFixed(2);
        }
        return null;
    })();
    const effectiveTotalAmountStr = (autoCalculate && autoCalculatedTotal) ? autoCalculatedTotal : totalAmountStr;
    
    // Parsing Helpers
    const parseCurrency = (str: string) => Number.parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
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

    const handleSubmit = async (e: React.FormEvent) => {
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
             // ... existing data ...
             id: id || orderId,
             invoiceNo: id ? (transactions.find(t => t.id === id)?.invoiceNo || '') : invoiceNo,
             date: id ? (transactions.find(t => t.id === id)?.date || new Date().toISOString()) : new Date().toISOString(), 
             deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
             customerName: selectedCustomer?.name || 'Unknown',
             customerId: customerId,
             items: [
                 {
                     id: itemId,
                     name: `Custom Order: ${description}`,
                     code: 'CUST-BESPOKE',
                     weight: Number.parseFloat(metalWeight) || 0,
                     purity: 'N/A',
                     metalType: metalType,
                     stoneWeight: Number.parseFloat(stoneWeight) || 0,
                     stoneRate: Number.parseFloat(stoneRate) || 0,
                     makingCharges: Number.parseFloat(makingCharges) || 0,
                     wastage: Number.parseFloat(wastagePercentage) || 0,
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
                     id: exchangeId,
                     name: valuationRef,
                     weight: Number.parseFloat(exchangeWeight) || 0,
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

        try {
            if (id) {
                await updateTransaction(orderData);
                showToast("Order updated successfully", "success", "Order Updated");
                navigate(`/dashboard/orders/confirmation/${id}`);
            } else {
                const res = await api.post('/orders/custom', orderData);
                if (res.data?.success) {
                    const savedOrder = { ...res.data.data, id: res.data.data._id };
                    addLocalTransaction(savedOrder);
                    showToast("Custom order created successfully", "success", "Order Created");
                    navigate(`/dashboard/orders/confirmation/${savedOrder.id}`);
                }
            }
        } catch (err: unknown) {
            console.error("Failed to save order", err);
            showToast("Failed to save order. Please try again.", "error", "Submission Error");
        }
    };


    return (
        <div className={styles.container}>
            {/* Breadcrumbs */}
            <nav className={styles.breadcrumbs}>
                <button type="button" onClick={handleBack} className={styles.link}>Orders</button>
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
                        <span className="material-symbols-outlined icon">person</span> Customer Information
                    </h2>
                    <div className={styles.gridTwo}>
                        <div className={styles.fieldGroup} ref={customerDivRef}>
                            <label htmlFor="customerSelect">Select Customer <span className={styles.required}>*</span></label>
                            <FormSelect 
                                id="customerSelect"
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
                            <label htmlFor="contactPhone">Contact Number</label>
                            <input id="contactPhone" type="text" value={selectedCustomer?.phone || ''} readOnly placeholder="Auto-filled" />
                        </div>
                    </div>
                </div>

                {/* Order Specifications */}
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>
                        <span className="material-symbols-outlined icon">draw</span> Order Specifications
                    </h2>
                    <div className={styles.gridThree}>
                        <div className={styles.specsControls}>
                            <div className={styles.fieldGroup}>
                                <label htmlFor="orderDescription">Detailed Description <span className={styles.required}>*</span></label>
                                <textarea 
                                    id="orderDescription"
                                    ref={descriptionRef}
                                    placeholder="Specify metal type (18k Gold, Sterling Silver), stone details, engravings, sizing, and design nuances..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>
                            <div className={styles.gridTwo}>
                                <div className={styles.fieldGroup}>
                                    <label htmlFor="deliveryDate">Target Delivery Date <span className={styles.required}>*</span></label>
                                    <input 
                                        id="deliveryDate"
                                        ref={deliveryDateRef}
                                        type="date" 
                                        value={deliveryDate}
                                        onChange={(e) => setDeliveryDate(e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label htmlFor="urgencyLevel">Urgency Level</label>
                                    <FormSelect 
                                        id="urgencyLevel"
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
                        <div className={`${styles.fieldGroup} ${styles.fullHeight}`}>
                            <label htmlFor="modelImage">Item Model Image / Sketch</label>
                            <div className={styles.imageContainer}>
                                <input 
                                    id="modelImage"
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageUpload} 
                                    className={styles.hidden}
                                    accept="image/*"
                                />
                                <button 
                                    type="button"
                                    className={styles.imageUpload} 
                                    onClick={() => fileInputRef.current?.click()}
                                    aria-label={imagePreview ? "Change image" : "Upload sketch or reference photo"}
                                    style={{ 
                                        backgroundImage: imagePreview ? `url(${imagePreview})` : 'none'
                                    }}
                                >
                                    {!imagePreview && (
                                        <>
                                            <span className="material-symbols-outlined uploadIcon">add_a_photo</span> <p>Upload sketch or reference photo (JPG, PNG)</p>
                                        </>
                                    )}
                                </button>
                                {imagePreview && (
                                    <button 
                                        type="button"
                                        className={styles.removeImageBtn}
                                        onClick={handleRemoveImage}
                                        aria-label="Remove image"
                                    >
                                        <span className={`material-symbols-outlined ${styles.closeIcon}`}>close</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metal & Cost Details */}
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>
                        <span className="material-symbols-outlined icon">diamond</span> Metal & Cost Details
                    </h2>
                    <div className={styles.gridTwo}>
                         <div className={styles.fieldGroup}>
                            <label htmlFor="metalType">Metal Type</label>
                            <FormSelect 
                                id="metalType"
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
                            <label htmlFor="metalWeight">Metal Weight (g)</label>
                            <input 
                                id="metalWeight"
                                type="number" 
                                placeholder="0.00" 
                                value={metalWeight}
                                onChange={(e) => setMetalWeight(e.target.value)}
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div className={`${styles.gridThree} ${styles.gridMargin}`}>
                         <div className={styles.fieldGroup}>
                            <label htmlFor="stoneWeight">Stone Weight (cts/g)</label>
                            <input 
                                id="stoneWeight"
                                type="number" 
                                placeholder="0.00" 
                                value={stoneWeight}
                                onChange={(e) => setStoneWeight(e.target.value)}
                                step="0.01"
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="stoneRate">Stone Rate</label>
                            <input 
                                id="stoneRate"
                                type="number" 
                                placeholder="0.00" 
                                value={stoneRate}
                                onChange={(e) => setStoneRate(e.target.value)}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                             {/* Placeholder to balance grid if needed, or maybe Total Stone Cost read-only */}
                             <span className={styles.hiddenLabel} aria-hidden="true">Spacer</span>
                        </div>
                    </div>
                     <div className={`${styles.gridTwo} ${styles.gridMargin}`}>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="makingCharges">Making Charges (Fixed)</label>
                            <input 
                                id="makingCharges"
                                type="number" 
                                placeholder="0.00" 
                                value={makingCharges}
                                onChange={(e) => setMakingCharges(e.target.value)}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="wastagePercentage">Wastage Percentage (%)</label>
                            <input 
                                id="wastagePercentage"
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
                            <span className="material-symbols-outlined icon">autorenew</span> Exchange Item
                        </h2>
                        <p className={styles.sectionDescription}>
                            Link an old gold/silver valuation as part of the initial payment.
                        </p>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="exchangeItemName">Exchange Item Name & Weight</label>
                            <div className={styles.exchangeInputGroup}>
                                <input 
                                    id="exchangeItemName"
                                    type="text" 
                                    placeholder="e.g. Old Gold Chain, Silver Ring" 
                                    value={valuationRef}
                                    onChange={(e) => setValuationRef(e.target.value)}
                                    className={styles.large}
                                />
                                <input 
                                    type="number" 
                                    placeholder="Weight (g)" 
                                    value={exchangeWeight}
                                    onChange={(e) => setExchangeWeight(e.target.value)}
                                    step="0.01"
                                    aria-label="Exchange Item Weight"
                                />
                            </div>
                        </div>
                        
                        {/* Exchange Amount Input (Hidden or visible? Mockup had result, assume editable for now) */}
                         <div className={`${styles.fieldGroup} ${styles.marginTopLg}`}>
                            <label htmlFor="exchangeValue">Exchange Value Adjustment</label>
                             <input 
                                id="exchangeValue"
                                type="text" 
                                value={'₹' + exchangeCreditStr} 
                                onChange={(e) => setExchangeCreditStr(e.target.value.replace(/[^0-9.]/g, ''))}
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
                    <div className={`${styles.sectionTitle} ${styles.summaryRow}`}>
                        <div className={styles.titleMain}>
                            <span className="material-symbols-outlined icon">calculate</span> Order Financials
                        </div>
                        <div className={styles.titleAction}>
                             <input 
                                type="checkbox" 
                                checked={autoCalculate} 
                                onChange={(e) => setAutoCalculate(e.target.checked)}
                                id="autoCalc"
                             />
                             <label htmlFor="autoCalc" className={autoCalculate ? styles.active : ''}>Auto-Calculate from Rates</label>
                        </div>
                    </div>
                    
                    <div className={styles.financialsList}>
                        {autoCalculate && (
                            <div className={styles.calcSummary}>
                                <div className={styles.summaryRow}>
                                    <span>Metal Cost ({metalWeight || 0}g x ₹{currentMetalRate})</span>
                                    <span>₹{((Number.parseFloat(metalWeight) || 0) * currentMetalRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Wastage ({wastagePercentage || 0}%)</span>
                                    <span>₹{(((Number.parseFloat(metalWeight) || 0) * currentMetalRate) * ((Number.parseFloat(wastagePercentage) || 0) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Making Charges</span>
                                    <span>₹{(Number.parseFloat(makingCharges)||0).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Stone Charges</span>
                                    <span>₹{(Number.parseFloat(stoneRate)||0).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                                </div>
                                <div className={styles.summaryTotal}>
                                    <span>Estimated Total</span>
                                    <span>₹{totalAmount.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                                </div>
                            </div>
                        )}

                        <div className={styles.financialRow}>
                            <label htmlFor="totalAmountInput" className={styles.label}>Estimated Total Amount</label>
                            <input 
                                id="totalAmountInput"
                                type="text" 
                                className={styles.inputCurrency}
                                value={'₹' + totalAmountStr}
                                onChange={(e) => {
                                    setTotalAmountStr(e.target.value.replace(/[^0-9.]/g, ''));
                                    setAutoCalculate(false);
                                }}
                            />
                        </div>
                        <div className={styles.financialRow}>
                            <label htmlFor="advanceInput" className={styles.label}>Initial Advance (Min 30%)</label>
                            <input 
                                id="advanceInput"
                                type="text" 
                                className={styles.inputCurrency}
                                value={'₹' + advanceStr}
                                onChange={(e) => setAdvanceStr(e.target.value.replace(/[^0-9.]/g, ''))}
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
                                <span className={`${styles.label} ${styles.bold} ${styles.primaryLabel}`}>Remaining Balance</span>
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
