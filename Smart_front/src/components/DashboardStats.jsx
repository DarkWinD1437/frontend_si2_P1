import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { dashboardService } from '../services/dashboardService';

const DashboardStats = () => {
    const [users, setUsers] = useState([]);
    const [financialStats, setFinancialStats] = useState(null);
    const [reservationStats, setReservationStats] = useState(null);
    const [securityStats, setSecurityStats] = useState(null);
    const [maintenanceStats, setMaintenanceStats] = useState(null);
    const [communicationsStats, setCommunicationsStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        try {
            setLoading(true);
            const [userData, allStats] = await Promise.all([
                userService.getAllUsers(),
                dashboardService.getAllStats()
            ]);

            setUsers(userData.success ? userData.data : []);
            setFinancialStats(allStats.financial);
            setReservationStats(allStats.reservations);
            setSecurityStats(allStats.security);
            setMaintenanceStats(allStats.maintenance);
            setCommunicationsStats(allStats.communications);
        } catch (err) {
            setError('Error al cargar datos del dashboard');
            console.error('Error fetching dashboard stats:', err);
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-300 dark:border-blue-700',
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
            color: 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-300 dark:border-green-700',
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
            color: 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            borderColor: 'border-purple-300 dark:border-purple-700',
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
            color: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            borderColor: 'border-yellow-300 dark:border-yellow-700',
            trend: loading ? '...' : `${realStats.total > 0 ? Math.round((realStats.residents / realStats.total) * 100) : 0}%`,
            trendColor: 'text-yellow-600'
        },
        // Financial stats
        {
            name: 'Cargos Pendientes',
            value: loading ? '...' : (financialStats?.success ? financialStats.data?.total_cargos_pendientes || 0 : 'N/A'),
            description: 'Cargos financieros sin pagar',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
            ),
            color: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-300 dark:border-red-700',
            trend: loading ? '...' : (financialStats?.success ? `$${financialStats.data?.monto_total_pendiente || 0}` : 'N/A'),
            trendColor: 'text-red-600'
        },
        {
            name: 'Pagos del Mes',
            value: loading ? '...' : (financialStats?.success ? `$${(financialStats.data?.total_pagos_mes_actual || 0).toLocaleString()}` : 'N/A'),
            description: 'Ingresos del mes actual',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            color: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            borderColor: 'border-emerald-300 dark:border-emerald-700',
            trend: loading ? '...' : '+12%',
            trendColor: 'text-emerald-600'
        },
        // Reservation stats
        {
            name: 'Reservas Pendientes',
            value: loading ? '...' : (reservationStats?.success ? reservationStats.data?.pendiente || 0 : 'N/A'),
            description: 'Reservas esperando confirmación',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            color: 'bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-200',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            borderColor: 'border-orange-300 dark:border-orange-700',
            trend: loading ? '...' : `${reservationStats?.success ? reservationStats.data?.total || 0 : 0} total`,
            trendColor: 'text-orange-600'
        },
        // Security stats
        {
            name: 'Accesos Permitidos',
            value: loading ? '...' : (securityStats?.success ? securityStats.data?.permitidos || 0 : 'N/A'),
            description: 'Accesos autorizados al condominio',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            ),
            color: 'bg-teal-200 text-teal-900 dark:bg-teal-900 dark:text-teal-200',
            bgColor: 'bg-teal-50 dark:bg-teal-900/20',
            borderColor: 'border-teal-300 dark:border-teal-700',
            trend: loading ? '...' : `${securityStats?.success ? Math.round((securityStats.data?.permitidos || 0) / (securityStats.data?.total || 1) * 100) : 0}%`,
            trendColor: 'text-teal-600'
        },
        // Maintenance stats
        {
            name: 'Solicitudes de Mantenimiento',
            value: loading ? '...' : (maintenanceStats?.success ? maintenanceStats.data?.pendiente || 0 : 'N/A'),
            description: 'Solicitudes pendientes de atención',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            borderColor: 'border-indigo-300 dark:border-indigo-700',
            trend: loading ? '...' : `${maintenanceStats?.success ? maintenanceStats.data?.total || 0 : 0} total`,
            trendColor: 'text-indigo-600'
        },
        // Communications stats
        {
            name: 'Avisos Activos',
            value: loading ? '...' : (communicationsStats?.success ? communicationsStats.data?.activo || 0 : 'N/A'),
            description: 'Comunicaciones publicadas activas',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            ),
            color: 'bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-200',
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
            borderColor: 'border-cyan-300 dark:border-cyan-700',
            trend: loading ? '...' : `${communicationsStats?.success ? communicationsStats.data?.total || 0 : 0} total`,
            trendColor: 'text-cyan-600'
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    Estadísticas del Sistema
                    {loading && (
                        <div className="ml-3 animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    )}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                    Información actualizada de usuarios registrados en Smart Condominium
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {stats.map((stat, index) => {
                    // Calculate progress percentage for progress bar
                    let progressPercentage = 0;
                    
                    if (stat.name === 'Total de Usuarios') {
                        progressPercentage = 100;
                    } else if (stat.name === 'Usuarios Activos') {
                        progressPercentage = realStats.total > 0 ? Math.round((realStats.active / realStats.total) * 100) : 0;
                    } else if (stat.name === 'Administradores') {
                        progressPercentage = realStats.total > 0 ? Math.round((realStats.admins / realStats.total) * 100) : 0;
                    } else if (stat.name === 'Residentes') {
                        progressPercentage = realStats.total > 0 ? Math.round((realStats.residents / realStats.total) * 100) : 0;
                    } else if (stat.name === 'Cargos Pendientes') {
                        // Para cargos pendientes, mostrar un porcentaje basado en un límite razonable
                        const pending = financialStats?.success ? financialStats.data?.total_cargos_pendientes || 0 : 0;
                        progressPercentage = Math.min(pending * 10, 100); // Máximo 100%
                    } else if (stat.name === 'Pagos del Mes') {
                        // Para pagos del mes, mostrar progreso basado en meta mensual
                        const pagos = financialStats?.success ? financialStats.data?.total_pagos_mes_actual || 0 : 0;
                        progressPercentage = Math.min((pagos / 10000) * 100, 100); // Meta de $10,000
                    } else if (stat.name === 'Reservas Pendientes') {
                        const pending = reservationStats?.success ? reservationStats.data?.pendiente || 0 : 0;
                        progressPercentage = Math.min(pending * 20, 100); // Máximo 100%
                    } else if (stat.name === 'Accesos Permitidos') {
                        const total = securityStats?.success ? securityStats.data?.total || 0 : 0;
                        const permitidos = securityStats?.success ? securityStats.data?.permitidos || 0 : 0;
                        progressPercentage = total > 0 ? Math.round((permitidos / total) * 100) : 0;
                    } else if (stat.name === 'Solicitudes de Mantenimiento') {
                        const pending = maintenanceStats?.success ? maintenanceStats.data?.pendiente || 0 : 0;
                        progressPercentage = Math.min(pending * 25, 100); // Máximo 100%
                    } else if (stat.name === 'Avisos Activos') {
                        const total = communicationsStats?.success ? communicationsStats.data?.total || 0 : 0;
                        const activos = communicationsStats?.success ? communicationsStats.data?.activo || 0 : 0;
                        progressPercentage = total > 0 ? Math.round((activos / total) * 100) : 0;
                    }

                    return (
                        <div
                            key={stat.name}
                            className={`${stat.bgColor} ${stat.borderColor} border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${loading ? 'animate-pulse' : ''}`}
                            style={{
                                animationDelay: `${index * 100}ms`,
                                animation: loading ? 'pulse 2s infinite' : 'fadeInUp 0.6s ease-out forwards'
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-full ${stat.color}`}>
                                    {stat.icon}
                                </div>
                                <div className={`text-sm font-medium ${stat.trendColor} flex items-center truncate`}>
                                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span className="truncate">{stat.trend}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-300">{stat.name}</h4>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{stat.value}</p>
                                <p className="text-sm text-gray-700 dark:text-gray-400">{stat.description}</p>
                            </div>
                            
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-1000 ${
                                            stat.name === 'Total de Usuarios' 
                                                ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                                                : stat.name === 'Usuarios Activos' 
                                                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                                                    : stat.name === 'Administradores'
                                                        ? 'bg-gradient-to-r from-purple-400 to-purple-600'
                                                        : stat.name === 'Residentes'
                                                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                                            : stat.name === 'Cargos Pendientes'
                                                                ? 'bg-gradient-to-r from-red-400 to-red-600'
                                                                : stat.name === 'Pagos del Mes'
                                                                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                                                                    : stat.name === 'Reservas Pendientes'
                                                                        ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                                                                        : stat.name === 'Accesos Permitidos'
                                                                            ? 'bg-gradient-to-r from-teal-400 to-teal-600'
                                                                            : stat.name === 'Solicitudes de Mantenimiento'
                                                                                ? 'bg-gradient-to-r from-indigo-400 to-indigo-600'
                                                                                : 'bg-gradient-to-r from-cyan-400 to-cyan-600'
                                        }`}
                                        style={{ width: loading ? '0%' : `${Math.min(progressPercentage, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-700 dark:text-gray-400">Progreso</span>
                                    <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">{Math.min(progressPercentage, 100)}%</span>
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
