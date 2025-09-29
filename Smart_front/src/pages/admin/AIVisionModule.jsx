import React, { useState } from 'react';
import Layout from '../../components/Layout';
import RegistroRostro from '../../components/ai/RegistroRostro';
import RegistroPlaca from '../../components/ai/RegistroPlaca';
import HistorialAccesos from '../../components/ai/HistorialAccesos';

const AIVisionModule = () => {
    const [activeTab, setActiveTab] = useState('rostro');

    const tabs = [
        {
            id: 'rostro',
            name: 'Registro Facial',
            description: 'Registrar rostros para reconocimiento facial',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            id: 'placa',
            name: 'Registro Vehicular',
            description: 'Registrar placas de vehículos',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            id: 'historial',
            name: 'Historial de Accesos',
            description: 'Consultar historial de accesos al condominio',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            )
        }
    ];

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'rostro':
                return <RegistroRostro />;
            case 'placa':
                return <RegistroPlaca />;
            case 'historial':
                return <HistorialAccesos />;
            default:
                return <RegistroRostro />;
        }
    };

    return (
        <Layout
            title="Módulo de Seguridad con IA"
            description="Sistema inteligente de reconocimiento facial y vehicular para control de accesos"
        >
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Seguridad con Inteligencia Artificial
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Gestiona el reconocimiento facial, registro vehicular y consulta el historial de accesos
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.name}
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Description */}
                <div className="mb-6">
                    {tabs.map((tab) => (
                        activeTab === tab.id && (
                            <div key={tab.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                            {tab.icon}
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                                            {tab.name}
                                        </h3>
                                        <p className="text-blue-700 dark:text-blue-300">
                                            {tab.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>

                {/* Active Tab Content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    {renderActiveTab()}
                </div>

                {/* Footer Info */}
                <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Sistema de Seguridad IA - Smart Condominium
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Tecnología avanzada de reconocimiento biométrico y vehicular para máxima seguridad.
                            Todos los datos son procesados de forma segura y confidencial.
                        </p>
                        <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                            <span>• Reconocimiento Facial con IA</span>
                            <span>• Lectura Automática de Placas</span>
                            <span>• Historial Completo de Accesos</span>
                            <span>• Procesamiento en Tiempo Real</span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AIVisionModule;