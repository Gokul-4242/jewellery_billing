import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddItem.module.scss';
import api from '../../api/axios';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';
import { CustomDropdown } from '../../components/common';
import type { StockStatus } from '../../types/Dashboard.types';

const AddItem: React.FC = () => {
    const navigate = useNavigate();
    const { addProduct, categories, materials, addCategory, addMaterial } = useInventory();
    const { showToast } = useToast();
    const firstInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        material: '',
        weight: '',
        makingCharge: '',
        wastagePercent: '',
        stoneCost: '0',
        quantity: '1',
        stoneDetails: '',
        supplier: ''
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const readFileAsDataUrl = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                const result = reader.result as string;
                setImagePreviews(prev => [...prev, result].slice(0, 3));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const filesArray = Array.from(files);
        const remainingSlots = 3 - imagePreviews.length;
        if (remainingSlots <= 0) {
            showToast('You can only upload up to 3 images.', 'error');
            return;
        }

        const processedFiles = filesArray.slice(0, remainingSlots);
        setSelectedFiles(prev => [...prev, ...processedFiles].slice(0, 3));
        processedFiles.forEach(readFileAsDataUrl);
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Specific validation for each field to provide better feedback
        if (!formData.name) {
            showToast('Please enter a product name', 'error');
            return;
        }
        if (!formData.sku) {
            showToast('Please enter a SKU / Product ID', 'error');
            return;
        }
        if (!formData.category) {
            showToast('Please select a category', 'error');
            return;
        }
        if (!formData.material) {
            showToast('Please select a material', 'error');
            return;
        }
        if (!formData.weight || Number.parseFloat(formData.weight) <= 0) {
            showToast('Please enter a valid weight', 'error');
            return;
        }
        if (!formData.makingCharge || Number.parseFloat(formData.makingCharge) < 0) {
            showToast('Please enter a making charge', 'error');
            return;
        }
        if (formData.wastagePercent === '' || formData.wastagePercent === undefined) {
            showToast('Please enter the wastage percentage', 'error');
            return;
        }
        if (!formData.quantity || Number.parseInt(formData.quantity) < 1) {
            showToast('Please enter a valid quantity', 'error');
            return;
        }

        if (selectedFiles.length === 0) {
            showToast('Please upload at least one product image.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // STEP 1: Upload Images
            const uploadParams = new FormData();
            selectedFiles.forEach(file => {
                uploadParams.append('images', file);
            });

            const uploadRes = await api.post('/upload', uploadParams, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const uploadedImageUrls = uploadRes.data.data; // Array of {url, fileId}

            // STEP 2: Create Product Payload matching Backend Model
            const productPayload = {
                name: formData.name,
                sku: formData.sku,
                category: formData.category,
                material: formData.material,
                weight: Number.parseFloat(formData.weight),
                makingCharge: Number.parseFloat(formData.makingCharge),
                wastagePercent: Number.parseFloat(formData.wastagePercent),
                stoneCost: Number.parseFloat(formData.stoneCost) || 0,
                initialStock: Number.parseInt(formData.quantity),
                images: uploadedImageUrls
            };

            const productRes = await api.post('/products', productPayload);
            const p = productRes.data.data;

            const qty = Number.parseInt(formData.quantity) || 0;
            const getStockStatus = (quantity: number): StockStatus => {
                if (quantity > 10) return 'In Stock';
                if (quantity > 0) return 'Low Stock';
                return 'Out of Stock';
            };

            // Map backend model to frontend Product model
            const newProduct = {
                id: p._id,
                name: p.name,
                sku: p.sku,
                category: p.category,
                material: p.material,
                weight: p.weight,
                makingCharge: p.makingCharge,
                wastagePercent: p.wastagePercent,
                stoneCost: p.stoneCost || 0,
                price: p.makingCharge,
                quantity: qty,
                status: getStockStatus(qty),
                images: p.images ? p.images.map((img: { url: string }) => img.url) : [],
                lastModified: p.updatedAt || p.createdAt || new Date().toISOString()
            };

            // Add to Context to avoid refetching
            addProduct(newProduct);
            showToast('Product added successfully!', 'success');
            navigate('/dashboard/inventory');
        } catch (error: unknown) {
            console.error("Failed to add product:", error);
            const err = error as { response?: { data?: { message?: string } } };
            showToast(err.response?.data?.message || 'Failed to upload product', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Breadcrumbs */}
            <nav className={styles.breadcrumbs}>
                <button type="button" onClick={() => navigate('/dashboard')}>Home</button>
                <span>/</span>
                <button type="button" onClick={() => navigate('/dashboard/inventory')}>Inventory</button>
                <span>/</span>
                <span className={styles.current}>Add New Item</span>
            </nav>

            {/* Page Heading */}
            <div className={styles.pageHeader}>
                <h1>Add New Jewellery Item</h1>
                <p>Enter the specifications and pricing details for the new inventory piece.</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Section 1: Basic Information */}
                <div className={styles.formSection}>
                    <h2>
                        <span className={`material-symbols-outlined ${styles.icon}`}>info</span>
                        <span>Basic Information</span>
                    </h2>
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="item-name">Product Name <span className={styles.required}>*</span></label>
                            <input
                                id="item-name"
                                ref={firstInputRef}
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Diamond Encrusted Gold Bangle"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="item-sku">SKU / Product ID <span className={styles.required}>*</span></label>
                            <input
                                id="item-sku"
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleInputChange}
                                placeholder="e.g., GLD-BNG-001"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <span className={styles.label}>Category <span className={styles.required}>*</span></span>
                            <CustomDropdown
                                options={categories}
                                value={formData.category}
                                onChange={(val) => handleDropdownChange('category', val)}
                                placeholder="Select or Add Category"
                                allowCustom={true}
                                onAddOption={addCategory}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <span className={styles.label}>Material & Purity <span className={styles.required}>*</span></span>
                            <CustomDropdown
                                options={materials}
                                value={formData.material}
                                onChange={(val) => handleDropdownChange('material', val)}
                                placeholder="Select or Add Material"
                                allowCustom={true}
                                onAddOption={addMaterial}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Specifications & Quality */}
                <div className={styles.formSection}>
                    <h2>
                        <span className={`material-symbols-outlined ${styles.icon}`}>measuring_tape</span>
                        <span>Specifications & Quality</span>
                    </h2>
                    <div className={`${styles.grid} ${styles.cols4}`}>
                        <div className={styles.formGroup}>
                            <label htmlFor="item-weight">Weight (Grams) <span className={styles.required}>*</span></label>
                            <input
                                id="item-weight"
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="item-quantity">Quantity <span className={styles.required}>*</span></label>
                            <input
                                id="item-quantity"
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                placeholder="1"
                                min="1"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="item-stone-details">Stone Details</label>
                            <input
                                id="item-stone-details"
                                type="text"
                                name="stoneDetails"
                                value={formData.stoneDetails}
                                onChange={handleInputChange}
                                placeholder="e.g., 2ct VVS Diamond"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="item-making-charge">Making Charge (₹) <span className={styles.required}>*</span></label>
                            <input
                                id="item-making-charge"
                                type="number"
                                name="makingCharge"
                                value={formData.makingCharge}
                                onChange={handleInputChange}
                                placeholder="0.00"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="item-wastage-percent">Wastage (%) <span className={styles.required}>*</span></label>
                            <input
                                id="item-wastage-percent"
                                type="number"
                                name="wastagePercent"
                                value={formData.wastagePercent}
                                onChange={handleInputChange}
                                placeholder="0"
                                step="0.01"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="item-stone-cost">Stone Cost (₹)</label>
                            <input
                                id="item-stone-cost"
                                type="number"
                                name="stoneCost"
                                value={formData.stoneCost}
                                onChange={handleInputChange}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Supplier & Commercials */}
                <div className={styles.formSection}>
                    <h2>
                        <span className={`material-symbols-outlined ${styles.icon}`}>payments</span>
                        <span>Supplier Info</span>
                    </h2>
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="item-supplier">Supplier Name</label>
                            <input
                                id="item-supplier"
                                type="text"
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleInputChange}
                                placeholder="Search or Enter Supplier"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 4: Media */}
                <div className={styles.formSection}>
                    <h2>
                        <span className={`material-symbols-outlined ${styles.icon}`}>image</span>
                        <span>Product Images (Up to 3)</span> <span className={styles.required}>*</span>
                    </h2>

                    <div className={styles.uploadArea}>
                        {imagePreviews.length === 0 ? (
                            <label>
                                <span className={`material-symbols-outlined ${styles.uploadIcon}`}>cloud_upload</span>
                                <p><strong>Click to upload</strong> or drag and drop</p>
                                <span className={styles.hint}>Upload up to 3 high resolution images</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        ) : (
                            <div className={styles.previewGrid}>
                                {imagePreviews.map((preview, index) => (
                                    <div key={preview} className={styles.imagePreview}>
                                        <img src={preview} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className={styles.removeBtn}
                                            onClick={() => removeImage(index)}
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                ))}
                                {imagePreviews.length < 3 && (
                                    <label className={styles.addMore}>
                                        <span className={`material-symbols-outlined ${styles.addIcon}`}>add_a_photo</span>
                                        <span>Add More</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.cancel}
                        onClick={() => navigate('/dashboard/inventory')}
                    >
                        Cancel
                    </button>
                    <button type="submit" className={styles.save} disabled={isSubmitting}>
                        <span className="material-symbols-outlined">save</span>
                        {isSubmitting ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddItem;
