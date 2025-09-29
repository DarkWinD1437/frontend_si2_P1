import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

export const LoadingProvider = ({ children }) => {
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Cargando...');

    const startPageLoading = (message = 'Cargando...') => {
        setLoadingMessage(message);
        setIsPageLoading(true);
    };

    const stopPageLoading = () => {
        setIsPageLoading(false);
    };

    return (
        <LoadingContext.Provider value={{
            isPageLoading,
            loadingMessage,
            startPageLoading,
            stopPageLoading
        }}>
            {children}
        </LoadingContext.Provider>
    );
};