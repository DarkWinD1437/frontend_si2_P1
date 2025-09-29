import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const QuickActions = () => {
    const { user } = useAuth();

    const actions = [
        {
            title: 'Registrar Nuevo Usuario',
            description: 'Crear una nueva cuenta de usuario en el sistema',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
            path: '/register',
            color: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
            roles: ['admin']
        },
        {
            title: 'Mi Perfil',
            description: 'Ver y editar información personal',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            path: '/profile',
            color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
            roles: ['admin', 'resident', 'security']
        },
        {
            title: 'Asignar Rol a Usuario',
            description: 'Gestionar roles y permisos de usuarios',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2h1.5M9 7a2 2 0 00-2 2m0 0a2 2 0 00-2 2m2-2h-1.5m3 4v.01" />
                </svg>
            ),
            path: '/roles',
            color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
            roles: ['admin']
        },
        {
            title: 'Ver Documentación',
            description: 'Consultar documentación técnica del módulo',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            path: '/documentation',
            color: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
            roles: ['admin', 'resident', 'security']
        }
    ];

    const filteredActions = actions.filter(action => 
        action.roles.includes(user?.role)
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-lg p-6">
            <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-3 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Acciones Rápidas</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Acceso directo a las funciones principales</p>
                </div>
            </div>

            <div className="space-y-3">
                {filteredActions.map((action, index) => (
                    <Link
                        key={action.title}
                        to={action.path}
                        className={`group block w-full p-4 rounded-lg ${action.color} text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
                        style={{
                            animationDelay: `${index * 100}ms`,
                            animation: 'fadeInLeft 0.6s ease-out forwards'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                    {action.icon}
                                </div>
                                <div>
                                    <h5 className="font-medium">{action.title}</h5>
                                    <p className="text-sm opacity-90">{action.description}</p>
                                </div>
                            </div>
                            <div className="transform group-hover:translate-x-1 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">29</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Endpoints</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">100%</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Completo</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickActions;
