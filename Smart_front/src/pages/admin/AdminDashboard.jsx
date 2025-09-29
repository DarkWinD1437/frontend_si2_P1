import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import DashboardStats from '../../components/DashboardStats';
import UserAnalytics from '../../components/UserAnalytics';
import QuickActions from '../../components/QuickActions';
import SystemStatus from '../../components/SystemStatus';

const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <Layout 
            title="Panel de Administración"
            description="Control total del sistema de gestión del condominio"
        >
            <div className="space-y-8">
                {/* Page Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-xl p-6">
                    <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                Panel de Administración
                            </h1>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                ¡Bienvenido, {user?.first_name || user?.username}! Gestiona todo el sistema desde aquí.
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                            <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Sistema Activo
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <DashboardStats />

                {/* User Analytics Section */}
                <div className="mb-8">
                    <UserAnalytics />
                </div>

                {/* Quick Actions and System Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <QuickActions />
                    <SystemStatus />
                </div>

                {/* Additional Admin Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Actividad Reciente
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                <span className="text-gray-700 dark:text-gray-300">
                                    Nuevo usuario registrado
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-auto">2h</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                <span className="text-gray-700 dark:text-gray-300">
                                    Reserva confirmada - Salón Social
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-auto">3h</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                                <span className="text-gray-700 dark:text-gray-300">
                                    Solicitud de mantenimiento
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-auto">5h</span>
                            </div>
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Estado del Sistema
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-300">CPU</span>
                                <div className="flex items-center">
                                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                        <div className="bg-green-400 h-2 rounded-full" style={{width: '45%'}}></div>
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">45%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Memoria</span>
                                <div className="flex items-center">
                                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                        <div className="bg-yellow-400 h-2 rounded-full" style={{width: '72%'}}></div>
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">72%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Storage</span>
                                <div className="flex items-center">
                                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                        <div className="bg-blue-400 h-2 rounded-full" style={{width: '28%'}}></div>
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">28%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Resumen Rápido
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Total Usuarios</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">248</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Activos Hoy</span>
                                <span className="text-sm font-medium text-green-700 dark:text-green-400">156</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Reservas Pendientes</span>
                                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">12</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 dark:text-gray-300">Incidencias</span>
                                <span className="text-sm font-medium text-red-700 dark:text-red-400">3</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
