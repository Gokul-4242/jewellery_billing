import { createContext, useContext } from 'react';
import type { Customer } from '../types/Customer';

export interface CustomerContextType {
    customers: Customer[];
    isLoading: boolean;
    addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
    updateCustomer: (customer: Customer) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;
    getCustomerById: (id: string) => Customer | undefined;
}

export const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const useCustomers = (): CustomerContextType => {
    const context = useContext(CustomerContext);
    if (!context) {
        throw new Error('useCustomers must be used within a CustomerProvider');
    }
    return context;
};
