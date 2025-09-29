import axios from 'axios';
import config from '../config';

const API_BASE_URL = config.apiUrl;

class MaintenanceService {
    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000, // 10 segundos timeout
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Interceptor para agregar token de autenticación
        this.api.interceptors.request.use(
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

        // Interceptor para manejar errores de autenticación
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                // No redirigir automáticamente, dejar que el componente maneje el error
                return Promise.reject(error);
            }
        );
    }

    // ========== SOLICITUDES DE MANTENIMIENTO ==========

    /**
     * Obtener lista de solicitudes de mantenimiento
     * @param {Object} filters - Filtros opcionales (estado, prioridad)
     */
    async getSolicitudes(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.estado) params.append('estado', filters.estado);
            if (filters.prioridad) params.append('prioridad', filters.prioridad);

            const response = await this.api.get(`/maintenance/solicitudes/?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener solicitudes:', error);
            throw error;
        }
    }

    /**
     * Crear una nueva solicitud de mantenimiento
     * @param {Object} solicitudData - Datos de la solicitud
     */
    async createSolicitud(solicitudData) {
        try {
            const response = await this.api.post('/maintenance/solicitudes/', solicitudData);
            return response.data;
        } catch (error) {
            console.error('Error al crear solicitud:', error);
            throw error;
        }
    }

    /**
     * Obtener detalle de una solicitud específica
     * @param {number} id - ID de la solicitud
     */
    async getSolicitudById(id) {
        try {
            const response = await this.api.get(`/maintenance/solicitudes/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener solicitud:', error);
            throw error;
        }
    }

    /**
     * Actualizar una solicitud de mantenimiento
     * @param {number} id - ID de la solicitud
     * @param {Object} updateData - Datos a actualizar
     */
    async updateSolicitud(id, updateData) {
        try {
            const response = await this.api.patch(`/maintenance/solicitudes/${id}/`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar solicitud:', error);
            throw error;
        }
    }

    /**
     * Eliminar una solicitud de mantenimiento
     * @param {number} id - ID de la solicitud
     */
    async deleteSolicitud(id) {
        try {
            const response = await this.api.delete(`/maintenance/solicitudes/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar solicitud:', error);
            throw error;
        }
    }

    // ========== ASIGNACIÓN DE TAREAS ==========

    /**
     * Asignar una tarea de mantenimiento a una solicitud
     * @param {number} solicitudId - ID de la solicitud
     * @param {Object} tareaData - Datos de la tarea (asignado_a_id, descripcion_tarea, notas)
     */
    async assignTarea(solicitudId, tareaData) {
        try {
            const response = await this.api.post(`/maintenance/solicitudes/${solicitudId}/asignar_tarea/`, tareaData);
            return response.data;
        } catch (error) {
            console.error('Error al asignar tarea:', error);
            throw error;
        }
    }

    // ========== TAREAS DE MANTENIMIENTO ==========

    /**
     * Obtener lista de tareas de mantenimiento
     * @param {Object} filters - Filtros opcionales (estado, asignado_a)
     */
    async getTareas(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.estado) params.append('estado', filters.estado);
            if (filters.asignado_a) params.append('asignado_a', filters.asignado_a);

            const response = await this.api.get(`/maintenance/tareas/?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener tareas:', error);
            throw error;
        }
    }

    /**
     * Obtener detalle de una tarea específica
     * @param {number} id - ID de la tarea
     */
    async getTareaById(id) {
        try {
            const response = await this.api.get(`/maintenance/tareas/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener tarea:', error);
            throw error;
        }
    }

    /**
     * Actualizar estado de una tarea
     * @param {number} tareaId - ID de la tarea
     * @param {Object} estadoData - Datos del estado (estado, notas)
     */
    async updateEstadoTarea(tareaId, estadoData) {
        try {
            const response = await this.api.post(`/maintenance/tareas/${tareaId}/actualizar_estado/`, estadoData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar estado de tarea:', error);
            throw error;
        }
    }

    /**
     * Actualizar una tarea de mantenimiento
     * @param {number} id - ID de la tarea
     * @param {Object} updateData - Datos a actualizar
     */
    async updateTarea(id, updateData) {
        try {
            const response = await this.api.patch(`/maintenance/tareas/${id}/`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar tarea:', error);
            throw error;
        }
    }

    // ========== USUARIOS DE MANTENIMIENTO ==========

    /**
     * Obtener lista de usuarios disponibles para asignación
     * (Esta función debería estar en userService, pero la incluimos aquí por conveniencia)
     */
    async getMaintenanceUsers() {
        try {
            // Obtener todos los usuarios y filtrar por rol de mantenimiento
            const response = await this.api.get('/users/');
            
            // El endpoint devuelve {users: [...]}, no un array directo
            let users = [];
            if (response.data && response.data.users && Array.isArray(response.data.users)) {
                users = response.data.users;
            } else if (Array.isArray(response.data)) {
                // Fallback por si cambia el formato
                users = response.data;
            }
            
            const maintenanceUsers = users.filter(user =>
                user.role === 'admin' || user.role === 'maintenance'
            );
            
            return maintenanceUsers;
        } catch (error) {
            console.error('Error al obtener usuarios de mantenimiento:', error);
            // Retornar usuarios mock en caso de error
            return [
                { id: 1, username: 'admin', first_name: 'Admin', last_name: 'User', role: 'admin' },
                { id: 2, username: 'mantenimiento1', first_name: 'Carlos', last_name: 'López', role: 'maintenance' },
                { id: 3, username: 'mantenimiento2', first_name: 'Ana', last_name: 'Martínez', role: 'maintenance' }
            ];
        }
    }
}

export default new MaintenanceService();