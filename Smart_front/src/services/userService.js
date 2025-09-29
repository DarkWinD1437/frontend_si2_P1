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

// Cache para usuarios - evita llamadas innecesarias
let usersCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const userService = {
    // Get current user profile
    async getProfile() {
        const response = await api.get('/me/');
        return response.data;
    },

    // Update user profile
    async updateProfile(profileData) {
        const response = await api.patch('/me/', profileData);
        return response.data;
    },

    // Change password
    async changePassword(passwordData) {
        const response = await api.post('/me/change-password/', passwordData);
        return response.data;
    },

    // Upload profile picture
    async uploadProfilePicture(formData) {
        const response = await api.post('/me/profile-picture/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete profile picture
    async deleteProfilePicture() {
        const response = await api.delete('/me/profile-picture/');
        return response.data;
    },

    // Get all users (admin only) - alias for compatibility
    async getUsers() {
        return this.getAllUsers();
    },

    // Get all users (admin only)
    async getAllUsers(forceRefresh = false) {
        // Verificar si hay datos en cache válidos
        const now = Date.now();
        if (!forceRefresh && usersCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
            console.log('Usando datos de usuarios desde cache');
            return {
                success: true,
                data: usersCache,
                fromCache: true
            };
        }

        try {
            console.log('Llamando a getAllUsers... (API call)');
            const response = await api.get('/users/');
            
            // Verificar la estructura de la respuesta
            const userData = response.data.users || response.data.results || response.data;
            
            const result = {
                success: true,
                data: Array.isArray(userData) ? userData : [],
                fromCache: false
            };

            // Actualizar cache
            usersCache = result.data;
            cacheTimestamp = now;

            return result;
        } catch (error) {
            console.error('Error fetching users:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    },

    // Limpiar cache de usuarios (útil después de actualizar un usuario)
    clearUsersCache() {
        console.log('Limpiando cache de usuarios');
        usersCache = null;
        cacheTimestamp = null;
    },

    // Assign role to user (admin only)
    async assignRole(userId, role) {
        const response = await api.post(`/users/${userId}/assign-role/`, {
            role: role
        });
        return response.data;
    },

    // Update user by ID (admin only)
    async updateUser(userId, userData) {
        const response = await api.patch(`/users/${userId}/`, userData);
        // Limpiar cache después de actualizar un usuario
        this.clearUsersCache();
        return response.data;
    },

    // Soft delete user (set as inactive) - recommended approach
    async deactivateUser(userId) {
        const result = await this.updateUser(userId, { is_active: false });
        return result;
    },

    // Reactivate user
    async activateUser(userId) {
        const result = await this.updateUser(userId, { is_active: true });
        return result;
    },

    // Hard delete user (admin only) - NOT RECOMMENDED for production
    async deleteUser(userId) {
        const response = await api.delete(`/users/${userId}/`);
        // Limpiar cache después de eliminar un usuario
        this.clearUsersCache();
        return response.data;
    },

    // Register new user
    async register(userData) {
        const response = await api.post('/register/', userData);
        return response.data;
    },

    // Register new user - alias for compatibility
    async registerUser(userData) {
        return this.register(userData);
    }
};

export default userService;
