import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../types/Dashboard.types';
import { MOCK_PRODUCTS } from '../data/mockData';

interface InventoryContextType {
    products: Product[];
    categories: string[];
    materials: string[];
    addProduct: (product: Product) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    getProductById: (id: string) => Product | undefined;
    addCategory: (name: string) => void;
    addMaterial: (name: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>(() => {
        const stored = localStorage.getItem('inventory');
        const initialProducts = stored ? JSON.parse(stored) : MOCK_PRODUCTS;

        // Data Migration: Ensure all products have required fields and arrays
        return initialProducts.map((p: any) => {
            const migrated = { ...p };
            if (!migrated.images && migrated.image) {
                migrated.images = [migrated.image];
            }
            if (!migrated.images || !Array.isArray(migrated.images)) {
                migrated.images = ['https://via.placeholder.com/150'];
            }
            if (!migrated.category) migrated.category = 'Uncategorized';
            if (!migrated.material) migrated.material = 'Unknown';
            if (!migrated.name) migrated.name = 'Unnamed Product';
            if (!migrated.sku) migrated.sku = 'NO-SKU';
            if (migrated.quantity === undefined) migrated.quantity = 1;
            return migrated;
        });
    });

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
        try {
            localStorage.setItem('inventory', JSON.stringify(products));
        } catch (e) {
            console.error('Failed to save inventory to localStorage', e);
        }
    }, [products]);

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

    const updateProduct = (id: string, updates: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
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
