import React, { createContext, useContext, useState, useEffect } from 'react';

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
        // Simulamos la inicialización sin llamadas al backend
        setTimeout(() => {
            console.log('AuthContext inicializado en modo de prueba');
            setLoading(false);
        }, 100);
    }, []);

    const login = async (username, password) => {
        // Mock login para pruebas
        const mockUser = {
            id: 1,
            username: username,
            role: 'admin',
            email: 'test@example.com'
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-token');
        return mockUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        getCurrentUser: () => user,
        hasRole: (role) => user?.role === role,
        hasAnyRole: (roles) => user && roles.includes(user.role)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};