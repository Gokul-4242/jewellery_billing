import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { INITIAL_CUSTOMERS } from '../data/mockData';
import type { Customer } from '../types/Customer';
export type { Customer }; // Re-export for convenience if needed, but components should probably import from types directly.

interface CustomerContextType {
    customers: Customer[];
    addCustomer: (customer: Customer) => void;
    updateCustomer: (customer: Customer) => void;
    deleteCustomer: (id: string) => void;
    getCustomerById: (id: string) => Customer | undefined;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>(() => {
        // Initialize from localStorage or fallback to mock data
        const stored = localStorage.getItem('customers');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse customers from local storage", e);
                return INITIAL_CUSTOMERS;
            }
        }
        return INITIAL_CUSTOMERS;
    });

    // Persist to localStorage whenever customers change
    useEffect(() => {
        localStorage.setItem('customers', JSON.stringify(customers));
    }, [customers]);

    const addCustomer = (customer: Customer) => {
        setCustomers((prev) => [customer, ...prev]);
    };

    const updateCustomer = (updatedCustomer: Customer) => {
        setCustomers((prev) => 
            prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
        );
    };

    const deleteCustomer = (id: string) => {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
    };

    const getCustomerById = (id: string) => {
        return customers.find(c => c.id === id);
    };

    return (
        <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, getCustomerById }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomers = (): CustomerContextType => {
    const context = useContext(CustomerContext);
    if (!context) {
        throw new Error('useCustomers must be used within a CustomerProvider');
    }
    return context;
};
