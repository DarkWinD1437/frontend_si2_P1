import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user || user.role !== 'admin') {
        return null; // O redirigir a login
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                                Panel de Administrador
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

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Bienvenido al Panel de Control
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Desde aquí puedes gestionar residentes y configuraciones del edificio.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="transform hover:scale-105 transition-transform duration-300">
                                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-md overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Residentes</h3>
                                        <p className="text-gray-600">
                                            Administra los residentes del edificio y sus permisos
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="transform hover:scale-105 transition-transform duration-300">
                                <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Configuraciones</h3>
                                        <p className="text-gray-600">
                                            Ajusta las configuraciones del sistema y preferencias
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="transform hover:scale-105 transition-transform duration-300">
                                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-md overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Reportes</h3>
                                        <p className="text-gray-600">
                                            Visualiza y genera reportes del condominio
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

export default AdminDashboard;
