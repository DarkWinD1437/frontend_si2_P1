import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const SecurityDashboard = () => {
    const { user } = useAuth();

    return (
        <Layout 
            title="Panel de Seguridad"
            description="Control y monitoreo de seguridad del condominio"
        >
            <div className="space-y-8">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg shadow p-6 text-white">
                    <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <h1 className="text-2xl font-semibold">
                                Panel de Seguridad
                            </h1>
                            <p className="mt-2 text-yellow-100">
                                ¡Bienvenido, {user?.first_name || user?.username}! Monitorea la seguridad del condominio.
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                            <div className="inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 transition-colors">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Seguridad
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center py-20">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Panel de Seguridad</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Esta sección está en construcción. Pronto podrás monitorear la seguridad del condominio.
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default SecurityDashboard;