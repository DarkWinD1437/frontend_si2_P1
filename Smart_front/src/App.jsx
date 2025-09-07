import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ResidentDashboard from './pages/ResidentDashboard';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function AppRoutes() {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Routes>
            <Route 
                path="/login" 
                element={!user ? <Login /> : (user.role === 'admin' ? <AdminDashboard /> : <ResidentDashboard />)} 
            />
            <Route 
                path="/admin" 
                element={user?.role === 'admin' ? <AdminDashboard /> : <Login />} 
            />
            <Route 
                path="/resident" 
                element={user?.role === 'resident' ? <ResidentDashboard /> : <Login />} 
            />
            <Route 
                path="/" 
                element={user ? (user.role === 'admin' ? <AdminDashboard /> : <ResidentDashboard />) : <Login />} 
            />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <AppRoutes />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;