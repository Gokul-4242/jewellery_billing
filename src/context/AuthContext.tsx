import React, { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout as logoutAction, type User } from '../store/slices/authSlice';
import { useLoginMutation } from '../store/api/authApi';

export type { User };

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password?: string) => Promise<void>;
    logout: () => void;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <>{children}</>;
};

export const useAuth = (): AuthContextType => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [loginMutation] = useLoginMutation();

    const login = async (email: string, password?: string) => {
        try {
            const res = await loginMutation({ email, password }).unwrap();
            const token = res.token || res.data?.token;
            if (!token) {
                throw new Error('Invalid authentication payload returned');
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            throw new Error(error.data?.message || error.message || 'Login failed due to server error');
        }
    };

    const logout = () => {
        dispatch(logoutAction());
        navigate('/login');
    };

    return { user, isAuthenticated, login, logout };
};
