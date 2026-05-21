import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';
import type { Customer } from '../types/Customer';
export type { Customer }; // Re-export for convenience if needed, but components should probably import from types directly.

interface CustomerContextType {
    customers: Customer[];
    isLoading: boolean;
    addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
    updateCustomer: (customer: Customer) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;
    getCustomerById: (id: string) => Customer | undefined;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await api.get('/customers');
                if (res.data?.success) {
                    // Map backend _id to frontend id for compatibility
                    const mapped = res.data.data.map((c: any) => ({
                        ...c,
                        id: c._id || c.id
                    }));
                    setCustomers(mapped);
                }
            } catch (error) {
                console.error("Failed to fetch customers", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
        try {
            const res = await api.post('/customers', customerData);
            if (res.data?.success) {
                const newCustomer = { ...res.data.data, id: res.data.data._id };
                setCustomers(prev => [newCustomer, ...prev]);
            }
        } catch (error) {
            console.error("Failed to add customer", error);
            throw error;
        }
    };

    const updateCustomer = async (updatedCustomer: Customer) => {
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
