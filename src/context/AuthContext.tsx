import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface User {
    id: string;
    username: string;
    role: 'admin' | 'staff';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        return localStorage.getItem('adminToken') 
            ? { id: 'admin', username: 'Super Admin', role: 'admin' }
            : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!localStorage.getItem('adminToken');
    });

    const navigate = useNavigate();

    const login = async (email: string, password?: string) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            
            if (res.data && res.data.token) {
                localStorage.setItem('adminToken', res.data.token);
                setUser({ id: 'admin', username: email, role: 'admin' });
                setIsAuthenticated(true);
            } else {
                throw new Error('Invalid authentication payload returned');
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            throw new Error(error.response?.data?.message || 'Login failed due to server error');
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
