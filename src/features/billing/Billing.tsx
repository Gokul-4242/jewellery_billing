import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import styles from './Billing.module.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormSelect } from '../../components/common';
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
import avatarImg from '../../assets/billing page.png';
import api from '../../api/axios';

const Billing: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeCategory, setActiveCategory] = useState<string>('All Items');
    const [searchText, setSearchText] = useState<string>('');

    // Contexts
    const { customers, updateCustomer, getCustomerById } = useCustomers();
    const { addTransaction } = useTransactions();
    const { rates } = useRates();

    // Calculate trends
    const getTrend = (current: number, previous?: number) => {
        if (!previous) return { percent: 0, direction: 'stable' };
        const diff = current - previous;
        const percent = (diff / previous) * 100;
        return {
            percent: Math.abs(percent).toFixed(2),
            direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable'
        };
    };

    const goldTrend = useMemo(() => getTrend(rates.gold22k, rates.previous?.gold22k), [rates.gold22k, rates.previous?.gold22k]);
    const silverTrend = useMemo(() => getTrend(rates.silver, rates.previous?.silver), [rates.silver, rates.previous?.silver]);


    const { settings } = useSettings();
    const { products, updateProduct, getProductById } = useInventory(); // Dynamic products
    const { showToast } = useToast();
    const { cartItems, addToCart, removeFromCart, updateCartItem } = useCart();

    // Customer Search State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(() => {
        if (location.state?.newCustomerId) {
            return getCustomerById(location.state.newCustomerId) || null;
        }
        return null;
    });
    const [searchPhone, setSearchPhone] = useState(() => {
        if (location.state?.newCustomerId) {
            return getCustomerById(location.state.newCustomerId)?.phone || '';
        }
        return '';
    });
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);

    // Edit State
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [editForm, setEditForm] = useState<Customer | null>(null);

    // Refs for auto-scrolling
    const customerInputRef = useRef<HTMLInputElement>(null);
    const exchangeNameRef = useRef<HTMLInputElement>(null);
    const exchangeWeightRef = useRef<HTMLInputElement>(null);



    // --- Filter State ---
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [priceRange, setPriceRange] = useState<{ min: number, max: number }>({ min: 0, max: 1000000 });
    const [weightRange, setWeightRange] = useState<{ min: number, max: number }>({ min: 0, max: 1000 });
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

    // Reset filters
    const resetFilters = () => {
        setPriceRange({ min: 0, max: 1000000 });
        setWeightRange({ min: 0, max: 1000 });
        setSelectedMaterials([]);
        setActiveCategory('All Items');
        setSearchText('');
        setShowResults(false);
    };

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
            // Clear the state to avoid re-selecting on re-renders
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

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
        let result = products;

        // 1. Category Filter
        if (activeCategory !== 'All Items') {
            const categoryMap: Record<string, string[]> = {
                'Rings': ['Ring'],
                'Chains': ['Chain', 'Necklace'],
                'Bangles': ['Bangle', 'Bracelet'],
                'Earrings': ['Earring'],
                'Silver Sets': ['Silver', 'Set'],
                'Gemstones': ['Gemstone', 'Stone', 'Pendant']
            };

            const targetKeywords = categoryMap[activeCategory] || [activeCategory];

            result = result.filter(p =>
                targetKeywords.some(k =>
                    p.category?.toString().toLowerCase().includes(k.toLowerCase()) ||
                    p.name?.toLowerCase().includes(k.toLowerCase())
                )
            );
        }

        // 2. Text Search
        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerSearch) ||
                p.sku.toLowerCase().includes(lowerSearch)
            );
        }

        // 3. Price Filter
        if (priceRange.min > 0 || priceRange.max < 1000000) {
            result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
        }

        // 4. Weight Filter
        if (weightRange.min > 0 || weightRange.max < 1000) {
            result = result.filter(p => p.weight >= weightRange.min && p.weight <= weightRange.max);
        }

        // 5. Material Filter
        if (selectedMaterials.length > 0) {
            result = result.filter(p => selectedMaterials.some(m => p.material.includes(m)));
        }

        // If 'All Items' is selected and no other filters active, do not show everything by default
        // (Assuming we only want to show results when the user intends to find something)
        // However, if a user clicks "Filter" and applies filters, they expect results.
        const hasActiveFilters =
            activeCategory !== 'All Items' ||
            searchText.length > 0 ||
            selectedMaterials.length > 0 ||
            priceRange.min > 0 ||
            priceRange.max < 1000000 ||
            weightRange.min > 0 ||
            weightRange.max < 1000;

        if (!hasActiveFilters) return [];

        return result;
    }, [searchText, products, activeCategory, priceRange, weightRange, selectedMaterials]);

    // Show results when category or filters change
    useEffect(() => {
        if (activeCategory !== 'All Items' || selectedMaterials.length > 0) {
            setShowResults(true);
        }
    }, [activeCategory, selectedMaterials]);

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
        const weight = Number.parseFloat(exchangeWeight) || 0;
        const rate = buyingRates[exchangeType as keyof typeof buyingRates] || 0;

        if (!weight) return 0;

        // For Gold, calculations are based on 22k rate (91.6 purity)
        if (exchangeType === 'Old Gold') {
            // Default to 91.6 (Standard 22k) if empty
            const purity = exchangePurity ? Number.parseFloat(exchangePurity) : 91.6;

            // If purity is 24k (>= 99%), use the 24k rate directly
            if (purity >= 99) {
                return weight * rates.gold24k;
            }

            // Formula: Weight * 22kRate * (Purity / 91.6)
            return weight * rate * (purity / 91.6);
        } else {
            // For Silver/Other, assume standard percentage calculation (Base 100)
            const purity = Number.parseFloat(exchangePurity) || 100;
            return weight * rate * (purity / 100);
        }
    }, [exchangeWeight, exchangeType, exchangePurity, buyingRates, rates.gold24k]);

    const addExchangeItem = () => {
        if (!exchangeName) {
            showToast('Please enter an Item Name', 'error');
            exchangeNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => exchangeNameRef.current?.focus(), 500);
            return;
        }
        
        if (!exchangeWeight || Number.parseFloat(exchangeWeight) <= 0) {
            showToast('Please enter a valid Weight', 'error');
            exchangeWeightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => exchangeWeightRef.current?.focus(), 500);
            return;
        }

        const newItem: ExchangeItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: `${exchangeName} (${exchangeType})`,
            weight: Number.parseFloat(exchangeWeight),
            purity: Number.parseFloat(exchangePurity) || (exchangeType === 'Old Gold' ? 91.6 : 100),
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
    const [gstRate, setGstRate] = useState<string>('3'); // Default 3% GST

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

        // Tax (GST) calculation based on selected rate
        const gstPercent = Number.parseFloat(gstRate) || 0;
        const gst = itemWiseTotals.netAmount * (gstPercent / 100);

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
    }, [cartItems, exchangeItems, gstRate]);

    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcessInvoice = async () => {
        if (cartItems.length === 0) {
            showToast('Cart is empty! Add items to process invoice.', 'warning');
            return;
        }

        if (!selectedCustomer) {
            showToast('Please select a customer to process the invoice.', 'error');
            customerInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => customerInputRef.current?.focus(), 500);
            return;
        }

        setIsProcessing(true);
        try {
            // STEP 1: Formulate strictly mapped payload for Backend
            const backendPayload = {
                customerId: selectedCustomer?.id,
                items: cartItems.map(item => ({
                    productId: item.productId || item.id,
                    weight: item.weight,
                    quantity: 1
                })),
                gst: totals.gst,
                discount: totals.discount,
                exchangeAmount: totals.exchangeTotal
            };

            const res = await api.post('/transactions', backendPayload);
            const savedTxn = res.data.data;
            
            const invoiceNo = savedTxn.invoiceNo;
            const date = savedTxn.createdAt;

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
            gstRate: Number.parseFloat(gstRate) || 0,
            discount: totals.discount,
            grandTotal: totals.grandTotal,
            goldRate: rates.gold22k,
            paymentMethod: selectedPayment
        };

            // Create proxy transaction record for Context
            const newTransaction: Transaction = {
                id: savedTxn._id,
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
                gstRate: Number.parseFloat(gstRate) || 0,
                discount: totals.discount,
                exchangeTotal: totals.exchangeTotal,
                exchangeItems: exchangeItems,
                grandTotal: savedTxn.totalAmount, // Use backend's source of truth for Final Bill Math
                paymentMethod: selectedPayment,
                status: 'Completed',
                goldRate: rates.gold22k
            };

            // Inventory stock is dynamically deducted by the Backend Atomic Operation. 
            // We just need to trigger a contextual reset for frontend cache clearing (optional since it refetches on reload)

            addTransaction(newTransaction);
            // Clear cart
            cartItems.forEach(item => removeFromCart(item.id));
            
            showToast('Invoice processed successfully', 'success', 'Billed');
            navigate(`/dashboard/invoice/view/${newTransaction.id}`, { state: { data: invoiceData } });
        } catch (error: any) {
            console.error('Failed to process invoice:', error);
            showToast(error.response?.data?.message || 'Transaction Failed', 'error', 'Error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.billingContainer}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.brand}>
                    <div className={styles.logo}>
                        <span className={`material-symbols-outlined ${styles.logoIcon}`}>diamond</span>
                    </div>
                    <div>
                        <h2>{settings.name}</h2>
                        <p>{settings.location}</p>
                    </div>
                </div>

                <div className={styles.ratesBar}>
                    <div className={styles.ratesContainer}>
                        <div className={styles.rateItem}>
                            <span
                                className={`material-symbols-outlined ${styles.trendIcon} ${styles[goldTrend.direction]}`}
                            >
                                {goldTrend.direction === 'up' ? 'trending_up' : goldTrend.direction === 'down' ? 'trending_down' : 'trending_flat'}
                            </span>
                            <div>
                                <p className={styles.label}>Gold (22k)</p>
                                <p className={styles.value}>
                                    ₹{rates.gold22k}
                                    <span className={`${styles.change} ${goldTrend.direction === 'up' ? styles.positive : goldTrend.direction === 'down' ? styles.negative : styles.stable}`}>
                                        {goldTrend.direction === 'up' ? '+' : goldTrend.direction === 'down' ? '-' : ''}{goldTrend.percent}%
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className={styles.rateItem}>
                            <span
                                className={`material-symbols-outlined ${styles.trendIcon} ${silverTrend.direction === 'stable' ? styles.stableSilver : styles[silverTrend.direction]}`}
                            >
                                {silverTrend.direction === 'up' ? 'trending_up' : silverTrend.direction === 'down' ? 'trending_down' : 'trending_flat'}
                            </span>
                            <div>
                                <p className={styles.label}>Silver</p>
                                <p className={styles.value}>
                                    ₹{rates.silver}
                                    <span className={`${styles.change} ${silverTrend.direction === 'up' ? styles.positive : silverTrend.direction === 'down' ? styles.negative : styles.stable}`}>
                                        {silverTrend.direction === 'up' ? '+' : silverTrend.direction === 'down' ? '-' : ''}{silverTrend.percent}%
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.userSection}>
                    <div className={styles.dateTime}>
                        <p className={styles.date}>{new Date().toLocaleDateString()}</p>
                        <p className={styles.time}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div
                        className={styles.avatar}
                        style={{ backgroundImage: `url("${avatarImg}")` }}
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
                                                <button
                                                    type="button"
                                                    key={product.id}
                                                    onClick={() => (product.quantity ?? 1) > 0 && handleAddToCart(product)}
                                                    className={`${styles.searchResultItem} ${(product.quantity === 0) ? styles.disabled : ''}`}
                                                >
                                                    <img
                                                        src={(product.images && product.images[0]) || (product as Product & { image?: string }).image || 'https://via.placeholder.com/50'}
                                                        alt={product.name}
                                                    />
                                                    <div className={styles.info}>
                                                        <div className={styles.name}>{product.name}</div>
                                                        <div className={styles.details}>
                                                            {product.sku} • {product.weight}g • {product.material} •
                                                             <span className={`${styles.textBold} ${(product.quantity ?? 1) > 0 ? styles.inStock : styles.outStock}`}>
                                                                 Qty: {product.quantity ?? 1}
                                                             </span>
                                                        </div>
                                                    </div>
                                                     <div className={styles.action}>
                                                        {(product.quantity === 0) ? 'Out' : 'Add'}
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className={styles.noResults}>
                                                No products found.
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className={styles.scanIcon}>
                                     <button className={styles.scanBtn}>
                                        <span className="material-symbols-outlined">qr_code_scanner</span>
                                    </button>
                                </div>
                            </div>
                            <button
                                className={styles.filterBtn}
                                onClick={() => setShowFilterModal(true)}
                            >
                                 <span className={`material-symbols-outlined ${styles.filterIcon}`}>filter_list</span> <span className={styles.textSm}>Filter</span>
                                {(selectedMaterials.length > 0 || priceRange.min > 0 || weightRange.min > 0) && (
                                     <span className={styles.filterBadge}></span>
                                )}
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
                                     {cat === 'All Items' && <span className={`material-symbols-outlined ${styles.categoryIcon}`}>apps</span>} {cat}
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
                                        <th className={styles.colSm}>#</th>
                                        <th>Item Details</th>
                                        <th className={styles.textRight}>Weight</th>
                                        <th className={styles.textCenter}>Purity</th>
                                        <th className={styles.textRight}>Rate/g</th>
                                        <th className={styles.textRight}>Wast%</th>
                                        <th className={styles.textRight}>Making/g</th>
                                        <th className={styles.textRight}>Disc</th>
                                        <th className={styles.textRight}>Total</th>
                                        <th className={styles.colIcon}></th>
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
                                                <span className={`${styles.purityBadge} ${item.purity === '22k' ? styles.gold22k : styles.silver}`}>
                                                    {item.purity}
                                                </span>
                                            </td>
                                            <td className={`${styles.textRight} ${styles.textMono} ${styles.subtext}`}>₹{item.rate.toFixed(2)}</td>
                                            <td className={styles.textRight}>
                                                <input
                                                    type="number"
                                                    className={styles.tableInput}
                                                    value={item.wastage || 0}
                                                    onChange={(e) => updateCartItem(item.id, { wastage: Number.parseFloat(e.target.value) || 0 })}
                                                />
                                            </td>
                                            <td className={styles.textRight}>
                                                <input
                                                    type="number"
                                                    className={styles.tableInput}
                                                    value={item.makingCharges}
                                                    onChange={(e) => updateCartItem(item.id, { makingCharges: Number.parseFloat(e.target.value) || 0 })}
                                                />
                                            </td>
                                            <td className={styles.textRight}>
                                                <input
                                                    type="number"
                                                    className={`${styles.tableInput} ${styles.discountInput}`}
                                                    value={item.discount}
                                                    onChange={(e) => updateCartItem(item.id, { discount: Number.parseFloat(e.target.value) || 0 })}
                                                />
                                            </td>
                                            <td className={`${styles.textRight} ${styles.textBold} ${styles.textMono}`}>₹{item.total.toFixed(2)}</td>
                                            <td className={styles.textCenter}>
                                                <button
                                                    onClick={() => handleRemoveFromCart(item.id)}
                                                    className={styles.deleteBtn}
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
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
                                    <span className="material-symbols-outlined">currency_exchange</span> Old Jewellery Exchange Calculator
                                </h3>
                                <span className={styles.rateInfo}>
                                    Buying Rate: Gold (22k Base) ₹{rates.gold22k.toFixed(2)}/g | Silver ₹{rates.silver.toFixed(2)}/g
                                </span>
                            </div>

                            <div className={styles.exchangeForm}>
                                <div className={`${styles.fieldGroup} ${styles.large}`}>
                                    <label>Item Name</label>
                                    <input
                                        ref={exchangeNameRef}
                                        type="text"
                                        placeholder="e.g. Gold Chain"
                                        value={exchangeName}
                                        onChange={(e) => setExchangeName(e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Metal Type</label>
                                    <FormSelect
                                        value={exchangeType}
                                        onChange={(val) => setExchangeType(val)}
                                        options={[
                                            { label: 'Old Gold', value: 'Old Gold' },
                                            { label: 'Old Silver', value: 'Old Silver' }
                                        ]}
                                        className={styles.metalTypeSelect}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Weight (g)</label>
                                    <input
                                        ref={exchangeWeightRef}
                                        type="number"
                                        placeholder="0.00"
                                        value={exchangeWeight}
                                        onChange={(e) => setExchangeWeight(e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Purity (%)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g 91.6"
                                        value={exchangePurity}
                                        onChange={(e) => setExchangePurity(e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Calculated Value</label>
                                    <input
                                        type="text"
                                        value={`₹${calculatedExchangeValue.toFixed(2)}`}
                                        readOnly
                                        className={styles.readOnly}
                                    />
                                </div>
                                <div className={styles.addButtonContainer}>
                                    <button
                                        className={styles.addButton}
                                        onClick={addExchangeItem}
                                    >
                                        <span className="material-symbols-outlined">add</span> Add
                                    </button>
                                </div>
                            </div>

                            <div className={`${styles.tableContainer} ${styles.noMargin}`}>
                                <table>
                                    <thead className={styles.exchangeTableHead}>
                                        <tr>
                                            <th>Exchanged Item</th>
                                            <th className={styles.textRight}>Net Wt.</th>
                                            <th className={styles.textRight}>Purity</th>
                                            <th className={styles.textRight}>Value</th>
                                            <th className={styles.colIcon}></th>
                                        </tr>
                                    </thead>
                                    <tbody className={styles.exchangeTableBody}>
                                         {exchangeItems.map((item) => (
                                            <tr key={item.id} className={styles.exchangeRow}>
                                                <td>
                                                     <div className={styles.exchangeItemInfo}>
                                                        <span className="material-symbols-outlined">recycling</span> {item.description}
                                                    </div>
                                                </td>
                                                <td className={styles.textRight}>{item.weight.toFixed(2)}g</td>
                                                <td className={styles.textRight}>{item.purity}%</td>
                                                <td className={`${styles.textRight} ${styles.exchangeValue}`}>- ₹{item.value.toFixed(2)}</td>
                                                <td className={styles.textCenter}>
                                                    <button
                                                        onClick={() => removeExchangeItem(item.id)}
                                                        className={styles.deleteBtn}
                                                    >
                                                        <span className={`material-symbols-outlined ${styles.closeIcon}`}>close</span>
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
                            <button onClick={() => showToast('History feature coming soon!', 'info')} className={styles.viewHistoryBtn}>View History</button>
                        </div>

                        <div className={styles.customerSearchWrapper}>
                            <span className={`material-symbols-outlined ${styles.searchIcon}`}>person_search</span>
                            <input
                                ref={customerInputRef}
                                type="text"
                                value={searchPhone}
                                onChange={(e) => {
                                    setSearchPhone(e.target.value);
                                    setShowCustomerSearch(true);
                                }}
                                onFocus={() => setShowCustomerSearch(true)}
                                placeholder="Search Customer..."
                                className={styles.customerSearchInput}
                            />
                            {selectedCustomer && <span className={`material-symbols-outlined ${styles.checkIcon}`}>check_circle</span>}

                            {/* Customer Search Results Dropdown */}
                            {showCustomerSearch && searchPhone && (
                                <div className={styles.customerSearchResults}>
                                    {filteredCustomers.length > 0 ? (
                                        <>
                                            {filteredCustomers.map(customer => (
                                                <button
                                                    type="button"
                                                    key={customer.id}
                                                    className={styles.searchResultItem}
                                                    onClick={() => selectCustomer(customer)}
                                                >
                                                    <div className={styles.info}>
                                                        <div className={styles.name}>{customer.name}</div>
                                                        <div className={styles.details}>{customer.phone}</div>
                                                    </div>
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                className={styles.addNewCustomerItem}
                                                onClick={() => navigate('/dashboard/customers/add', { state: { fromBilling: true } })}
                                            >
                                                 <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span> Add New Customer
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            className={styles.noResults}
                                            onClick={() => navigate('/dashboard/customers/add', { state: { fromBilling: true } })}
                                        >
                                             <span className="material-symbols-outlined">person_add</span> No customers found. Click to add.
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedCustomer ? (
                            isEditingCustomer && editForm ? (
                                <div className={`${styles.customerCard} ${styles.editing}`}>
                                    <div className={styles.cardHeader}>
                                        <span className={styles.textBold}>Edit Customer</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        placeholder="Name"
                                        className={styles.editInput}
                                    />
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm(prev => prev ? { ...prev, phone: e.target.value } : null)}
                                        placeholder="Phone"
                                        className={styles.editInput}
                                    />
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm(prev => prev ? { ...prev, email: e.target.value } : null)}
                                        placeholder="Email"
                                        className={styles.editInput}
                                    />
                                    <div className={styles.editActions}>
                                        <button
                                            onClick={handleSaveCustomer}
                                            className={styles.saveBtn}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className={styles.cancelBtn}
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
                                     <div className={styles.customerInfo}>
                                         <p className={styles.textBold}>{selectedCustomer?.name}</p>
                                         <p className={styles.textSm}>{selectedCustomer?.totalSpend ? `₹${selectedCustomer.totalSpend}` : '₹0'} spent</p>
                                         <p className={styles.customerEmail}>{selectedCustomer?.email}</p>
                                     </div>
                                     <button
                                         onClick={handleEditClick}
                                         className={styles.editBtn}
                                         title="Edit Customer"
                                     >
                                         <span className="material-symbols-outlined">edit</span>
                                     </button>
                                </div>
                            )
                        ) : (
                             <div className={`${styles.customerCard} ${styles.empty}`}>
                                <span className="material-symbols-outlined">person_off</span> <span>No customer selected</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.billSummary}>
                         <h3 className={styles.summaryTitle}>Bill Summary</h3>

                        <div className={styles.row}>
                             <span className={styles.textMuted}>Total Weight (Gross)</span>
                            <span className={styles.textBold}>{totals.grossWeight.toFixed(2)} g</span>
                        </div>
                        <div className={styles.row}>
                             <span className={styles.textMuted}>Total Items</span>
                            <span className={styles.textBold}>{totals.totalItems}</span>
                        </div>

                         <div className={styles.separator}></div>

                        <div className={styles.row}>
                             <span className={styles.summaryLabel}>Subtotal</span>
                            <span className={styles.textBold}>₹{(totals.subtotal - totals.wastageAmount).toFixed(2)}</span>
                        </div>
                        <div className={styles.row}>
                             <span className={styles.summaryLabel}>Wastage Value</span>
                            <span className={styles.textBold}>₹{totals.wastageAmount.toFixed(2)}</span>
                        </div>
                        <div className={styles.row}>
                             <span className={styles.summaryLabel}>Making Charges</span>
                            <span className={styles.textBold}>₹{totals.totalMaking.toFixed(2)}</span>
                        </div>
                        <div className={styles.row} style={{ alignItems: 'center' }}>
                            <span className={styles.summaryLabelWithIcon}>
                                Tax (GST)
                                <select
                                    className={styles.miniSelect}
                                    value={gstRate}
                                    onChange={(e) => setGstRate(e.target.value)}
                                    style={{
                                        padding: '0.1rem 0.25rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid #4a4030',
                                        backgroundColor: '#2c2417',
                                        color: '#e29d12',
                                        fontSize: '0.75rem',
                                        width: 'auto',
                                        marginLeft: '0.25rem'
                                    }}
                                >
                                    <option value="3">3%</option>
                                    <option value="0">None</option>
                                </select>
                            </span>
                            <span className={styles.textBold}>₹{totals.gst.toFixed(2)}</span>
                        </div>
                         <div className={styles.row}>
                             <span className={styles.summaryLabelWithIcon}>Discount <span className={`material-symbols-outlined ${styles.infoIcon}`}>info</span></span>
                             <span className={styles.negativeValue}>- ₹{totals.discount.toFixed(2)}</span>
                         </div>
                         <div className={styles.row}>
                             <span className={styles.exchangeAdjLabel}>Exchange Adj. <span className={`material-symbols-outlined ${styles.infoIcon}`}>currency_exchange</span></span>
                             <span className={`${styles.negativeValue} ${styles.textBold}`}>- ₹{totals.exchangeTotal.toFixed(2)}</span>
                         </div>

                         <div className={`${styles.row} ${styles.total}`}>
                             <span className={styles.summaryLabel}>Grand Total</span>
                             <span className={styles.grandTotal}>₹{totals.grandTotal.toFixed(2)}</span>
                         </div>
                         <div className={styles.roundingInfo}>Rounding: -₹0.00</div>
                    </div>

                     <div className={styles.footer}>
                         <div className={styles.paymentGrid}>
                             <button
                                 onClick={() => setSelectedPayment('Cash')}
                                 className={`${styles.paymentOption} ${selectedPayment === 'Cash' ? styles.active : ''}`}
                             >
                                 <span className="material-symbols-outlined">payments</span> <span className={styles.optionLabel}>Cash</span>
                             </button>
                             <button
                                 onClick={() => setSelectedPayment('Card')}
                                 className={`${styles.paymentOption} ${selectedPayment === 'Card' ? styles.active : ''}`}
                             >
                                 <span className="material-symbols-outlined">credit_card</span> <span className={styles.optionLabel}>Card</span>
                             </button>
                             <button
                                 onClick={() => setSelectedPayment('UPI')}
                                 className={`${styles.paymentOption} ${selectedPayment === 'UPI' ? styles.active : ''}`}
                             >
                                 <span className="material-symbols-outlined">qr_code_2</span> <span className={styles.optionLabel}>UPI</span>
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
            {/* Filter Modal */}
            {showFilterModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.filterModal}>
                        <div className={styles.modalHeader}>
                            <h3>Filter Products</h3>
                            <button className={styles.closeBtn} onClick={() => setShowFilterModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className={styles.modalBody}>

                            {/* Materials */}
                            <div className={styles.filterGroup}>
                                <label>Material</label>
                                <div className={styles.optionsGrid}>
                                    {['22k Gold', '18k Gold', '925 Silver', 'Platinum'].map(mat => (
                                        <label key={mat} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={selectedMaterials.includes(mat)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedMaterials(prev => [...prev, mat]);
                                                    } else {
                                                        setSelectedMaterials(prev => prev.filter(m => m !== mat));
                                                    }
                                                }}
                                            />
                                            {mat}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className={styles.filterGroup}>
                                <label>Price Range (₹)</label>
                                <div className={styles.rangeInputs}>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                    />
                                    <span>to</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            {/* Weight Range */}
                            <div className={styles.filterGroup}>
                                <label>Weight Range (g)</label>
                                <div className={styles.rangeInputs}>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={weightRange.min}
                                        onChange={(e) => setWeightRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                    />
                                    <span>to</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={weightRange.max}
                                        onChange={(e) => setWeightRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.secondary} onClick={resetFilters}>Reset All</button>
                            <button className={styles.primary} onClick={() => {
                                setShowFilterModal(false);
                                setShowResults(true);
                            }}>Apply Filters</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;
