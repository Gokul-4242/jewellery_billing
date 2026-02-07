import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Transaction } from '../types/Transaction';

interface TransactionContextType {
    transactions: Transaction[];
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (transaction: Transaction) => void;
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

// Mock initial data for demonstration if empty
const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 'tx_1',
        invoiceNo: 'INV-2023-001',
        date: new Date().toISOString(),
        customerName: 'John Smith',
        items: [
            { id: '1', name: 'Gold Ring', code: 'GR001', weight: 8, purity: '22k', rate: 6500, makingCharges: 500, total: 52500 }
        ],
        subtotal: 52000,
        gst: 1560,
        discount: 0,
        exchangeTotal: 0,
        grandTotal: 53560,
        paymentMethod: 'UPI',
        status: 'Completed'
    },
    // Add more mocks if needed for "wired" feel immediately
];

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const stored = localStorage.getItem('transactions');
        return stored ? JSON.parse(stored) : MOCK_TRANSACTIONS;
    });

    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }, [transactions]);

    const addTransaction = (transaction: Transaction) => {
        setTransactions(prev => [transaction, ...prev]);
    };

    const updateTransaction = (updatedTransaction: Transaction) => {
        setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
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
        <TransactionContext.Provider value={{ transactions, addTransaction, updateTransaction, getTransactionsByDate, getTodayStats }}>
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
