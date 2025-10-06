import React, { createContext, useState, useContext, useEffect } from 'react';
import { isAuthenticated, getProfile, login as loginUser, register as registerUser, logout as logoutUser } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            if (isAuthenticated()) {
                const result = await getProfile();
                if (result.success) {
                    setUser(result.user);
                } else {
                    setUser(null);
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const result = await loginUser(email, password);
            
            if (result.success) {
                setUser(result.user);
                return { success: true };
            } else {
                setError(result.message);
                return { success: false, message: result.message };
            }
        } catch (error) {
            setError('Login failed');
            return { success: false, message: 'Login failed' };
        }
    };

    const register = async (name, email, phone, password) => {
        try {
            setError(null);
            const result = await registerUser(name, email, phone, password);
            
            if (result.success) {
                setUser(result.user);
                return { success: true };
            } else {
                setError(result.message);
                return { success: false, message: result.message };
            }
        } catch (error) {
            setError('Registration failed');
            return { success: false, message: 'Registration failed' };
        }
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};