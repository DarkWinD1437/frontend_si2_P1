import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Layout from '../../components/Layout';

const AnalyticsModule = () => {
    const { user } = useAuth();
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    const mockAnalytics = {
        admin: {
            general: {
                totalResidents: 245,
                totalApartments: 120,
                occupancyRate: 95,
                monthlyRevenue: 125000,
                pendingMaintenance: 8,
                activeReservations: 15
            },
            financial: {
                totalIncome: 150000,
                totalExpenses: 95000,
                profit: 55000,
                defaulters: 12,
                paidFees: 108
            },
            maintenance: {
                completedTasks: 45,
                pendingTasks: 8,
                averageResponseTime: '2.5 días',
                workerUtilization: 85
            },
            security: {
                totalIncidents: 3,
                visitorsThisMonth: 89,
                alertsGenerated: 12,
                accessViolations: 2
            }
        },
        security: {
            incidents: {
                thisMonth: 3,
                lastMonth: 5,
                resolved: 2,
                pending: 1
            },
            visitors: {
                today: 12,
                thisWeek: 89,
                averageDaily: 15,
                pendingAuthorizations: 3
            },
            access: {
                successfulAccess: 1245,
                failedAttempts: 23,
                emergencyActivations: 1,
                systemUptime: 99.8
            }
        },
        resident: {
            personal: {
                paymentStatus: 'Al día',
                pendingFees: 0,
                nextPayment: '2024-02-15',
                maintenanceRequests: 2
            },
            community: {
                upcomingEvents: 3,
                reservationsThisMonth: 5,
                complaintsSubmitted: 1,
                neighborhoodRating: 4.5
            }
        }
    };

    useEffect(() => {
        setTimeout(() => {
            setAnalyticsData(mockAnalytics);
            setLoading(false);
        }, 1000);
    }, [selectedPeriod]);

    const StatCard = ({ title, value, change, icon, color = 'blue' }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    {change && (
                        <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change > 0 ? '+' : ''}{change}% vs mes anterior
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    const ChartPlaceholder = ({ title, description }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <Layout title="Analytics y Reportes" description="Cargando datos...">
                <LoadingSpinner />
            </Layout>
        );
    }

    const renderAdminDashboard = () => (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Administrativo</h2>
                <select 
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-500 dark:text-gray-300"
                >
                    <option value="week" className="text-gray-500 dark:text-gray-300">Esta Semana</option>
                    <option value="month" className="text-gray-500 dark:text-gray-300">Este Mes</option>
                    <option value="quarter" className="text-gray-500 dark:text-gray-300">Este Trimestre</option>
                    <option value="year" className="text-gray-500 dark:text-gray-300">Este Año</option>
                </select>
            </div>

            {/* General Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard
                    title="Total Residentes"
                    value={analyticsData.admin.general.totalResidents}
                    change={3.2}
                    color="blue"
                    icon={<svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" /></svg>}
                />
                <StatCard
                    title="Ocupación"
                    value={`${analyticsData.admin.general.occupancyRate}%`}
                    change={1.5}
                    color="green"
                    icon={<svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>}
                />
                <StatCard
                    title="Ingresos Mes"
                    value={`$${analyticsData.admin.general.monthlyRevenue.toLocaleString()}`}
                    change={8.1}
                    color="yellow"
                    icon={<svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>}
                />
                <StatCard
                    title="Mantenimientos"
                    value={analyticsData.admin.general.pendingMaintenance}
                    change={-12.3}
                    color="orange"
                    icon={<svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>}
                />
                <StatCard
                    title="Reservaciones"
                    value={analyticsData.admin.general.activeReservations}
                    change={5.7}
                    color="purple"
                    icon={<svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>}
                />
                <StatCard
                    title="Utilidad"
                    value={`$${analyticsData.admin.financial.profit.toLocaleString()}`}
                    change={12.4}
                    color="green"
                    icon={<svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder
                    title="Ingresos vs Gastos"
                    description="Gráfico de líneas mostrando evolución financiera"
                />
                <ChartPlaceholder
                    title="Distribución de Gastos"
                    description="Gráfico circular de categorías de gastos"
                />
                <ChartPlaceholder
                    title="Mantenimientos por Estado"
                    description="Gráfico de barras de solicitudes de mantenimiento"
                />
                <ChartPlaceholder
                    title="Ocupación por Edificio"
                    description="Gráfico de barras de ocupación por edificio"
                />
            </div>
        </div>
    );

    const renderSecurityDashboard = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard de Seguridad</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Incidentes del Mes"
                    value={analyticsData.security.incidents.thisMonth}
                    change={-40}
                    color="red"
                    icon={<svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
                />
                <StatCard
                    title="Visitantes Hoy"
                    value={analyticsData.security.visitors.today}
                    change={15}
                    color="blue"
                    icon={<svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" /></svg>}
                />
                <StatCard
                    title="Accesos Exitosos"
                    value={analyticsData.security.access.successfulAccess}
                    change={2.3}
                    color="green"
                    icon={<svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                />
                <StatCard
                    title="Tiempo Actividad"
                    value={`${analyticsData.security.access.systemUptime}%`}
                    change={0.1}
                    color="purple"
                    icon={<svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder
                    title="Incidentes por Tipo"
                    description="Análisis de tipos de incidencias de seguridad"
                />
                <ChartPlaceholder
                    title="Flujo de Visitantes"
                    description="Horarios pico de visitas al condominio"
                />
            </div>
        </div>
    );

    const renderResidentDashboard = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Estado de Pagos"
                    value={analyticsData.resident.personal.paymentStatus}
                    color="green"
                    icon={<svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                />
                <StatCard
                    title="Próximo Pago"
                    value={analyticsData.resident.personal.nextPayment}
                    color="orange"
                    icon={<svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>}
                />
                <StatCard
                    title="Mis Reservas"
                    value={analyticsData.resident.community.reservationsThisMonth}
                    color="blue"
                    icon={<svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                    title="Calificación Vecindario"
                    value={analyticsData.resident.community.neighborhoodRating}
                    color="yellow"
                    icon={<svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartPlaceholder
                    title="Historial de Pagos"
                    description="Registro de pagos de administración"
                />
                <ChartPlaceholder
                    title="Uso de Amenities"
                    description="Frecuencia de uso de espacios comunes"
                />
            </div>
        </div>
    );

    return (
        <Layout 
            title="Analytics y Reportes" 
            description="Panel de control y métricas personalizadas según tu rol"
        >
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Analytics y Reportes
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Panel de control y métricas personalizadas según tu rol
                    </p>
                </div>

                {user?.role === 'admin' && renderAdminDashboard()}
                {user?.role === 'security' && renderSecurityDashboard()}
                {(user?.role === 'resident' || !user?.role) && renderResidentDashboard()}
            </div>
        </Layout>
    );
};

export default AnalyticsModule;