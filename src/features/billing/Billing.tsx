import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styles from './Billing.module.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ExchangeItem, InvoiceData } from './types';
import { useCustomers } from '../../context/CustomerContext';
import { useInventory } from '../../context/InventoryContext';
import { useTransactions } from '../../context/TransactionContext';
import { useRates } from '../../context/RateContext';
import { useSettings } from '../../context/SettingsContext';
import type { Customer } from '../../types/Customer';
import type { Product } from '../../types/Dashboard.types';
import type { Transaction } from '../../types/Transaction';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';

const Billing: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeCategory, setActiveCategory] = useState<string>('All Items');
    const [searchText, setSearchText] = useState<string>('');
    
    // Contexts
    const { customers, updateCustomer, getCustomerById } = useCustomers(); 
    const { addTransaction } = useTransactions();
    const { rates } = useRates();

    const { settings } = useSettings();
    const { products } = useInventory(); // Dynamic products
    const { showToast } = useToast();
    const { cartItems, addToCart, removeFromCart, updateCartItem } = useCart();

    // Customer Search State
    const [searchPhone, setSearchPhone] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    
    // Edit State
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [editForm, setEditForm] = useState<Customer | null>(null);

    // Initial default or "Guest" 
    useEffect(() => {
        // Optional: Pre-select a guest or leave null
    }, []);

    const filteredCustomers = useMemo(() => {
        if (!searchPhone) return [];
        return customers.filter(c => 
            c.phone.includes(searchPhone) || 
            c.name.toLowerCase().includes(searchPhone.toLowerCase())
        );
    }, [searchPhone, customers]);

    const selectCustomer = useCallback((customer: Customer) => {
        setSelectedCustomer(customer);
        setSearchPhone(customer.phone);
        setShowCustomerSearch(false);
        setIsEditingCustomer(false);
    }, []);

    // Auto-select new customer if redirected from Add Customer page
    useEffect(() => {
        if (location.state?.newCustomerId) {
            const newCust = getCustomerById(location.state.newCustomerId);
            if (newCust) {
                selectCustomer(newCust);
                // Clear the state to avoid re-selecting on re-renders
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, getCustomerById, selectCustomer]);

    const handleEditClick = () => {
        if (selectedCustomer) {
            setEditForm({ ...selectedCustomer });
            setIsEditingCustomer(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingCustomer(false);
        setEditForm(null);
    };

    const handleSaveCustomer = () => {
        if (editForm) {
            updateCustomer(editForm);
            setSelectedCustomer(editForm);
            setIsEditingCustomer(false);
            setEditForm(null);
            showToast('Customer details updated successfully', 'success', 'Updated');
        }
    };

    const [showResults, setShowResults] = useState(false);

    const filteredProducts = useMemo(() => {
        if (!searchText) return [];
        return products.filter(p => 
            p.name.toLowerCase().includes(searchText.toLowerCase()) || 
            p.sku.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText, products]);

    const handleAddToCart = (product: Product) => {
        addToCart(product);
        setSearchText('');
        setShowResults(false);
        showToast(`${product.name} added to cart`, 'success');
    };

    const handleRemoveFromCart = (id: string) => {
        removeFromCart(id);
        showToast('Item removed from cart', 'info');
    };

    // Exchange Items State
    const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([]);

    // Exchange Form State
    const [exchangeName, setExchangeName] = useState('');
    const [exchangeType, setExchangeType] = useState('Old Gold');
    const [exchangeWeight, setExchangeWeight] = useState<string>('');
    const [exchangePurity, setExchangePurity] = useState<string>('');

    // Dynamic Exchange Rates
    const buyingRates = useMemo(() => ({
        'Old Gold': rates.gold22k, // Base rate is 22k
        'Old Silver': rates.silver
    }), [rates]);

    const calculatedExchangeValue = useMemo(() => {
        const weight = parseFloat(exchangeWeight) || 0;
        const rate = buyingRates[exchangeType as keyof typeof buyingRates] || 0;
        
        if (!weight) return 0;

        // For Gold, calculations are based on 22k rate (91.6 purity)
        if (exchangeType === 'Old Gold') {
            // Default to 91.6 (Standard 22k) if empty
            const purity = exchangePurity ? parseFloat(exchangePurity) : 91.6;
            
            // If purity is 24k (>= 99%), use the 24k rate directly
            if (purity >= 99) {
                return weight * rates.gold24k;
            }
            
            // Formula: Weight * 22kRate * (Purity / 91.6)
            return weight * rate * (purity / 91.6);
        } else {
            // For Silver/Other, assume standard percentage calculation (Base 100)
            const purity = parseFloat(exchangePurity) || 100;
            return weight * rate * (purity / 100);
        }
    }, [exchangeWeight, exchangeType, exchangePurity, buyingRates]);

    const addExchangeItem = () => {
        if (!exchangeName || !exchangeWeight || parseFloat(exchangeWeight) <= 0) {
            showToast('Please enter Item Name and Weight', 'error');
            return;
        }

        const newItem: ExchangeItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: `${exchangeName} (${exchangeType})`,
            weight: parseFloat(exchangeWeight),
            purity: parseFloat(exchangePurity) || (exchangeType === 'Old Gold' ? 91.6 : 100),
            value: calculatedExchangeValue
        };

        setExchangeItems(prev => [...prev, newItem]);
        setExchangeName('');
        setExchangeWeight('');
        setExchangePurity('');
        showToast('Exchange item added', 'info');
    };

    const removeExchangeItem = (id: string) => {
        setExchangeItems(prev => prev.filter(item => item.id !== id));
        showToast('Exchange item removed', 'info');
    };

    // Payment State
    const [selectedPayment, setSelectedPayment] = useState<'Cash' | 'Card' | 'UPI'>('Cash');

    // Totals Calculation
    const totals = useMemo(() => {
        const itemWiseTotals = cartItems.reduce((acc, item) => {
            const wastagePercent = item.wastage || 0;
            const wastageAmount = (item.weight * wastagePercent / 100) * item.rate;
            acc.baseAmount += (item.weight * item.rate) + wastageAmount;
            acc.makingCharges += (item.makingCharges * item.weight);
            acc.discount += item.discount || 0;
            acc.netAmount += item.total;
            acc.wastageAmount += wastageAmount;
            return acc;
        }, { baseAmount: 0, makingCharges: 0, discount: 0, netAmount: 0, wastageAmount: 0 });

        const exchangeTotal = exchangeItems.reduce((sum, item) => sum + item.value, 0);
        
        // Tax (GST 3%) - Usually calculated on net amount after making charges and item-level discounts
        const gst = itemWiseTotals.netAmount * 0.03;
        
        const grandTotal = itemWiseTotals.netAmount + gst - exchangeTotal;

        return {
            grossWeight: cartItems.reduce((sum, item) => sum + item.weight, 0),
            totalItems: cartItems.length,
            subtotal: itemWiseTotals.baseAmount,
            totalMaking: itemWiseTotals.makingCharges,
            gst,
            discount: itemWiseTotals.discount,
            wastageAmount: itemWiseTotals.wastageAmount,
            exchangeTotal,
            grandTotal
        };
    }, [cartItems, exchangeItems]);

    const handleProcessInvoice = () => {
        if (cartItems.length === 0) {
            showToast('Cart is empty! Add items to process invoice.', 'warning');
            return;
        }

        if (!selectedCustomer) {
            showToast('Please select a customer to process the invoice.', 'error');
            return;
        }

        const invoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
        const date = new Date().toISOString(); 

        const invoiceData: InvoiceData = {
            invoiceNo: invoiceNo,
            date: new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            customer: {
                name: selectedCustomer?.name || 'Guest',
                phone: selectedCustomer?.phone || '',
                address: '',
                email: selectedCustomer?.email || ''
            },
            items: cartItems,
            exchangeItems: exchangeItems,
            subtotal: totals.subtotal,
            gst: totals.gst,
            discount: totals.discount,
            grandTotal: totals.grandTotal,
            goldRate: rates.gold22k,
            paymentMethod: selectedPayment
        };

        // Create transaction record
        const newTransaction: Transaction = {
            id: Math.random().toString(36).substr(2, 9),
            invoiceNo: invoiceNo,
            date: date,
            customerName: selectedCustomer?.name || 'Guest',
            customerId: selectedCustomer?.id,
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                code: item.code,
                weight: item.weight,
                purity: item.purity,
                rate: item.rate,
                makingCharges: item.makingCharges,
                wastage: item.wastage,
                total: item.total
            })),
            subtotal: totals.subtotal,
            gst: totals.gst,
            discount: totals.discount,
            exchangeTotal: totals.exchangeTotal,
            exchangeItems: exchangeItems, 
            grandTotal: totals.grandTotal,
            paymentMethod: selectedPayment,
            status: 'Completed',
            goldRate: rates.gold22k
        };

        addTransaction(newTransaction);
        showToast('Invoice processed successfully', 'success', 'Billed');
        navigate(`/dashboard/invoice/view/${newTransaction.id}`, { state: { data: invoiceData } });
    };

    return (
        <div className={styles.billingContainer}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.brand}>
                    <div className={styles.logo}>
                        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>diamond</span>
                    </div>
                    <div>
                        <h2>{settings.name}</h2>
                        <p>{settings.location}</p>
                    </div>
                </div>

                <div className={styles.ratesBar}>
                    <div className={styles.ratesContainer}>
                        <div className={styles.rateItem}>
                            <span className="material-symbols-outlined" style={{ color: '#e29d12', fontSize: '18px' }}>trending_up</span>
                            <div>
                                <p className={styles.label}>Gold (22k)</p>
                                <p className={styles.value}>
                                    ₹{rates.gold22k} 
                                    <span className={`${styles.change} ${styles.positive}`}>+1.2%</span>
                                </p>
                            </div>
                        </div>
                        <div className={styles.rateItem}>
                             <span className="material-symbols-outlined" style={{ color: '#94a3b8', fontSize: '18px' }}>trending_up</span>
                            <div>
                                <p className={styles.label}>Silver</p>
                                <p className={styles.value}>
                                    ₹{rates.silver} 
                                    <span className={`${styles.change} ${styles.positive}`}>+0.5%</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.userSection}>
                    <div className={styles.dateTime}>
                        <p className={styles.date}>{new Date().toLocaleDateString()}</p>
                        <p className={styles.time}>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div 
                        className={styles.avatar}
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCzREsVNl3mmOSBEngBgcFd9N3X75RvbX0kA0gVEI-G6n2KQHjmsJUiQf-U0_wEVMtycuf0gXjRHfmUCYzI3gs5ACdNZ8xeDwrKLjxC7irpyF0c6BTHdTs1X_EJqFVEj2Nbc9_0YgUMH4WpYY7UFzdqDddlyLrRaVqPvDJ_yAJwEcsWWutNgzEMxqWNXr1_1N91Y8FLmSYzB-V9D-IryXk3kedyFxxM34s-ok7YECOjZtqmDVhpFvWFZjtLoFPjx4pgpUx2GkyEewOV")' }}
                    ></div>
                </div>
            </header>

            {/* Main Layout */}
            <div className={styles.mainLayout}>
                <main className={styles.leftPanel}>
                    {/* Top Bar (Search & Filter) */}
                    <div className={styles.topBar}>
                        <div className={styles.searchSection}>
                            <div className={styles.searchWrapper} style={{ position: 'relative' }}>
                                <div className={styles.searchIcon}>
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Scan barcode (F2) or search item code/name..."
                                    value={searchText}
                                    onChange={(e) => {
                                        setSearchText(e.target.value);
                                        setShowResults(true);
                                    }}
                                    onFocus={() => setShowResults(true)}
                                />
                                {showResults && searchText && (
                                    <div className={styles.searchResults}>
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map((product) => (
                                                <div 
                                                    key={product.id}
                                                     onClick={() => handleAddToCart(product)}
                                                    className={styles.searchResultItem}
                                                >
                                                    <img 
                                                        src={(product.images && product.images[0]) || (product as any).image || 'https://via.placeholder.com/50'} 
                                                        alt={product.name} 
                                                    />
                                                    <div className={styles.info}>
                                                        <div className={styles.name}>{product.name}</div>
                                                        <div className={styles.details}>{product.sku} • {product.weight}g • {product.material}</div>
                                                    </div>
                                                    <div className={styles.action}>
                                                        Add
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className={styles.noResults}>
                                                No products found.
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className={styles.scanIcon}>
                                    <button style={{ color: '#b9b09d', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <span className="material-symbols-outlined">qr_code_scanner</span>
                                    </button>
                                </div>
                            </div>
                            <button className={styles.filterBtn}>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>filter_list</span>
                                <span className={styles.textSm}>Filter</span>
                            </button>
                        </div>

                        {/* Categories */}
                        <div className={styles.categories}>
                            {['All Items', 'Rings', 'Chains', 'Bangles', 'Earrings', 'Silver Sets', 'Gemstones'].map((cat) => (
                                <button 
                                    key={cat}
                                    className={activeCategory === cat ? styles.active : styles.inactive}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat === 'All Items' && <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>apps</span>}
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className={styles.contentArea}>
                        {/* Table */}
                        <div className={styles.tableContainer}>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '3rem' }}>#</th>
                                        <th>Item Details</th>
                                        <th className={styles.textRight}>Weight</th>
                                        <th className={styles.textCenter}>Purity</th>
                                        <th className={styles.textRight}>Rate/g</th>
                                        <th className={styles.textRight}>Wast%</th>
                                        <th className={styles.textRight}>Making/g</th>
                                        <th className={styles.textRight}>Disc</th>
                                        <th className={styles.textRight}>Total</th>
                                        <th style={{ width: '2.5rem' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className={styles.subtext}>{String(index + 1).padStart(2, '0')}</td>
                                            <td>
                                                <div className={styles.flexCol}>
                                                    <span className={styles.textBold}>{item.name}</span>
                                                    <span className={styles.subtext}>Code: {item.code}</span>
                                                </div>
                                            </td>
                                            <td className={`${styles.textRight} ${styles.textMono}`}>{item.weight.toFixed(2)}g</td>
                                            <td className={styles.textCenter}>
                                                <span style={{ 
                                                    backgroundColor: item.purity === '22k' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(148, 163, 184, 0.2)', 
                                                    color: item.purity === '22k' ? '#ca8a04' : '#94a3b8', 
                                                    padding: '0.1rem 0.4rem', 
                                                    borderRadius: '0.25rem', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: 600, 
                                                    border: `1px solid ${item.purity === '22k' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(148, 163, 184, 0.3)'}` 
                                                }}>
                                                    {item.purity}
                                                </span>
                                            </td>
                                            <td className={`${styles.textRight} ${styles.textMono} ${styles.subtext}`}>₹{item.rate.toFixed(2)}</td>
                                            <td className={styles.textRight}>
                                                <input 
                                                    type="number" 
                                                    className={styles.tableInput}
                                                    value={item.wastage || 0}
                                                    onChange={(e) => updateCartItem(item.id, { wastage: parseFloat(e.target.value) || 0 })}
                                                />
                                            </td>
                                            <td className={styles.textRight}>
                                                <input 
                                                    type="number" 
                                                    className={styles.tableInput}
                                                    value={item.makingCharges}
                                                    onChange={(e) => updateCartItem(item.id, { makingCharges: parseFloat(e.target.value) || 0 })}
                                                />
                                            </td>
                                            <td className={styles.textRight}>
                                                <input 
                                                    type="number" 
                                                    className={styles.tableInput}
                                                    style={{ color: '#ef4444' }}
                                                    value={item.discount}
                                                    onChange={(e) => updateCartItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                                                />
                                            </td>
                                            <td className={`${styles.textRight} ${styles.textBold} ${styles.textMono}`}>₹{item.total.toFixed(2)}</td>
                                            <td className={styles.textCenter}>
                                                 <button 
                                                    onClick={() => handleRemoveFromCart(item.id)}
                                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                         {/* Exchange Section */}
                        <div className={styles.exchangeSection}>
                            <div className={styles.exchangeHeader}>
                                <h3>
                                    <span className="material-symbols-outlined">currency_exchange</span>
                                    Old Jewellery Exchange Calculator
                                </h3>
                                <span className={styles.rateInfo}>
                                    Buying Rate: Gold (22k Base) ₹{rates.gold22k.toFixed(2)}/g | Silver ₹{rates.silver.toFixed(2)}/g
                                </span>
                            </div>

                            <div className={styles.exchangeForm}>
                                <div className={styles.fieldGroup} style={{ gridColumn: 'span 3' }}>
                                    <label>Item Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Gold Chain" 
                                        value={exchangeName}
                                        onChange={(e) => setExchangeName(e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup} style={{ gridColumn: 'span 2' }}>
                                    <label>Metal Type</label>
                                    <select 
                                        value={exchangeType}
                                        onChange={(e) => setExchangeType(e.target.value)}
                                    >
                                        <option value="Old Gold">Old Gold</option>
                                        <option value="Old Silver">Old Silver</option>
                                    </select>
                                </div>
                                <div className={styles.fieldGroup} style={{ gridColumn: 'span 2' }}>
                                    <label>Weight (g)</label>
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={exchangeWeight}
                                        onChange={(e) => setExchangeWeight(e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup} style={{ gridColumn: 'span 2' }}>
                                    <label>Purity (%)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g 91.6" 
                                        value={exchangePurity}
                                        onChange={(e) => setExchangePurity(e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup} style={{ gridColumn: 'span 2' }}>
                                    <label>Calculated Value</label>
                                    <input 
                                        type="text" 
                                        value={`₹${calculatedExchangeValue.toFixed(2)}`} 
                                        readOnly 
                                        className={styles.readOnly}
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 1' }}>
                                    <button 
                                        className={styles.addButton} 
                                        onClick={addExchangeItem}
                                    >
                                        <span className="material-symbols-outlined">add</span> Add
                                    </button>
                                </div>
                            </div>

                            <div className={styles.tableContainer} style={{ marginBottom: 0 }}>
                                <table>
                                    <thead style={{ backgroundColor: 'rgba(44, 36, 23, 0.3)' }}>
                                        <tr>
                                            <th style={{ padding: '0.5rem' }}>Exchanged Item</th>
                                            <th className={styles.textRight} style={{ padding: '0.5rem' }}>Net Wt.</th>
                                            <th className={styles.textRight} style={{ padding: '0.5rem' }}>Purity</th>
                                            <th className={styles.textRight} style={{ padding: '0.5rem' }}>Value</th>
                                            <th style={{ width: '2rem', padding: '0.5rem' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ backgroundColor: 'transparent' }}>
                                        {exchangeItems.map((item) => (
                                            <tr key={item.id}>
                                                <td style={{ padding: '0.5rem', border: 'none' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8' }}>recycling</span>
                                                        {item.description}
                                                    </div>
                                                </td>
                                                <td className={styles.textRight} style={{ padding: '0.5rem', border: 'none' }}>{item.weight.toFixed(2)}g</td>
                                                <td className={styles.textRight} style={{ padding: '0.5rem', border: 'none' }}>{item.purity}%</td>
                                                <td className={`${styles.textRight} ${styles.textBold}`} style={{ padding: '0.5rem', border: 'none', color: '#ef4444' }}>- ₹{item.value.toFixed(2)}</td>
                                                <td className={styles.textCenter} style={{ padding: '0.5rem', border: 'none' }}>
                                                    <button 
                                                        onClick={() => removeExchangeItem(item.id)}
                                                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.customerSection}>
                        <div className={styles.sectionHeader}>
                            <h3>Customer Details</h3>
                            <button onClick={() => showToast('History feature coming soon!', 'info')} style={{ fontSize: '0.75rem', color: '#e29d12', background: 'none', border: 'none', cursor: 'pointer' }}>View History</button>
                        </div>
                        
                        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '0.6rem', color: '#94a3b8' }}>person_search</span>
                             <input 
                                type="text" 
                                value={searchPhone}
                                onChange={(e) => {
                                    setSearchPhone(e.target.value);
                                    setShowCustomerSearch(true);
                                }}
                                onFocus={() => setShowCustomerSearch(true)}
                                placeholder="Search Customer..."
                                style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2rem', borderRadius: '0.5rem', border: '1px solid #4a4030', backgroundColor: '#221c10', color: 'white', padding: '0.6rem', textAlign: 'center' }}
                            />
                            {selectedCustomer && <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.5rem', top: '0.6rem', color: '#22c55e', fontSize: '18px' }}>check_circle</span>}
                        
                            {/* Customer Search Results Dropdown */}
                            {showCustomerSearch && searchPhone && (
                                <div className={styles.searchResults} style={{ top: '100%', left: 0, right: 0, zIndex: 60 }}>
                                    {filteredCustomers.length > 0 ? (
                                        <>
                                            {filteredCustomers.map(customer => (
                                                <div 
                                                    key={customer.id} 
                                                    className={styles.searchResultItem}
                                                    onClick={() => selectCustomer(customer)}
                                                >
                                                    <div className={styles.info}>
                                                        <div className={styles.name}>{customer.name}</div>
                                                        <div className={styles.details}>{customer.phone}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div 
                                                className={styles.addNewCustomerItem}
                                                onClick={() => navigate('/dashboard/customers/add', { state: { fromBilling: true } })}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                                                Add New Customer
                                            </div>
                                        </>
                                    ) : (
                                        <div 
                                            className={styles.noResults}
                                            onClick={() => navigate('/dashboard/customers/add', { state: { fromBilling: true } })}
                                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                                            No customers found. Click to add.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedCustomer ? (
                            isEditingCustomer && editForm ? (
                                <div className={styles.customerCard} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <span className={styles.textBold}>Edit Customer</span>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)}
                                        placeholder="Name"
                                        style={{ width: '100%', padding: '0.4rem', borderRadius: '0.25rem', border: '1px solid #4a4030', backgroundColor: '#1a140a', color: 'white', fontSize: '0.875rem', textAlign: 'center' }}
                                    />
                                    <input 
                                        type="text" 
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm(prev => prev ? {...prev, phone: e.target.value} : null)}
                                        placeholder="Phone"
                                        style={{ width: '100%', padding: '0.4rem', borderRadius: '0.25rem', border: '1px solid #4a4030', backgroundColor: '#1a140a', color: 'white', fontSize: '0.875rem', textAlign: 'center' }}
                                    />
                                    <input 
                                        type="email" 
                                        value={editForm.email}
                                        onChange={(e) => setEditForm(prev => prev ? {...prev, email: e.target.value} : null)}
                                        placeholder="Email"
                                        style={{ width: '100%', padding: '0.4rem', borderRadius: '0.25rem', border: '1px solid #4a4030', backgroundColor: '#1a140a', color: 'white', fontSize: '0.875rem', textAlign: 'center' }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <button 
                                            onClick={handleSaveCustomer}
                                            style={{ flex: 1, padding: '0.4rem', borderRadius: '0.25rem', backgroundColor: '#22c55e', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                                        >
                                            Save
                                        </button>
                                        <button 
                                            onClick={handleCancelEdit}
                                            style={{ flex: 1, padding: '0.4rem', borderRadius: '0.25rem', backgroundColor: '#4a4030', color: '#b9b09d', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.customerCard}>
                                    <div className={styles.avatarInitials}>
                                        {selectedCustomer?.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p className={styles.textBold} style={{ marginBottom: '0.25rem' }}>{selectedCustomer?.name}</p>
                                        <p className={styles.textSm} style={{ color: '#94a3b8' }}>{selectedCustomer?.totalSpend ? `₹${selectedCustomer.totalSpend}` : '₹0'} spent</p>
                                        <p className={styles.textSm} style={{ color: '#64748b', marginTop: '0.25rem' }}>{selectedCustomer?.email}</p>
                                    </div>
                                    <button 
                                        onClick={handleEditClick}
                                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                        title="Edit Customer"
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                </div>
                            )
                        ) : (
                             <div className={styles.customerCard} style={{ justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                                 No customer selected
                             </div>
                        )}
                    </div>

                    <div className={styles.billSummary}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: '#b9b09d', marginBottom: '1rem' }}>Bill Summary</h3>
                        
                        <div className={styles.row}>
                            <span style={{ color: '#94a3b8' }}>Total Weight (Gross)</span>
                            <span className={styles.textBold}>{totals.grossWeight.toFixed(2)} g</span>
                        </div>
                        <div className={styles.row}>
                             <span style={{ color: '#94a3b8' }}>Total Items</span>
                            <span className={styles.textBold}>{totals.totalItems}</span>
                        </div>
                        
                        <div style={{ height: '1px', backgroundColor: '#4a4030', margin: '1rem 0' }}></div>

                        <div className={styles.row}>
                             <span style={{ color: '#b9b09d' }}>Subtotal</span>
                            <span className={styles.textBold}>₹{(totals.subtotal - totals.wastageAmount).toFixed(2)}</span>
                        </div>
                        <div className={styles.row}>
                             <span style={{ color: '#b9b09d' }}>Wastage Value</span>
                            <span className={styles.textBold}>₹{totals.wastageAmount.toFixed(2)}</span>
                        </div>
                        <div className={styles.row}>
                             <span style={{ color: '#b9b09d' }}>Making Charges</span>
                            <span className={styles.textBold}>₹{totals.totalMaking.toFixed(2)}</span>
                        </div>
                        <div className={styles.row}>
                             <span style={{ color: '#b9b09d' }}>Tax (GST 3%)</span>
                            <span className={styles.textBold}>₹{totals.gst.toFixed(2)}</span>
                        </div>
                        <div className={styles.row}>
                             <span style={{ color: '#b9b09d', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Discount <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span></span>
                             <span style={{ color: '#ef4444' }}>- ₹{totals.discount.toFixed(2)}</span>
                        </div>
                        <div className={styles.row}>
                             <span style={{ color: '#e29d12', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Exchange Adj. <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>currency_exchange</span></span>
                             <span style={{ color: '#ef4444', fontWeight: 'bold' }}>- ₹{totals.exchangeTotal.toFixed(2)}</span>
                        </div>

                        <div className={`${styles.row} ${styles.total}`}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#b9b09d' }}>Grand Total</span>
                            <span className={styles.grandTotal}>₹{totals.grandTotal.toFixed(2)}</span>
                        </div>
                        <div className={styles.textRight} style={{ fontSize: '0.75rem', color: '#64748b' }}>Rounding: -₹0.00</div>
                    </div>

                    <div className={styles.footer}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button 
                                onClick={() => setSelectedPayment('Cash')}
                                style={{ 
                                    padding: '0.75rem', 
                                    borderRadius: '0.5rem', 
                                    border: selectedPayment === 'Cash' ? '2px solid #e29d12' : '1px solid #4a4030', 
                                    backgroundColor: selectedPayment === 'Cash' ? 'rgba(226, 157, 18, 0.1)' : '#2c2417', 
                                    color: selectedPayment === 'Cash' ? '#e29d12' : 'white', 
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ marginBottom: '0.25rem' }}>payments</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Cash</span>
                            </button>
                            <button 
                                onClick={() => setSelectedPayment('Card')}
                                style={{ 
                                    padding: '0.75rem', 
                                    borderRadius: '0.5rem', 
                                    border: selectedPayment === 'Card' ? '2px solid #e29d12' : '1px solid #4a4030', 
                                    backgroundColor: selectedPayment === 'Card' ? 'rgba(226, 157, 18, 0.1)' : '#2c2417', 
                                    color: selectedPayment === 'Card' ? '#e29d12' : 'white', 
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ marginBottom: '0.25rem' }}>credit_card</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Card</span>
                            </button>
                            <button 
                                onClick={() => setSelectedPayment('UPI')}
                                style={{ 
                                    padding: '0.75rem', 
                                    borderRadius: '0.5rem', 
                                    border: selectedPayment === 'UPI' ? '2px solid #e29d12' : '1px solid #4a4030', 
                                    backgroundColor: selectedPayment === 'UPI' ? 'rgba(226, 157, 18, 0.1)' : '#2c2417', 
                                    color: selectedPayment === 'UPI' ? '#e29d12' : 'white', 
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ marginBottom: '0.25rem' }}>qr_code_2</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>UPI</span>
                            </button>
                        </div>
                        <button 
                            className={styles.processBtn} 
                            onClick={handleProcessInvoice}
                        >
                            Process Invoice ({selectedPayment}) <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                        {/* <p className={styles.textCenter} style={{ fontSize: '0.625rem', color: '#64748b', marginTop: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Shortcut: F10 to Checkout</p> */}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Billing;
