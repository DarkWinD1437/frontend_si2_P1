import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme debe usarse dentro de un ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    // Cargar tema desde localStorage al inicializar
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            const isDarkMode = savedTheme === 'dark';
            setIsDark(isDarkMode);
            updateDocumentTheme(isDarkMode);
        } else {
            // Detectar preferencia del sistema
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(systemPrefersDark);
            updateDocumentTheme(systemPrefersDark);
        }
    }, []);

    const updateDocumentTheme = (dark) => {
        console.log('Cambiando tema a:', dark ? 'oscuro' : 'claro');
        
        if (dark) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }
        
        // Verificar que se aplicó correctamente
        console.log('Clases en html:', document.documentElement.className);
        console.log('Clases en body:', document.body.className);
    };

    const toggleTheme = () => {
        console.log('Toggle theme clicked. Current isDark:', isDark);
        const newTheme = !isDark;
        setIsDark(newTheme);
        updateDocumentTheme(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        console.log('Nuevo tema guardado:', newTheme ? 'dark' : 'light');
    };

    const setLightTheme = () => {
        setIsDark(false);
        updateDocumentTheme(false);
        localStorage.setItem('theme', 'light');
    };

    const setDarkTheme = () => {
        setIsDark(true);
        updateDocumentTheme(true);
        localStorage.setItem('theme', 'dark');
    };

    const value = {
        isDark,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        theme: isDark ? 'dark' : 'light'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};