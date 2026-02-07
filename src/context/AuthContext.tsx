import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    username: string;
    role: 'admin' | 'staff';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    // Initialize from localStorage to check if we have a session
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });

    const navigate = useNavigate();

    useEffect(() => {
        // Sync state if needed on mount, mostly useful if we had a real token
        const storedAuth = localStorage.getItem('isAuthenticated');
        if (storedAuth === 'true' && !user) {
             // Rehydrate user (mock)
             setUser({ id: '1', username: 'Admin', role: 'admin' });
        }
    }, []);

    const login = (username: string) => {
        const mockUser: User = { id: '1', username, role: 'admin' };
        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        // Navigate to dashboard after login logic is usually handled by the component, 
        // but updating state here is key.
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
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
