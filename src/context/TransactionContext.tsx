import React, { type ReactNode } from 'react';
import { useTransactions, type TransactionContextType } from './useTransactions';

export { useTransactions, type TransactionContextType };

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default TransactionProvider;
