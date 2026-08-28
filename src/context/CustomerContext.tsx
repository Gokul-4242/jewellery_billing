import React, { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import api from '../api/axios';
import type { Customer } from '../types/Customer';
import { CustomerContext } from './useCustomers';

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await api.get('/customers');
                if (res.data?.success) {
                    // Map backend _id to frontend id for compatibility
                    const mapped = res.data.data.map((c: Omit<Customer, 'id'> & { _id?: string; id?: string }) => ({
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

    const addCustomer = useCallback(async (customerData: Omit<Customer, 'id'>) => {
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
    }, []);

    const updateCustomer = useCallback(async (updatedCustomer: Customer) => {
        setCustomers((prev) => 
            prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
        );
    }, []);

    const deleteCustomer = useCallback(async (id: string) => {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
    }, []);

    const getCustomerById = useCallback((id: string) => {
        return customers.find(c => c.id === id);
    }, [customers]);

    const contextValue = useMemo(() => ({
        customers,
        isLoading,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById
    }), [customers, isLoading, addCustomer, updateCustomer, deleteCustomer, getCustomerById]);

    return (
        <CustomerContext.Provider value={contextValue}>
            {children}
        </CustomerContext.Provider>
    );
};

export default CustomerProvider;
