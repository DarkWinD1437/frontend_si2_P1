import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import { userService } from '../services/userService';

const AuthContext = createContext();

export { AuthContext }; // Exportar el contexto también

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
        const initializeAuth = async () => {
            try {
                // Primero intentamos obtener el usuario de localStorage
                const userData = authService.getCurrentUser();
                if (userData) {
                    console.log('Usuario encontrado en localStorage:', userData);
                    setUser(userData);
                    setLoading(false);
                    return;
                }
                
                console.log('No hay usuario en localStorage');
                setUser(null);
                setLoading(false);
            } catch (error) {
                console.error('Error inicializando autenticación:', error);
                setUser(null);
                setLoading(false);
            }
        };
        
        initializeAuth();
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

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setUser(null);
        }
    };

    const register = async (userData) => {
        try {
            const newUser = await userService.register(userData);
            return newUser;
        } catch (error) {
            throw error;
        }
    };

    const updateUser = (updatedUserData) => {
        const updatedUser = { ...user, ...updatedUserData };
        setUser(updatedUser);
        // Update localStorage as well
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        login,
        logout,
        register,
        updateUser,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'Administrador',
        isResident: user?.role === 'resident' || user?.role === 'Residente',
        isSecurity: user?.role === 'security' || user?.role === 'Seguridad'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};