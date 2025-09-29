import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    // Solo permitir acceso a administradores
    if (user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Acceso Denegado</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Esta aplicación está destinada únicamente para administradores del condominio.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Ir al Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <AdminDashboard />;
};

export default Dashboard;
