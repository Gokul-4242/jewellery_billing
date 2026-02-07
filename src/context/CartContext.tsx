import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { BillingItem } from '../features/billing/types';
import type { Product } from '../types/Dashboard.types';
import { useRates } from './RateContext';

interface CartContextType {
    cartItems: BillingItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (id: string) => void;
    updateCartItem: (id: string, updates: Partial<BillingItem>) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<BillingItem[]>(() => {
        const stored = localStorage.getItem('cartItems');
        return stored ? JSON.parse(stored) : [];
    });
    const { rates } = useRates();

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product) => {
        // Determine rate based on product material
        const rate = product.material.includes('Gold') ? rates.gold22k : (product.material.includes('Silver') ? rates.silver : 3210);
        
        // Default making charges per gram
        const makingRate = 500; 
        const rawTotal = (product.weight * rate) + (product.weight * makingRate);

        const newItem: BillingItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: product.name,
            code: product.sku,
            weight: product.weight,
            purity: product.material.includes('22k') ? '22k' : (product.material.includes('24k') ? '24k' : '925'),
            rate: rate,
            makingCharges: 500, // per gm rate
            wastage: 0,
            discount: 0,
            total: rawTotal
        };

        setCartItems(prev => [...prev, newItem]);
    };

    const removeFromCart = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const updateCartItem = (id: string, updates: Partial<BillingItem>) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, ...updates };
                // Recalculate total: ((weight + wastage) * rate) + making charges - discount
                const weight = updatedItem.weight;
                const wastagePercent = updatedItem.wastage || 0;
                const effectiveWeight = weight + (weight * wastagePercent / 100);
                const rateTotal = effectiveWeight * updatedItem.rate;
                const makingRate = updatedItem.makingCharges || 0;
                const disc = updatedItem.discount || 0;
                updatedItem.total = rateTotal + (makingRate * weight) - disc;
                return updatedItem;
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
