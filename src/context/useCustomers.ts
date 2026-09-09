import { useCallback, useMemo } from 'react';
import type { Customer } from '../types/Customer';
import {
  useGetCustomersQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from '../store/api/customerApi';

export interface CustomerContextType {
  customers: Customer[];
  isLoading: boolean;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
}

export const useCustomers = (): CustomerContextType => {
  const { data: customers = [], isLoading } = useGetCustomersQuery();
  const [addCustomerMutation] = useAddCustomerMutation();
  const [updateCustomerMutation] = useUpdateCustomerMutation();
  const [deleteCustomerMutation] = useDeleteCustomerMutation();

  const addCustomer = useCallback(
    async (customerData: Omit<Customer, 'id'>) => {
      await addCustomerMutation(customerData).unwrap();
    },
    [addCustomerMutation]
  );

  const updateCustomer = useCallback(
    async (customer: Customer) => {
      await updateCustomerMutation(customer).unwrap();
    },
    [updateCustomerMutation]
  );

  const deleteCustomer = useCallback(
    async (id: string) => {
      await deleteCustomerMutation(id).unwrap();
    },
    [deleteCustomerMutation]
  );

  const getCustomerById = useCallback(
    (id: string) => {
      return customers.find((c) => c.id === id);
    },
    [customers]
  );

  return useMemo(
    () => ({
      customers,
      isLoading,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getCustomerById,
    }),
    [customers, isLoading, addCustomer, updateCustomer, deleteCustomer, getCustomerById]
  );
};
