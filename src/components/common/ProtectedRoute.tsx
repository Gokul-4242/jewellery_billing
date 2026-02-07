import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated) {
            showToast('Please login to access this page', 'warning');
        }
    }, [isAuthenticated, showToast]);

    if (!isAuthenticated) {
        // Redirect to login, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

// Route that redirects to dashboard if already logged in (for login page)
export const PublicRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
