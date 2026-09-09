import React, { type ReactNode } from 'react';
import { useCustomers, type CustomerContextType } from './useCustomers';

export { useCustomers, type CustomerContextType };

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default CustomerProvider;
