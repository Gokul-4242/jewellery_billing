import { createContext, useContext } from 'react';
import type { Transaction } from '../types/Transaction';

export interface TransactionContextType {
    transactions: Transaction[];
    isLoading: boolean;
    addTransaction: (transaction: Transaction) => Promise<Transaction | undefined>;
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

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
};
