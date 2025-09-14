import React, { useState } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AIVisionModule = () => {
    const [activeFeature, setActiveFeature] = useState('security');
    const [isEnabled, setIsEnabled] = useState(false);

    const features = {
        security: {
            title: 'IA de Seguridad',
            description: 'Detección automática de incidentes y monitoreo inteligente',
            capabilities: [
                'Detección de intrusos',
                'Reconocimiento facial',
                'Análisis de comportamiento anómalo',
                'Alertas automáticas',
                'Grabación inteligente'
            ]
        },
        maintenance: {
            title: 'IA de Mantenimiento',
            description: 'Predicción y optimización del mantenimiento preventivo',
            capabilities: [
                'Predicción de fallas',
                'Análisis de consumo energético',
                'Detección de fugas',
                'Optimización de recursos',
                'Mantenimiento predictivo'
            ]
        },
        analytics: {
            title: 'IA Analítica',
            description: 'Análisis inteligente de patrones y tendencias',
            capabilities: [
                'Análisis de ocupación',
                'Patrones de uso',
                'Predicción de demanda',
                'Optimización de espacios',
                'Reportes automáticos'
            ]
        },
        assistant: {
            title: 'Asistente Virtual',
            description: 'Chatbot inteligente para residentes y administración',
            capabilities: [
                'Atención 24/7',
                'Respuestas automatizadas',
                'Gestión de solicitudes',
                'Información del condominio',
                'Soporte multilingual'
            ]
        }
    };

    const FeatureCard = ({ featureKey, feature }) => (
        <div 
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                activeFeature === featureKey
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } bg-white dark:bg-gray-800`}
            onClick={() => setActiveFeature(featureKey)}
        >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
                {feature.description}
            </p>
            <ul className="space-y-2">
                {feature.capabilities.map((capability, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {capability}
                    </li>
                ))}
            </ul>
        </div>
    );

    const ConfigurationPanel = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Configuración de {features[activeFeature].title}
                </h3>
                <label className="inline-flex items-center">
                    <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => setIsEnabled(e.target.checked)}
                        className="sr-only"
                    />
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        isEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                        <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            isEnabled ? 'transform translate-x-4' : ''
                        }`} />
                    </div>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {isEnabled ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                </label>
            </div>

            {isEnabled ? (
                <div className="space-y-6">
                    {/* Configuration Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nivel de Sensibilidad
                            </label>
                            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                                <option className="text-gray-500 dark:text-gray-300">Bajo</option>
                                <option className="text-gray-500 dark:text-gray-300">Medio</option>
                                <option selected className="text-gray-500 dark:text-gray-300">Alto</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Horario Activo
                            </label>
                            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                                <option selected className="text-gray-500 dark:text-gray-300">24/7</option>
                                <option className="text-gray-500 dark:text-gray-300">Solo Nocturno</option>
                                <option className="text-gray-500 dark:text-gray-300">Solo Diurno</option>
                                <option className="text-gray-500 dark:text-gray-300">Personalizado</option>
                            </select>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                            Configuración de Notificaciones
                        </h4>
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input type="checkbox" defaultChecked className="mr-3" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Alertas en tiempo real
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" defaultChecked className="mr-3" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Reportes diarios
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input type="checkbox" className="mr-3" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Notificaciones por email
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            Guardar Configuración
                        </button>
                        <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                            Restaurar Defaults
                        </button>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                            Ejecutar Prueba
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Habilita esta funcionalidad para acceder a la configuración
                    </p>
                </div>
            )}
        </div>
    );

    const StatusPanel = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estado del Sistema IA
            </h3>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Sistema Principal</span>
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Online</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Modelos de IA</span>
                    </div>
                    <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Cargando</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">API Externa</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Desconectada</span>
                </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Próximas Actualizaciones</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Integración con OpenAI GPT-4</li>
                    <li>• Modelo de visión por computadora personalizado</li>
                    <li>• API de reconocimiento de voz</li>
                    <li>• Dashboard de métricas de IA</li>
                </ul>
            </div>
        </div>
    );

    return (
        <Layout 
            title="Inteligencia Artificial y Visión"
            description="Módulos de IA y visión artificial para automatización inteligente"
        >
            <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Inteligencia Artificial y Visión
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Módulos de IA y visión artificial para automatización inteligente
                </p>
            </div>

            {/* Warning Banner */}
            <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                    <svg className="w-6 h-6 text-orange-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <h3 className="font-medium text-orange-800 dark:text-orange-300">
                            Funcionalidad en Desarrollo
                        </h3>
                        <p className="text-sm text-orange-700 dark:text-orange-400">
                            Este módulo está preparado para futuras integraciones de IA. Las funcionalidades están planificadas para implementación en fases posteriores.
                        </p>
                    </div>
                </div>
            </div>

            {/* Feature Selection */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Módulos de IA Disponibles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(features).map(([key, feature]) => (
                        <FeatureCard key={key} featureKey={key} feature={feature} />
                    ))}
                </div>
            </div>

            {/* Configuration and Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ConfigurationPanel />
                <StatusPanel />
            </div>

            {/* Integration Roadmap */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Hoja de Ruta de Integración
                </h3>
                
                <div className="space-y-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Fase 1: Infraestructura Base</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configuración de endpoints y estructura de datos</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">2</span>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Fase 2: Integración de APIs</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Conexión con servicios de IA externos</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-medium">3</span>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">Fase 3: Modelos Personalizados</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Desarrollo de modelos específicos para condominios</p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                        Solicitar Demo
                    </button>
                    <button className="ml-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                        Documentación Técnica
                    </button>
                </div>
            </div>
            </div>
        </Layout>
    );
};

export default AIVisionModule;