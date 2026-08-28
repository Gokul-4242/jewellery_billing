import React from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/common/ProtectedRoute';
import AdminLogin from './features/auth/AdminLogin';
import Signup from './features/auth/Signup';
import type { LoginFormData } from './features/auth/AdminLogin.types';
import type { SignupFormData } from './features/auth/Signup.types';
import ForgotPassword from './features/auth/ForgotPassword';
import type { ForgotPasswordFormData } from './features/auth/ForgotPassword.types';
import Dashboard from './features/dashboard/Dashboard';
import DashboardHome from './features/dashboard/DashboardHome';
import InventoryTable from './features/inventory/InventoryTable';
import CostEstimator from './features/tools/CostEstimator';
import ExchangeCalculator from './features/tools/ExchangeCalculator';
import AddItem from './features/inventory/AddItem';
import ItemDetail from './features/inventory/ItemDetail';
import CustomerManagement from './features/customers/CustomerManagement';
import CustomerDetail from './features/customers/CustomerDetail';
import AddCustomer from './features/customers/AddCustomer';
import Billing from './features/billing/Billing';
import InvoiceViewer from './features/billing/InvoiceViewer';
import OrderManagement from './features/orders/OrderManagement';
import CreateOrder from './features/orders/CreateOrder';
import OrderDetail from './features/orders/OrderDetail';
import OrderConfirmation from './features/orders/OrderConfirmation';
import DailySummary from './features/reports/DailySummary';
import Settings from './features/settings/Settings';
import CustomerProvider from './context/CustomerContext';
import { useCustomers } from './context/useCustomers';

import TransactionProvider from './context/TransactionContext';
import { InventoryProvider } from './context/InventoryContext';
import { RateProvider } from './context/RateContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <div className="App">
        <RateProvider>
            <CartProvider>
                <SettingsProvider>
                    <CustomerProvider>
                        <TransactionProvider>
                            <InventoryProvider>
                                <AppContent />
                            </InventoryProvider>
                        </TransactionProvider>
                    </CustomerProvider>
                </SettingsProvider>
            </CartProvider>
        </RateProvider>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();


  const handleLogin = (formData: LoginFormData) => {
    console.log('Login submitted:', formData);
    navigate('/dashboard');
  };

  const handleSignup = (formData: SignupFormData) => {
    console.log('Signup submitted:', formData);
    navigate('/login');
  };

  const handleForgotPassword = (formData: ForgotPasswordFormData) => {
    console.log('Forgot password request:', formData);
  };

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<AdminLogin onSubmit={handleLogin} />} />
        <Route path="/signup" element={<Signup onSubmit={handleSignup} />} />
        <Route path="/forgot-password" element={<ForgotPassword onSubmit={handleForgotPassword} />} />
      </Route>
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="inventory" element={<InventoryTable />} />
            <Route path="inventory/add" element={<AddItem />} />
            <Route path="inventory/:id" element={<ItemDetail />} />
            
            {/* Customer Routes */}
            <Route path="customers" element={<CustomerManagement 
                onSelectCustomer={(c) => navigate(`/dashboard/customers/${c.id}`)}
                onEditCustomer={(c) => navigate(`/dashboard/customers/edit/${c.id}`)}
                onAddCustomer={() => {
                    console.log('Navigating to Add Customer');
                    navigate('/dashboard/customers/add');
                }}
            />} />
            <Route path="customers/add" element={<AddCustomerWrapper />} />
            <Route path="customers/edit/:id" element={<EditCustomerWrapper />} />
            <Route path="customers/:id" element={<CustomerDetailWrapper />} />

            {/* Tools Routes */}
            <Route path="estimator" element={<CostEstimatorWrapper />} />
            <Route path="exchange" element={<ExchangeCalculatorWrapper />} />
            <Route path="billing" element={<Billing />} />
            <Route path="invoice/view/:id" element={<InvoiceViewer />} />

            {/* Orders Route */}
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/new" element={<CreateOrder />} />
            <Route path="orders/edit/:id" element={<CreateOrder />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="orders/confirmation/:id" element={<OrderConfirmation />} />
            
            {/* Placeholders */}
            {/* Reports Route */}
            <Route path="reports" element={<DailySummary />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<div>Help Center (Coming Soon)</div>} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// Wrapper components
const CustomerDetailWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getCustomerById } = useCustomers();
    const customer = id ? getCustomerById(id) : undefined;
    
    if (!customer) return <div>Customer not found</div>;

    return (
        <CustomerDetail 
            customer={customer} 
            onBack={() => navigate('/dashboard/customers')} 
            onEdit={() => navigate(`/dashboard/customers/edit/${customer.id}`)} 
        />
    );
};

const AddCustomerWrapper = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addCustomer } = useCustomers();
    const fromBilling = location.state?.fromBilling;

    return (
        <AddCustomer 
            onBack={() => navigate(fromBilling ? '/dashboard/billing' : '/dashboard/customers')} 
            onSave={(newCustomer) => {
                 addCustomer(newCustomer);
                 if (fromBilling) {
                    navigate('/dashboard/billing', { state: { newCustomerId: newCustomer.id } });
                 } else {
                    navigate('/dashboard/customers');
                 }
            }} 
        />
    );
};

const EditCustomerWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { getCustomerById, updateCustomer } = useCustomers();
    const customer = id ? getCustomerById(id) : undefined;
    const fromBilling = location.state?.fromBilling;

    if (!customer) return <div>Customer not found</div>;
    
    return (
        <AddCustomer 
            initialData={customer}
            onBack={() => navigate(fromBilling ? '/dashboard/billing' : '/dashboard/customers')} 
            onSave={(updatedData) => {
                 updateCustomer(updatedData);
                 if (fromBilling) {
                    navigate('/dashboard/billing', { state: { newCustomerId: updatedData.id } });
                 } else {
                    navigate('/dashboard/customers');
                 }
            }} 
        />
    );
};

const CostEstimatorWrapper = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [exchangeValue, setExchangeValue] = React.useState(location.state?.exchangeValue || 0);

    return (
        <CostEstimator 
            exchangeValue={exchangeValue}
            onExchangeValueChange={setExchangeValue}
            onOpenExchangeCalculator={() => navigate('/dashboard/exchange')}
        />
    );
};

const ExchangeCalculatorWrapper = () => {
    const navigate = useNavigate();
    return (
        <ExchangeCalculator 
            onBack={() => navigate('/dashboard/estimator')}
            onAddToInvoice={(value) => navigate('/dashboard/estimator', { state: { exchangeValue: value } })}
        />
    );
};

export default App;
