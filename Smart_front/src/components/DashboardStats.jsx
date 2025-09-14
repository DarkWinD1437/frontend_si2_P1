import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

const DashboardStats = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const userData = await userService.getAllUsers();
            setUsers(userData);
        } catch (err) {
            setError('Error al cargar datos');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate real statistics from database
    const realStats = users.length > 0 ? {
        total: users.length,
        admins: users.filter(user => user.role === 'admin').length,
        residents: users.filter(user => user.role === 'resident').length,
        active: users.filter(user => user.is_active).length,
        security: users.filter(user => user.role === 'security').length
    } : {
        total: 0, admins: 0, residents: 0, active: 0, security: 0
    };

    const stats = [
        {
            name: 'Total de Usuarios',
            value: loading ? '...' : realStats.total,
            description: 'Usuarios registrados en el sistema',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
            ),
            color: 'bg-blue-100 text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            trend: loading ? '...' : `+${realStats.total}`,
            trendColor: 'text-blue-600'
        },
        {
            name: 'Usuarios Activos',
            value: loading ? '...' : realStats.active,
            description: 'Usuarios con estado activo',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'bg-green-100 text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            trend: loading ? '...' : `${realStats.total > 0 ? Math.round((realStats.active / realStats.total) * 100) : 0}%`,
            trendColor: 'text-green-600'
        },
        {
            name: 'Administradores',
            value: loading ? '...' : realStats.admins,
            description: 'Usuarios con rol de administrador',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            color: 'bg-purple-100 text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            trend: loading ? '...' : `${realStats.total > 0 ? Math.round((realStats.admins / realStats.total) * 100) : 0}%`,
            trendColor: 'text-purple-600'
        },
        {
            name: 'Residentes',
            value: loading ? '...' : realStats.residents,
            description: 'Usuarios con rol de residente',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            color: 'bg-yellow-100 text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            trend: loading ? '...' : `${realStats.total > 0 ? Math.round((realStats.residents / realStats.total) * 100) : 0}%`,
            trendColor: 'text-yellow-600'
        }
    ];

    if (error) {
        return (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="text-center text-red-600">
                    <svg className="w-8 h-8 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mb-3">{error}</p>
                    <button 
                        onClick={fetchUsers}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    Estadísticas del Sistema
                    {loading && (
                        <div className="ml-3 animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    )}
                </h3>
                <p className="text-gray-600">
                    Información actualizada de usuarios registrados en Smart Condominium
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    // Calculate progress percentage for progress bar
                    const progressPercentage = stat.name === 'Total de Usuarios' 
                        ? 100 
                        : realStats.total > 0 
                            ? Math.round((parseInt(stat.value) / realStats.total) * 100)
                            : 0;

                    return (
                        <div
                            key={stat.name}
                            className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${loading ? 'animate-pulse' : ''}`}
                            style={{
                                animationDelay: `${index * 100}ms`,
                                animation: loading ? 'pulse 2s infinite' : 'fadeInUp 0.6s ease-out forwards'
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-full ${stat.color}`}>
                                    {stat.icon}
                                </div>
                                <div className={`text-sm font-medium ${stat.trendColor} flex items-center`}>
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    {stat.trend}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-600">{stat.name}</h4>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.description}</p>
                            </div>
                            
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-1000 ${
                                            stat.name === 'Total de Usuarios' 
                                                ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                                                : stat.name === 'Usuarios Activos' 
                                                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                                                    : stat.name === 'Administradores'
                                                        ? 'bg-gradient-to-r from-purple-400 to-purple-600'
                                                        : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                        }`}
                                        style={{ width: loading ? '0%' : `${progressPercentage}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-500">Progreso</span>
                                    <span className="text-xs text-gray-700 font-medium">{progressPercentage}%</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardStats;
