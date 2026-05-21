import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Transaction } from '../types/Transaction';
import api from '../api/axios';

interface TransactionContextType {
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

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get('/transactions');
                if (res.data?.success) {
                    setTransactions(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const addTransaction = async (transactionData: Transaction) => {
        try {
            const res = await api.post('/transactions', transactionData);
            if (res.data?.success) {
                const newTransaction = { ...res.data.data, id: res.data.data._id };
                setTransactions(prev => [newTransaction, ...prev]);
                return newTransaction;
            }
        } catch (error) {
            console.error("Failed to add transaction", error);
            throw error;
        }
    };

    const addLocalTransaction = (transaction: Transaction) => {
        setTransactions(prev => [transaction, ...prev]);
    };



    const getTransactionById = async (id: string) => {
        // Check local state first
        const local = transactions.find(t => t.id === id || t._id === id);
        if (local) return local;

        try {
            const res = await api.get(`/transactions/${id}`);
            if (res.data?.success) {
                const fetched = { ...res.data.data, id: res.data.data._id };
                return fetched;
            }
        } catch (error) {
            console.error("Failed to fetch transaction", error);
        }
        return undefined;
    };

    const updateTransaction = async (updatedTransaction: Transaction) => {
        try {
            const res = await api.put(`/transactions/${updatedTransaction.id || updatedTransaction._id}`, updatedTransaction);
            if (res.data?.success) {
                setTransactions(prev => prev.map(t => (t.id === updatedTransaction.id || t._id === updatedTransaction._id) ? { ...res.data.data, id: res.data.data._id } : t));
            }
        } catch (error) {
            console.error("Failed to update transaction", error);
            throw error;
        }
    };



    const getTransactionsByDate = (date: Date) => {
        const dateString = date.toLocaleDateString();
        return transactions.filter(t => new Date(t.date).toLocaleDateString() === dateString);
    };

    const getTodayStats = () => {
        const today = new Date().toLocaleDateString();
        const todaysTransactions = transactions.filter(t => new Date(t.date).toLocaleDateString() === today);

        const totalSales = todaysTransactions.reduce((acc, t) => acc + t.grandTotal, 0);
        const totalExchange = todaysTransactions.reduce((acc, t) => acc + t.exchangeTotal, 0);
        
        let goldWeight = 0;
        let silverWeight = 0;

        todaysTransactions.forEach(t => {
            t.items.forEach(item => {
                if (item.name.toLowerCase().includes('gold') || item.purity.includes('22k') || item.purity.includes('24k') || item.purity.includes('18k')) {
                    goldWeight += item.weight;
                } else if (item.name.toLowerCase().includes('silver') || item.purity.includes('925')) {
                    silverWeight += item.weight;
                }
            });
        });

        return {
            totalSales,
            totalWeightNodes: { gold: goldWeight, silver: silverWeight },
            totalExchange,
            transactionCount: todaysTransactions.length,
            paymentBreakdown: {
                Cash: todaysTransactions.filter(t => t.paymentMethod === 'Cash').reduce((acc, t) => acc + t.grandTotal, 0),
                Card: todaysTransactions.filter(t => t.paymentMethod === 'Card').reduce((acc, t) => acc + t.grandTotal, 0),
                UPI: todaysTransactions.filter(t => t.paymentMethod === 'UPI').reduce((acc, t) => acc + t.grandTotal, 0)
            }
        };
    };

    return (
        <TransactionContext.Provider value={{ transactions, isLoading, addTransaction, addLocalTransaction, updateTransaction, getTransactionsByDate, getTodayStats }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
};
