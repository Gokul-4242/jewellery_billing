import React, { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import type { Transaction } from '../types/Transaction';
import api from '../api/axios';
import { TransactionContext } from './useTransactions';

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

    const addTransaction = useCallback(async (transactionData: Transaction) => {
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
    }, []);

    const addLocalTransaction = useCallback((transaction: Transaction) => {
        setTransactions(prev => [transaction, ...prev]);
    }, []);

    const getTransactionById = useCallback(async (id: string) => {
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
    }, [transactions]);

    const updateTransaction = useCallback(async (updatedTransaction: Transaction) => {
        try {
            const res = await api.put(`/transactions/${updatedTransaction.id || updatedTransaction._id}`, updatedTransaction);
            if (res.data?.success) {
                setTransactions(prev => prev.map(t => (t.id === updatedTransaction.id || t._id === updatedTransaction._id) ? { ...res.data.data, id: res.data.data._id } : t));
            }
        } catch (error) {
            console.error("Failed to update transaction", error);
            throw error;
        }
    }, []);

    const getTransactionsByDate = useCallback((date: Date) => {
        const dateString = date.toLocaleDateString();
        return transactions.filter(t => new Date(t.date).toLocaleDateString() === dateString);
    }, [transactions]);

    const getTodayStats = useCallback(() => {
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
    }, [transactions]);

    const contextValue = useMemo(() => ({
        transactions,
        isLoading,
        addTransaction,
        addLocalTransaction,
        updateTransaction,
        getTransactionById,
        getTransactionsByDate,
        getTodayStats
    }), [transactions, isLoading, addTransaction, addLocalTransaction, updateTransaction, getTransactionById, getTransactionsByDate, getTodayStats]);

    return (
        <TransactionContext.Provider value={contextValue}>
            {children}
        </TransactionContext.Provider>
    );
};

export default TransactionProvider;
