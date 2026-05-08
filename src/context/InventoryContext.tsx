import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../types/Dashboard.types';
import api from '../api/axios';

interface InventoryContextType {
    products: Product[];
    categories: string[];
    materials: string[];
    addProduct: (product: Product) => void;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    getProductById: (id: string) => Product | undefined;
    addCategory: (name: string) => void;
    addMaterial: (name: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);

    const [categories, setCategories] = useState<string[]>(() => {
        const stored = localStorage.getItem('inventory_categories');
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { console.error(e); }
        }
        return ['Ring', 'Necklace', 'Pendant', 'Earrings', 'Bracelet', 'Bangle'];
    });

    const [materials, setMaterials] = useState<string[]>(() => {
        const stored = localStorage.getItem('inventory_materials');
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { console.error(e); }
        }
        return ['22k Gold', '24k Gold', '18k Gold', '925 Silver', 'Platinum', 'Rose Gold'];
    });

    useEffect(() => {
        const fetchInventory = async () => {
             try {
                 const res = await api.get('/products?limit=500');
                 if (res.data?.data) {
                      const dbProducts = res.data.data.map((p: any) => ({
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
                          quantity: p.stock || 0,
                          status: p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock',
                          images: p.images ? p.images.map((img: any) => img.url) : [],
                          lastModified: p.updatedAt || p.createdAt
                      }));
                      setProducts(dbProducts);
                 }
             } catch (err) {
                 console.error('Failed to fetch initial inventory:', err);
             }
        };
        fetchInventory();
    }, []);

    useEffect(() => {
        localStorage.setItem('inventory_categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('inventory_materials', JSON.stringify(materials));
    }, [materials]);

    const addProduct = (product: Product) => {
        setProducts(prev => [product, ...prev]);
        if (!categories.includes(product.category)) {
            addCategory(product.category);
        }
        if (!materials.includes(product.material)) {
            addMaterial(product.material);
        }
    };

    const addCategory = (name: string) => {
        if (!name) return;
        setCategories(prev => {
            if (prev.includes(name)) return prev;
            return [...prev, name].sort();
        });
    };

    const addMaterial = (name: string) => {
        if (!name) return;
        setMaterials(prev => {
            if (prev.includes(name)) return prev;
            return [...prev, name].sort();
        });
    };

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        try {
            // Mapping frontend model to backend model
            const backendUpdates: any = { ...updates };
            // Manual field mappings if names differ between frontend/backend
            if (updates.price !== undefined) backendUpdates.makingCharge = updates.price;
            if (updates.makingCharge !== undefined) backendUpdates.makingCharge = updates.makingCharge;
            
            // Note: If quantity is changing, we still use the stock API for atomic increment
            const { quantity, id: _, status, ...fields } = backendUpdates;
            
            if (Object.keys(fields).length > 0) {
                await api.put(`/products/${id}`, fields);
            }

            if (quantity !== undefined) {
                const product = getProductById(id);
                if (product) {
                    const change = quantity - product.quantity;
                    if (change !== 0) {
                        await api.put(`/products/${id}/stock`, { 
                            change, 
                            reason: 'Manual Adjustment via Admin Panel' 
                        });
                    }
                }
            }

            setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        } catch (err) {
            console.error('Failed to update product:', err);
            throw err;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            await api.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Failed to delete product:', err);
            throw err;
        }
    };

    const getProductById = (id: string) => products.find(p => p.id === id);

    return (
        <InventoryContext.Provider value={{
            products,
            categories,
            materials,
            addProduct,
            updateProduct,
            deleteProduct,
            getProductById,
            addCategory,
            addMaterial
        }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventory must be used within a InventoryProvider');
    }
    return context;
};
