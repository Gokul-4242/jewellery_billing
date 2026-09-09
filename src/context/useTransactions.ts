import { useCallback, useMemo } from 'react';
import type { Transaction } from '../types/Transaction';
import {
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useCreateCustomOrderMutation,
  useCreateInvoiceMutation,
  useUpdateTransactionMutation,
} from '../store/api/transactionApi';

export interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (transaction: Transaction) => Promise<Transaction | undefined>;
  createCustomOrder: (order: Transaction) => Promise<Transaction | undefined>;
  createInvoice: (invoicePayload: any) => Promise<any>;
  addLocalTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  getTransactionById: (id: string) => Promise<Transaction | undefined>;
  getTransactionsByDate: (date: Date) => Transaction[];
  getTodayStats: () => {
    totalSales: number;
    totalWeightNodes: { gold: number; silver: number };
    totalExchange: number;
    transactionCount: number;
    paymentBreakdown: { Cash: number; Card: number; UPI: number };
  };
}

export const useTransactions = (): TransactionContextType => {
  const { data: transactions = [], isLoading } = useGetTransactionsQuery();
  const [addTransactionMutation] = useAddTransactionMutation();
  const [createCustomOrderMutation] = useCreateCustomOrderMutation();
  const [createInvoiceMutation] = useCreateInvoiceMutation();
  const [updateTransactionMutation] = useUpdateTransactionMutation();

  const addTransaction = useCallback(
    async (transactionData: Transaction) => {
      try {
        const res = await addTransactionMutation(transactionData).unwrap();
        return res;
      } catch (error) {
        console.error('Failed to add transaction', error);
        throw error;
      }
    },
    [addTransactionMutation]
  );

  const createCustomOrder = useCallback(
    async (orderData: Transaction) => {
      try {
        const res = await createCustomOrderMutation(orderData).unwrap();
        return res;
      } catch (error) {
        console.error('Failed to create custom order', error);
        throw error;
      }
    },
    [createCustomOrderMutation]
  );

  const createInvoice = useCallback(
    async (invoicePayload: any) => {
      try {
        const res = await createInvoiceMutation(invoicePayload).unwrap();
        return res;
      } catch (error) {
        console.error('Failed to create invoice', error);
        throw error;
      }
    },
    [createInvoiceMutation]
  );

  const addLocalTransaction = useCallback((_transaction: Transaction) => {
    // RTK Query auto-syncs via tag invalidation & updateQueryData
  }, []);

  const getTransactionById = useCallback(
    async (id: string) => {
      const local = transactions.find((t) => t.id === id || t._id === id);
      if (local) return local;
      return undefined;
    },
    [transactions]
  );

  const updateTransaction = useCallback(
    async (updatedTransaction: Transaction) => {
      try {
        await updateTransactionMutation(updatedTransaction).unwrap();
      } catch (error) {
        console.error('Failed to update transaction', error);
        throw error;
      }
    },
    [updateTransactionMutation]
  );

  const getTransactionsByDate = useCallback(
    (date: Date) => {
      const dateString = date.toLocaleDateString();
      return transactions.filter(
        (t) => new Date(t.date).toLocaleDateString() === dateString
      );
    },
    [transactions]
  );

  const getTodayStats = useCallback(() => {
    const today = new Date().toLocaleDateString();
    const todaysTransactions = transactions.filter(
      (t) => new Date(t.date).toLocaleDateString() === today
    );

    const totalSales = todaysTransactions.reduce(
      (acc, t) => acc + (t.grandTotal || 0),
      0
    );
    const totalExchange = todaysTransactions.reduce(
      (acc, t) => acc + (t.exchangeTotal || 0),
      0
    );

    let goldWeight = 0;
    let silverWeight = 0;

    todaysTransactions.forEach((t) => {
      if (Array.isArray(t.items)) {
        t.items.forEach((item) => {
          const nameLower = (item.name || '').toLowerCase();
          const purity = (item.purity || '').toLowerCase();
          if (
            nameLower.includes('gold') ||
            purity.includes('22k') ||
            purity.includes('24k') ||
            purity.includes('18k')
          ) {
            goldWeight += item.weight || 0;
          } else if (nameLower.includes('silver') || purity.includes('925')) {
            silverWeight += item.weight || 0;
          }
        });
      }
    });

    return {
      totalSales,
      totalWeightNodes: { gold: goldWeight, silver: silverWeight },
      totalExchange,
      transactionCount: todaysTransactions.length,
      paymentBreakdown: {
        Cash: todaysTransactions
          .filter((t) => t.paymentMethod === 'Cash')
          .reduce((acc, t) => acc + (t.grandTotal || 0), 0),
        Card: todaysTransactions
          .filter((t) => t.paymentMethod === 'Card')
          .reduce((acc, t) => acc + (t.grandTotal || 0), 0),
        UPI: todaysTransactions
          .filter((t) => t.paymentMethod === 'UPI')
          .reduce((acc, t) => acc + (t.grandTotal || 0), 0),
      },
    };
  }, [transactions]);

  return useMemo(
    () => ({
      transactions,
      isLoading,
      addTransaction,
      createCustomOrder,
      createInvoice,
      addLocalTransaction,
      updateTransaction,
      getTransactionById,
      getTransactionsByDate,
      getTodayStats,
    }),
    [
      transactions,
      isLoading,
      addTransaction,
      createCustomOrder,
      createInvoice,
      addLocalTransaction,
      updateTransaction,
      getTransactionById,
      getTransactionsByDate,
      getTodayStats,
    ]
  );
};
