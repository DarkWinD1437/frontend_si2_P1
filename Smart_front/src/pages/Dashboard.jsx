import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResidentDashboard from './ResidentDashboard';
import AdminDashboard from './admin/AdminDashboard';
import SecurityDashboard from './SecurityDashboard';

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

    // Redirigir según el rol del usuario
    switch (user.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'resident':
            return <ResidentDashboard />;
        case 'security':
            return <SecurityDashboard />;
        default:
            return <ResidentDashboard />;
    }
};

export default Dashboard;
