import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import { userService } from '../services/userService';
import aiService from '../services/aiService';

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
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [presenceCheckInterval, setPresenceCheckInterval] = useState(null);

    // Configurar temporizador de inactividad (30 minutos)
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos en ms
    const PRESENCE_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos en ms

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Primero intentamos obtener el usuario de sessionStorage
                const userData = authService.getCurrentUser();
                if (userData) {
                    console.log('Usuario encontrado en sessionStorage:', userData);
                    setUser(userData);
                    
                    // Si fue login facial, iniciar verificación de presencia
                    if (userData.loginMethod === 'facial') {
                        startPresenceMonitoring();
                    }
                    
                    setLoading(false);
                    return;
                }
                
                console.log('No hay usuario en sessionStorage');
                setUser(null);
                setLoading(false);
            } catch (error) {
                console.error('Error inicializando autenticación:', error);
                setUser(null);
                setLoading(false);
            }
        };
        
        initializeAuth();
    }, []); // Solo ejecutar una vez al montar

    // Efecto separado para configurar listeners de actividad e inactividad
    useEffect(() => {
        if (!user) return; // No configurar si no hay usuario

        // Configurar listener de actividad del usuario
        const handleUserActivity = () => {
            setLastActivity(Date.now());
        };

        // Eventos que indican actividad del usuario
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, handleUserActivity, true);
        });

        // Temporizador de inactividad
        const inactivityTimer = setInterval(() => {
            const now = Date.now();
            if (user && (now - lastActivity) > INACTIVITY_TIMEOUT) {
                console.log('Sesión expirada por inactividad');
                logout();
            }
        }, 60000); // Verificar cada minuto

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleUserActivity, true);
            });
            clearInterval(inactivityTimer);
        };
    }, [user]); // Solo cuando user cambia

    // Efecto para limpiar intervalo de presencia cuando cambia
    useEffect(() => {
        return () => {
            if (presenceCheckInterval) {
                clearInterval(presenceCheckInterval);
            }
        };
    }, [presenceCheckInterval]);

    const startPresenceMonitoring = () => {
        console.log('Iniciando monitoreo de presencia para login facial');
        
        // Limpiar intervalo anterior si existe
        if (presenceCheckInterval) {
            clearInterval(presenceCheckInterval);
        }

        // Verificar presencia cada 5 minutos
        const interval = setInterval(async () => {
            try {
                // Aquí podríamos hacer una verificación de presencia
                // Por ahora, solo verificamos que no haya pasado demasiado tiempo
                const now = Date.now();
                const timeSinceLastActivity = now - lastActivity;
                
                if (timeSinceLastActivity > PRESENCE_CHECK_INTERVAL * 2) {
                    console.log('Presencia no verificada - cerrando sesión');
                    logout();
                }
            } catch (error) {
                console.error('Error en verificación de presencia:', error);
            }
        }, PRESENCE_CHECK_INTERVAL);

        setPresenceCheckInterval(interval);
    };

    const login = async (username, password) => {
        try {
            const userData = await authService.login(username, password);
            setUser(userData);
            setLastActivity(Date.now());
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const loginFacial = async (imageData) => {
        try {
            console.log('AuthContext loginFacial: Iniciando login facial');
            setLoading(true);
            const response = await aiService.loginFacial(imageData);
            console.log('AuthContext loginFacial: Respuesta de API:', response);
            
            if (response.login_exitoso) {
                console.log('AuthContext loginFacial: Login exitoso, usuario:', response.usuario);
                const userData = {
                    ...response.usuario,
                    loginMethod: 'facial'
                };
                
                setUser(userData);
                setLastActivity(Date.now());
                
                // Store token and user data in sessionStorage
                sessionStorage.setItem('token', response.token);
                sessionStorage.setItem('user', JSON.stringify(userData));
                sessionStorage.setItem('lastActivity', Date.now().toString());
                
                // Iniciar monitoreo de presencia para login facial
                startPresenceMonitoring();
                
                return { success: true, user: userData };
            } else {
                console.log('AuthContext loginFacial: Login fallido, mensaje:', response.mensaje);
                return { success: false, error: response.mensaje || 'Login facial fallido' };
            }
        } catch (error) {
            console.error('AuthContext loginFacial: Error en login facial:', error);
            return { success: false, error: error.message || 'Error en login facial' };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Limpiar intervalo de presencia
            if (presenceCheckInterval) {
                clearInterval(presenceCheckInterval);
                setPresenceCheckInterval(null);
            }
            
            await authService.logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setUser(null);
            setLastActivity(Date.now());
            
            // Clear all session data
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('lastActivity');
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
        // Update sessionStorage as well
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        login,
        loginFacial,
        logout,
        register,
        updateUser,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'Administrador',
        isResident: user?.role === 'resident' || user?.role === 'Residente',
        isSecurity: user?.role === 'security' || user?.role === 'Seguridad',
        isFacialLogin: user?.loginMethod === 'facial',
        lastActivity,
        timeUntilExpiry: user ? Math.max(0, INACTIVITY_TIMEOUT - (Date.now() - lastActivity)) : 0
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};