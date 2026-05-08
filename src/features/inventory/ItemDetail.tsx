import React, { useState, useRef } from 'react';

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './ItemDetail.module.scss';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';
import { CustomDropdown } from '../../components/common';
import { useCart } from '../../context/CartContext';
import type { StockStatus } from '../../types/Dashboard.types';

const ItemDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { getProductById, deleteProduct, updateProduct, categories, materials, addCategory, addMaterial } = useInventory();
    const { showToast } = useToast();
    const { addToCart } = useCart();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const product = id ? getProductById(id) : undefined;

    const nameInputRef = useRef<HTMLInputElement>(null);
    const skuInputRef = useRef<HTMLInputElement>(null);
    const priceInputRef = useRef<HTMLInputElement>(null);
    const weightInputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState<boolean>(location.state?.edit || false);
    const [editForm, setEditForm] = useState({
        name: product?.name ?? '',
        sku: product?.sku ?? '',
        category: (product?.category ?? '') as string,
        material: (product?.material ?? '') as string,
        weight: product?.weight ?? 0,
        makingCharge: product?.makingCharge ?? 0,
        wastagePercent: product?.wastagePercent ?? 0,
        stoneCost: product?.stoneCost ?? 0,
        status: (product?.status ?? '') as StockStatus,
        quantity: product?.quantity ?? 1
    });

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'In Stock': return styles.inStock;
            case 'Low Stock': return styles.lowStock;
            case 'Out of Stock': return styles.outOfStock;
            default: return '';
        }
    };

    if (!product) {
        return (
            <div className={styles.container}>
                <p>Product not found.</p>
                <button onClick={() => navigate('/dashboard/inventory')}>Back to Inventory</button>
            </div>
        );
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(product.id);
                showToast('Product deleted successfully', 'success');
                navigate('/dashboard/inventory');
            } catch (err) {
                showToast('Failed to delete product', 'error');
            }
        }
    };


    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel edit: reset form
            setEditForm({
                name: product.name,
                sku: product.sku,
                category: product.category,
                material: product.material,
                weight: product.weight,
                makingCharge: product.makingCharge,
                wastagePercent: product.wastagePercent,
                stoneCost: product.stoneCost,
                status: product.status,
                quantity: product.quantity ?? 1
            });
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        if (!editForm.name) {
            showToast('Please fill in the product name', 'error');
            nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => nameInputRef.current?.focus(), 500);
            return;
        }
        if (!editForm.sku) {
            showToast('Please fill in the SKU', 'error');
            skuInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => skuInputRef.current?.focus(), 500);
            return;
        }
        if (editForm.makingCharge === undefined || editForm.makingCharge === null || editForm.makingCharge < 0) {
            showToast('Please enter a valid making charge', 'error');
            priceInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => priceInputRef.current?.focus(), 500);
            return;
        }
        if (!editForm.weight || editForm.weight <= 0) {
            showToast('Please enter a valid weight', 'error');
            weightInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => weightInputRef.current?.focus(), 500);
            return;
        }

        try {
            await updateProduct(product.id, editForm);
            setIsEditing(false);
            showToast('Product updated successfully', 'success');
        } catch (err) {
            showToast('Failed to update product', 'error');
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: ['weight', 'makingCharge', 'wastagePercent', 'stoneCost', 'quantity'].includes(name) 
                ? Number.parseFloat(value) || 0 
                : value
        }));
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            showToast('Added to cart successfully', 'success');
        }
    };

    // Use product image or placeholder
    const mainImage = selectedImage || (product.images && product.images[0]) || 'https://via.placeholder.com/600';

    return (
        <div className={styles.container}>
            {/* Breadcrumbs */}
            <nav className={styles.breadcrumbs}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>Dashboard</a>
                <span className={`material-symbols-outlined ${styles.icon}`}>chevron_right</span>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard/inventory'); }}>Inventory</a>
                <span className={`material-symbols-outlined ${styles.icon}`}>chevron_right</span>
                <span className={styles.current}>{isEditing ? 'Edit Product' : 'Product Details'}</span>
            </nav>

            {/* Header Actions */}
            <div className={styles.headerActions}>
                {isEditing ? (
                    <>
                        <button className={styles.deleteBtn} onClick={handleEditToggle}>
                            <span className="material-symbols-outlined">close</span>
                            Cancel
                        </button>
                        <button className={styles.editBtn} onClick={handleSave}>
                            <span className="material-symbols-outlined">save</span>
                            Save Changes
                        </button>
                    </>
                ) : (
                    <>
                        <button className={styles.deleteBtn} onClick={handleDelete}>
                            <span className="material-symbols-outlined">delete</span>
                            Delete
                        </button>
                        <button className={styles.editBtn} onClick={handleEditToggle}>
                            <span className="material-symbols-outlined">edit</span>
                            Edit Product
                        </button>
                        <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                            <span className="material-symbols-outlined">shopping_cart</span>
                            Add to Cart
                        </button>
                    </>
                )}
            </div>

            {/* Main Layout */}
            <div className={styles.productLayout}>
                {/* Left Column: Gallery */}
                <div className={styles.gallerySection}>
                    <div className={styles.mainImage}>
                        <div className={`${styles.stockFiles} ${!isEditing ? getStatusClass(product.status) : ''}`}>
                            {isEditing ? (
                                <CustomDropdown
                                    options={['In Stock', 'Low Stock', 'Out of Stock']}
                                    value={editForm.status}
                                    onChange={(val) => setEditForm(prev => ({ ...prev, status: val as StockStatus }))}
                                />
                            ) : product.status}
                        </div>
                        <img src={mainImage} alt={product.name} />
                    </div>
                    <div className={styles.thumbnails}>
                        {product.images?.map((img, idx) => (
                            <button
                                key={idx}
                                className={mainImage === img ? styles.active : ''}
                                onClick={() => setSelectedImage(img)}
                            >
                                <img src={img} alt={`View ${idx + 1}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className={styles.detailsSection}>
                    {/* Info Card */}
                    <div className={styles.infoCard}>
                        <div className={styles.meta}>
                            {isEditing ? (
                                <input
                                    ref={skuInputRef}
                                    type="text"
                                    name="sku"
                                    value={editForm.sku}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="SKU"
                                />
                            ) : (
                                <span className={styles.sku}>SKU: {product.sku}</span>
                            )}
                            <span>•</span>
                            <span>{product.material} ({product.category})</span>
                        </div>
                        {isEditing ? (
                            <input
                                ref={nameInputRef}
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleInputChange}
                                className={`${styles.input} ${styles.largeInput}`}
                                placeholder="Product Name"
                            />
                        ) : (
                            <h1>{product.name}</h1>
                        )}
                        <p>Handcrafted jewellery piece featuring {product.material} finish and premium quality assurance.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <div className={styles.label}>
                                <span className="material-symbols-outlined">scale</span>
                                Gross Wt.
                            </div>
                            <div className={styles.value}>
                                {isEditing ? (
                                    <input
                                        ref={weightInputRef}
                                        type="number"
                                        name="weight"
                                        value={editForm.weight}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        step="0.01"
                                    />
                                ) : `${product.weight.toFixed(2)}g`}
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.label}>
                                <span className="material-symbols-outlined">diamond</span>
                                Purity
                            </div>
                            <div className={styles.value}>
                                {isEditing ? (
                                    <CustomDropdown
                                        options={materials}
                                        value={editForm.material}
                                        onChange={(val) => setEditForm(prev => ({ ...prev, material: val }))}
                                        allowCustom={true}
                                        onAddOption={addMaterial}
                                    />
                                ) : product.material}
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.label}>
                                <span className="material-symbols-outlined">inventory</span>
                                Stock
                            </div>
                            <div className={styles.value}>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={editForm.quantity}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        step="1"
                                    />
                                ) : `${product.quantity ?? 1} Units`}
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.label}>
                                <span className="material-symbols-outlined">category</span>
                                Type
                            </div>
                            <div className={styles.value}>
                                {isEditing ? (
                                    <CustomDropdown
                                        options={categories}
                                        value={editForm.category}
                                        onChange={(val) => setEditForm(prev => ({ ...prev, category: val }))}
                                        allowCustom={true}
                                        onAddOption={addCategory}
                                    />
                                ) : product.category}
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className={styles.pricingCard}>
                        <div className={styles.priceBlock}>
                            <div className={styles.label}>Making Charge (₹)</div>
                            {isEditing ? (
                                <input
                                    ref={priceInputRef}
                                    type="number"
                                    name="makingCharge"
                                    value={editForm.makingCharge}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="0.00"
                                />
                            ) : (
                                <div className={styles.amount}>₹{product.makingCharge.toLocaleString('en-IN')}</div>
                            )}

                        </div>
                        <div className={styles.priceBlock}>
                            <div className={styles.label}>Wastage (%)</div>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="wastagePercent"
                                    value={editForm.wastagePercent}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="0"
                                    step="0.01"
                                />
                            ) : (
                                <div className={styles.amount}>{product.wastagePercent}%</div>
                            )}
                        </div>
                        <div className={styles.priceBlock}>
                            <div className={styles.label}>Stone Cost (₹)</div>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="stoneCost"
                                    value={editForm.stoneCost}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="0.00"
                                />
                            ) : (
                                <div className={styles.amount}>₹{product.stoneCost.toLocaleString('en-IN')}</div>
                            )}
                        </div>
                    </div>

                    {/* Specs */}
                    <div className={styles.specsCard}>
                        <h3>
                            <span className="material-symbols-outlined">manufacturing</span>
                            Technical Specifications
                        </h3>
                        <div className={styles.specsGrid}>
                            <div className={styles.specItem}>
                                <span className={styles.label}>Net Weight</span>
                                <span className={styles.value}>{product.weight.toFixed(2)} grams</span>
                            </div>
                            <div className={styles.specItem}>
                                <span className={styles.label}>Material</span>
                                <span className={styles.value}>{product.material}</span>
                            </div>
                            <div className={styles.specItem}>
                                <span className={styles.label}>Hallmarked</span>
                                <span className={styles.value}>
                                    <span className={`material-symbols-outlined ${styles.check}`}>check_circle</span>
                                    Yes (BIS)
                                </span>
                            </div>
                            <div className={styles.specItem}>
                                <span className={styles.label}>Category</span>
                                <span className={styles.value}>{product.category}</span>
                            </div>
                            <div className={styles.specItem}>
                                <span className={styles.label}>Date Added</span>
                                <span className={styles.value}>{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button className={styles.editBtn} onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined">save</span>
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;
