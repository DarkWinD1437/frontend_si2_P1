import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import RoleAssignment from './pages/admin/RoleAssignment';
import ManageProfiles from './pages/admin/ManageProfiles';
import Documentation from './pages/Documentation';
import AdminDashboard from './pages/admin/AdminDashboard';
import FinancialManagement from './pages/admin/FinancialManagement';
import EstadoCuenta from './components/financial/EstadoCuenta';
import ReservationManagement from './pages/common/ReservationManagement';
import CommunicationCenter from './pages/common/CommunicationCenter';
import SecurityModule from './pages/admin/SecurityModule';
import MaintenanceModule from './pages/admin/MaintenanceModule';
import AnalyticsModule from './pages/common/AnalyticsModule';
import AIVisionModule from './pages/admin/AIVisionModule';
import GenericPage from './pages/GenericPage';
import LoadingSpinner from './components/common/LoadingSpinner';
import PageLoadingOverlay from './components/common/PageLoadingOverlay';
import GestionAvisos from './pages/GestionAvisos';
import CrearEditarAviso from './pages/CrearEditarAviso';
import DetalleAviso from './pages/DetalleAviso';
import './App.css';

function AppRoutes() {
    const { user, loading, isAuthenticated, logout } = useAuth();
    const { isPageLoading, loadingMessage } = useLoading();
    const navigate = useNavigate();

    if (loading) {
        return <LoadingSpinner />;
    }

    // Mostrar overlay de carga durante transiciones
    if (isPageLoading) {
        return <PageLoadingOverlay message={loadingMessage} />;
    }

    // Verificar si el usuario es admin - Solo admins pueden usar la web
    if (user && user.role !== 'admin' && user.role !== 'Administrador') {
        const handleBackToLogin = () => {
            logout();
            navigate('/login');
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
                        <p className="text-gray-600 mb-4">
                            La aplicación web está reservada únicamente para administradores.
                        </p>
                        <p className="text-sm text-orange-600 font-medium mb-2">
                            Residentes y personal de seguridad deben usar la aplicación móvil.
                        </p>
                        <p className="text-xs text-gray-500">
                            Rol detectado: {user.role || 'No definido'}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={handleBackToLogin}
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300"
                        >
                            Volver al Login
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="w-full bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                            Limpiar Caché y Recargar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route 
                path="/login" 
                element={!user ? <Login /> : <Dashboard />} 
            />
            <Route 
                path="/register" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <Register /> : <Login />} 
            />
            
            {/* Protected admin-only routes */}
            <Route 
                path="/dashboard" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <Dashboard /> : <Login />} 
            />
            <Route 
                path="/profile" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <UserProfile /> : <Login />} 
            />
            <Route 
                path="/roles" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <RoleAssignment /> : <Login />} 
            />
            <Route 
                path="/manage-profiles" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <ManageProfiles /> : <Login />} 
            />
            <Route 
                path="/documentation" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <Documentation /> : <Login />} 
            />
            
            {/* Administrative functionalities */}
            <Route 
                path="/areas" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? 
                    <GenericPage 
                        title="Gestión de Áreas Comunes" 
                        description="Administración completa de espacios comunes del condominio"
                        content="Configuración de disponibilidad y horarios de piscinas, salones de eventos, áreas verdes, gimnasio, salón de juegos y más."
                    /> : <Login />} 
            />
            <Route 
                path="/reservations" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <ReservationManagement /> : <Login />} 
            />
            <Route 
                path="/correspondence" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? 
                    <GenericPage 
                        title="Gestión de Correspondencia" 
                        description="Control administrativo de correspondencia y paquetes"
                        content="Sistema centralizado para gestionar toda la correspondencia, paquetes y notificaciones dirigidas a los residentes."
                    /> : <Login />} 
            />
            <Route 
                path="/comunicaciones" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <GestionAvisos /> : <Login />} 
            />
            <Route 
                path="/comunicaciones/crear" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <CrearEditarAviso /> : <Login />} 
            />
            <Route 
                path="/comunicaciones/:id" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <DetalleAviso /> : <Login />} 
            />
            <Route 
                path="/comunicaciones/:id/editar" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <CrearEditarAviso /> : <Login />} 
            />
            <Route 
                path="/announcements" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <CommunicationCenter /> : <Login />} 
            />
            <Route 
                path="/finances" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <FinancialManagement /> : <Login />} 
            />
            <Route 
                path="/estado-cuenta" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <EstadoCuenta /> : <Login />} 
            />
            <Route 
                path="/access-control" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <SecurityModule /> : <Login />} 
            />
            <Route 
                path="/incidents" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? 
                    <GenericPage 
                        title="Gestión de Incidencias" 
                        description="Sistema administrativo de reportes y seguimiento"
                        content="Plataforma para gestionar reportes de problemas, incidencias de seguridad, daños en instalaciones y seguimiento administrativo de soluciones."
                    /> : <Login />} 
            />
            <Route 
                path="/settings" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? 
                    <GenericPage 
                        title="Configuración del Sistema" 
                        description="Panel de control administrativo"
                        content="Configuración avanzada del sistema, parámetros operativos, precios de expensas, multas y configuraciones generales del condominio."
                    /> : <Login />} 
            />
            <Route 
                path="/maintenance" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <MaintenanceModule /> : <Login />} 
            />
            <Route 
                path="/analytics" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <AnalyticsModule /> : <Login />} 
            />
            <Route 
                path="/ai-vision" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <AIVisionModule /> : <Login />} 
            />
            
            {/* Legacy admin route */}
            <Route 
                path="/admin" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <AdminDashboard /> : <Login />} 
            />
            
            {/* Default route */}
            <Route 
                path="/" 
                element={(user?.role === 'admin' || user?.role === 'Administrador') ? <Dashboard /> : <Login />} 
            />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <LoadingProvider>
                    <Router>
                        <div className="App">
                            <AppRoutes />
                        </div>
                    </Router>
                </LoadingProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;