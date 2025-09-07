import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = authService.getCurrentUser();
        setUser(userData);
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const userData = await authService.login(username, password);
            setUser(userData);
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isResident: user?.role === 'resident'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};