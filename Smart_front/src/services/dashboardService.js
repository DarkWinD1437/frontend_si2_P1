import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect if we're not already on login page and this is a protected route
            const currentPath = window.location.pathname;
            const isLoginPage = currentPath === '/login' || currentPath === '/register';
            const isLoginRequest = error.config?.url?.includes('auth-token');

            if (!isLoginPage && !isLoginRequest) {
                // Token expired or invalid - clean up and redirect
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                console.warn('Token expired, redirecting to login');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const dashboardService = {
    // Get financial statistics
    async getFinancialStats() {
        try {
            const response = await api.get('/finances/estadisticas/');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching financial stats:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    },

    // Get reservation statistics
    async getReservationStats() {
        try {
            const response = await api.get('/reservations/reservas/');
            const reservations = response.data.results || response.data;

            // Count by status
            const stats = {
                total: reservations.length,
                pendiente: reservations.filter(r => r.estado === 'pendiente').length,
                confirmada: reservations.filter(r => r.estado === 'confirmada').length,
                pagada: reservations.filter(r => r.estado === 'pagada').length,
                cancelada: reservations.filter(r => r.estado === 'cancelada').length,
                completada: reservations.filter(r => r.estado === 'completada').length
            };

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('Error fetching reservation stats:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    },

    // Get security statistics (access logs)
    async getSecurityStats() {
        try {
            const response = await api.get('/security/accesos/');
            const accesses = response.data.results || response.data;

            // Count by status and type
            const stats = {
                total: accesses.length,
                permitidos: accesses.filter(a => a.estado === 'permitido').length,
                denegados: accesses.filter(a => a.estado === 'denegado').length,
                facial: accesses.filter(a => a.tipo_acceso === 'facial').length,
                placa: accesses.filter(a => a.tipo_acceso === 'placa').length,
                login_facial: accesses.filter(a => a.tipo_acceso === 'facial_login').length
            };

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('Error fetching security stats:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    },

    // Get maintenance statistics
    async getMaintenanceStats() {
        try {
            const response = await api.get('/maintenance/solicitudes/');
            const requests = response.data.results || response.data;

            // Count by status
            const stats = {
                total: requests.length,
                pendiente: requests.filter(r => r.estado === 'pendiente').length,
                asignada: requests.filter(r => r.estado === 'asignada').length,
                en_progreso: requests.filter(r => r.estado === 'en_progreso').length,
                completada: requests.filter(r => r.estado === 'completada').length,
                cancelada: requests.filter(r => r.estado === 'cancelada').length
            };

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('Error fetching maintenance stats:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    },

    // Get communications statistics
    async getCommunicationsStats() {
        try {
            const response = await api.get('/communications/aviso/');
            const announcements = response.data.results || response.data;

            // Count by type and status
            const stats = {
                total: announcements.length,
                activo: announcements.filter(a => a.activo).length,
                inactivo: announcements.filter(a => !a.activo).length,
                aviso: announcements.filter(a => a.tipo === 'aviso').length,
                noticia: announcements.filter(a => a.tipo === 'noticia').length,
                evento: announcements.filter(a => a.tipo === 'evento').length
            };

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('Error fetching communications stats:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    },

    // Get all dashboard statistics
    async getAllStats() {
        const [financial, reservations, security, maintenance, communications] = await Promise.allSettled([
            this.getFinancialStats(),
            this.getReservationStats(),
            this.getSecurityStats(),
            this.getMaintenanceStats(),
            this.getCommunicationsStats()
        ]);

        return {
            financial: financial.status === 'fulfilled' ? financial.value : null,
            reservations: reservations.status === 'fulfilled' ? reservations.value : null,
            security: security.status === 'fulfilled' ? security.value : null,
            maintenance: maintenance.status === 'fulfilled' ? maintenance.value : null,
            communications: communications.status === 'fulfilled' ? communications.value : null
        };
    }
};

export default dashboardService;