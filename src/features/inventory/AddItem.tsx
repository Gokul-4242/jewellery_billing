import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddItem.module.scss';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';
import { CustomDropdown } from '../../components/common';
import type { Product, StockStatus } from '../../types/Dashboard.types';

const AddItem: React.FC = () => {
    const navigate = useNavigate();
    const { addProduct, categories, materials, addCategory, addMaterial } = useInventory();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        material: '',
        weight: '',
        price: '',
        stoneDetails: '',
        supplier: ''
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const filesArray = Array.from(files);
            
            // Limit to 3 images total
            const remainingSlots = 3 - imagePreviews.length;
            if (remainingSlots <= 0) {
                showToast('You can only upload up to 3 images.', 'error');
                return;
            }

            const processedFiles = filesArray.slice(0, remainingSlots);

            processedFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result) {
                        setImagePreviews(prev => [...prev, reader.result as string].slice(0, 3));
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name || !formData.sku || !formData.category || !formData.material || !formData.weight || !formData.price) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        if (imagePreviews.length === 0) {
            showToast('Please upload at least one product image.', 'error');
            return;
        }

        const newProduct: Product = {
            id: crypto.randomUUID(),
            name: formData.name,
            sku: formData.sku,
            category: formData.category,
            material: formData.material,
            weight: parseFloat(formData.weight),
            price: parseFloat(formData.price),
            status: 'In Stock' as StockStatus,
            images: imagePreviews,
            lastModified: new Date().toISOString()
        };

        addProduct(newProduct);
        showToast('Product added successfully!', 'success');
        navigate('/dashboard/inventory');
    };

    return (
        <div className={styles.container}>
            {/* Breadcrumbs */}
            <nav className={styles.breadcrumbs}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>Home</a>
                <span>/</span>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard/inventory'); }}>Inventory</a>
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
                        Basic Information
                    </h2>
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label>Product Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleInputChange} 
                                placeholder="e.g., Diamond Encrusted Gold Bangle" 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>SKU / Product ID</label>
                            <input 
                                type="text" 
                                name="sku" 
                                value={formData.sku} 
                                onChange={handleInputChange} 
                                placeholder="e.g., GLD-BNG-001" 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Category</label>
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
                            <label>Material & Purity</label>
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
                        Specifications & Quality
                    </h2>
                    <div className={`${styles.grid} ${styles.cols3}`}>
                        <div className={styles.formGroup}>
                            <label>Weight (Grams)</label>
                            <input 
                                type="number" 
                                name="weight" 
                                value={formData.weight} 
                                onChange={handleInputChange} 
                                placeholder="0.00" 
                                step="0.01" 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Stone Details</label>
                            <input 
                                type="text" 
                                name="stoneDetails" 
                                value={formData.stoneDetails} 
                                onChange={handleInputChange} 
                                placeholder="e.g., 2ct VVS Diamond" 
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Price (₹)</label>
                            <input 
                                type="number" 
                                name="price" 
                                value={formData.price} 
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
                        Supplier Info
                    </h2>
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label>Supplier Name</label>
                            <input 
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
                        Product Images (Up to 3)
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
                                    <div key={index} className={styles.imagePreview}>
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
                    <button type="submit" className={styles.save}>
                        <span className="material-symbols-outlined">save</span>
                        Save Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddItem;
