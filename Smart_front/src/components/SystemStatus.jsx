import { useState, useEffect } from 'react';

const SystemStatus = () => {
    const [systemData, setSystemData] = useState({
        authentication: { status: 'operational', uptime: 100 },
        database: { status: 'operational', uptime: 100 },
        apiEndpoints: { status: 'operational', active: 29, total: 29 },
        testing: { status: 'operational', passed: 34, total: 36 }
    });

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'operational':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'operational':
                return 'bg-green-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'operational':
                return 'Operacional';
            case 'warning':
                return 'Advertencia';
            case 'error':
                return 'Error';
            default:
                return 'Desconocido';
        }
    };

    const systemComponents = [
        {
            name: 'Autenticación',
            status: systemData.authentication.status,
            value: `${systemData.authentication.uptime}% Uptime`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            name: 'Base de Datos',
            status: systemData.database.status,
            value: `${systemData.database.uptime}% Uptime`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
            )
        },
        {
            name: 'API Endpoints',
            status: systemData.apiEndpoints.status,
            value: `${systemData.apiEndpoints.active}/${systemData.apiEndpoints.total} Activos`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: 'Testing Suite',
            status: systemData.testing.status,
            value: `${systemData.testing.passed}/${systemData.testing.total} Tests`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            )
        }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Estado del Sistema</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Monitoreo en tiempo real</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        En línea
                    </div>
                    <div className="text-xs text-gray-400">
                        {currentTime.toLocaleTimeString()}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {systemComponents.map((component, index) => (
                    <div 
                        key={component.name}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        style={{
                            animationDelay: `${index * 150}ms`,
                            animation: 'fadeInRight 0.6s ease-out forwards'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="text-gray-700 dark:text-gray-300">
                                    {component.icon}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {component.name}
                                    </div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        {component.value}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${getStatusColor(component.status)}`}>
                                    {getStatusText(component.status)}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${getStatusBg(component.status)}`}></div>
                            </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-1000 ${
                                        component.status === 'operational' ? 'bg-green-500' :
                                        component.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ 
                                        width: component.name === 'API Endpoints' ? 
                                            `${(systemData.apiEndpoints.active / systemData.apiEndpoints.total) * 100}%` :
                                            component.name === 'Testing Suite' ?
                                            `${(systemData.testing.passed / systemData.testing.total) * 100}%` :
                                            '100%'
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Overall System Health */}
            <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">Estado General del Sistema</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Módulo 1 completamente operativo</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Saludable
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-green-600">99.9%</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Uptime</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-blue-600">&lt; 100ms</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Latencia</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-purple-600">0</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Errores</div>
                    </div>
                </div>
            </div>

            {/* Last updated */}
            <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Última actualización: {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
};

export default SystemStatus;
