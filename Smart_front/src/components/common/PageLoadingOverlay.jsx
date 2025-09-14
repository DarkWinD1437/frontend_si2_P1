import React from 'react';

const PageLoadingOverlay = ({ message = "Cargando..." }) => {
    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
            {/* Fondo con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
            
            {/* Contenido centrado */}
            <div className="relative z-10 text-center">
                {/* Logo o Icono */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full shadow-lg animate-pulse">
                        <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                </div>

                {/* Texto principal */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        Smart Condominium
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        {message}
                    </p>
                </div>

                {/* Barra de progreso animada */}
                <div className="w-80 max-w-sm mx-auto">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-full rounded-full animate-loading-bar"></div>
                    </div>
                </div>

                {/* Puntos de carga */}
                <div className="flex justify-center space-x-2 mt-6">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
            </div>
        </div>
    );
};

export default PageLoadingOverlay;