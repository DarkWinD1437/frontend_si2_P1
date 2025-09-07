import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ResidentDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user || user.role !== 'resident') {
        return null; // O redirigir a login
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                                Portal del Residente
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Hola, {user?.username}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Bienvenido a tu Portal
                            </h2>
                            <p className="text-gray-600">
                                Aquí puedes ver tu información y gestionar tus solicitudes.
                            </p>
                            
                            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <h3 className="text-lg font-medium text-gray-900">Mis Pagos</h3>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Visualiza y gestiona tus pagos
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <h3 className="text-lg font-medium text-gray-900">Solicitudes</h3>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Crea y da seguimiento a tus solicitudes
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <h3 className="text-lg font-medium text-gray-900">Anuncios</h3>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Ver anuncios importantes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResidentDashboard;