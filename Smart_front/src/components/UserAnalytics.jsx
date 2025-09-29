import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

const UserAnalytics = () => {
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
            setUsers(userData.success ? userData.data : []);
        } catch (err) {
            setError('Error al cargar datos de usuarios');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const stats = users.length > 0 ? {
        total: users.length,
        admins: users.filter(user => user.role === 'admin' || user.role === 'Administrador').length,
        residents: users.filter(user => user.role === 'resident' || user.role === 'Residente').length,
        security: users.filter(user => user.role === 'security' || user.role === 'Seguridad').length,
        active: users.filter(user => user.is_active).length,
        inactive: users.filter(user => !user.is_active).length
    } : {
        total: 0, admins: 0, residents: 0, security: 0, active: 0, inactive: 0
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-700 shadow-lg p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Cargando estadísticas...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-red-300 dark:border-red-700 shadow-lg p-6">
                <div className="text-center text-red-600 dark:text-red-400">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{error}</p>
                    <button 
                        onClick={fetchUsers}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const rolePercentages = stats.total > 0 ? {
        admins: ((stats.admins / stats.total) * 100).toFixed(1),
        residents: ((stats.residents / stats.total) * 100).toFixed(1),
        security: ((stats.security / stats.total) * 100).toFixed(1)
    } : { admins: 0, residents: 0, security: 0 };

    const activePercentage = stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Análisis de Usuarios</h2>
                <p className="text-gray-700 dark:text-gray-300">Estadísticas generales del sistema</p>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm font-medium">Total Usuarios</p>
                            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                        </div>
                        <div className="bg-blue-500 p-3 rounded-full">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-medium">Usuarios Activos</p>
                            <p className="text-3xl font-bold text-green-900">{stats.active}</p>
                            <p className="text-xs text-green-600">{activePercentage}% del total</p>
                        </div>
                        <div className="bg-green-500 p-3 rounded-full">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-600 text-sm font-medium">Administradores</p>
                            <p className="text-3xl font-bold text-purple-900">{stats.admins}</p>
                            <p className="text-xs text-purple-600">{rolePercentages.admins}% del total</p>
                        </div>
                        <div className="bg-purple-500 p-3 rounded-full">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-600 text-sm font-medium">Residentes</p>
                            <p className="text-3xl font-bold text-orange-900">{stats.residents}</p>
                            <p className="text-xs text-orange-600">{rolePercentages.residents}% del total</p>
                        </div>
                        <div className="bg-orange-500 p-3 rounded-full">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Distribution Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-700 shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Roles</h3>
                <div className="space-y-4">
                    {/* Admins */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Administradores</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-700 dark:text-gray-300 mr-3">{stats.admins} usuarios</span>
                            <span className="text-sm font-medium text-purple-600">{rolePercentages.admins}%</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${rolePercentages.admins}%` }}
                        ></div>
                    </div>

                    {/* Residents */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Residentes</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-700 dark:text-gray-300 mr-3">{stats.residents} usuarios</span>
                            <span className="text-sm font-medium text-orange-600">{rolePercentages.residents}%</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${rolePercentages.residents}%` }}
                        ></div>
                    </div>

                    {/* Security */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Seguridad</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-700 dark:text-gray-300 mr-3">{stats.security} usuarios</span>
                            <span className="text-sm font-medium text-blue-600">{rolePercentages.security}%</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${rolePercentages.security}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Activity Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-700 shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estado de Actividad</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                                <span className="text-gray-800 dark:text-gray-200">Activos</span>
                            </div>
                            <span className="font-medium text-green-600 dark:text-green-400">{stats.active}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                                <span className="text-gray-800 dark:text-gray-200">Inactivos</span>
                            </div>
                            <span className="font-medium text-gray-600 dark:text-gray-400">{stats.inactive}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-700 shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-200 dark:border-indigo-700">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Actualizar Datos
                        </button>
                        <button 
                            onClick={fetchUsers}
                            className="w-full flex items-center justify-center px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-700"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v-2a2 2 0 00-2-2H8z" />
                            </svg>
                            Recargar Estadísticas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAnalytics;