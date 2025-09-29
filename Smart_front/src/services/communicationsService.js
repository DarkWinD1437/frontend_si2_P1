/**
 * Servicio para el Módulo 3: Comunicación Básica
 * T1: Publicar Aviso General
 * 
 * Gestiona todas las operaciones relacionadas con avisos del condominio:
 * - CRUD// Obtener // Obtener aviso específico
export const getAviso = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching aviso:', error);
        throw error;
    }
};ico
export const getAviso = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching aviso:', error);
        throw error;
    }
};* - Sistema de comentarios
 * - Seguimiento de lecturas
 * - Filtros y búsquedas
 * - Estadísticas
 */

const API_BASE_URL = 'http://localhost:8000/api/communications';

// Obtener headers de autenticación
const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        console.warn('No token found in sessionStorage');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Token ${token}` : '',
    };
};

// Obtener headers para archivos
const getFileHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Authorization': token ? `Token ${token}` : '',
    };
};

// Manejar respuestas HTTP
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.detail || errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
    }
    
    const data = await response.json().catch(() => ({}));
    return data;
};

// ============================================================================
// CONSTANTES Y UTILIDADES
// ============================================================================

export const PRIORIDADES = {
    BAJA: 'baja',
    MEDIA: 'media',
    ALTA: 'alta',
    URGENTE: 'urgente'
};

export const ESTADOS_AVISO = {
    BORRADOR: 'borrador',
    PUBLICADO: 'publicado',
    ARCHIVADO: 'archivado',
    VENCIDO: 'vencido'
};

export const TIPOS_DESTINATARIO = {
    TODOS: 'todos',
    RESIDENTES: 'residentes',
    ADMINISTRADORES: 'administradores',
    SEGURIDAD: 'seguridad',
    ADMIN_SEGURIDAD: 'admin_seguridad',
    RESIDENTES_SEGURIDAD: 'residentes_seguridad',
    PERSONALIZADO: 'personalizado'
};

export const PRIORIDAD_COLORS = {
    [PRIORIDADES.BAJA]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    [PRIORIDADES.MEDIA]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [PRIORIDADES.ALTA]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [PRIORIDADES.URGENTE]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export const ESTADO_COLORS = {
    [ESTADOS_AVISO.BORRADOR]: 'bg-gray-100 text-gray-800',
    [ESTADOS_AVISO.PUBLICADO]: 'bg-green-100 text-green-800',
    [ESTADOS_AVISO.ARCHIVADO]: 'bg-yellow-100 text-yellow-800',
    [ESTADOS_AVISO.VENCIDO]: 'bg-red-100 text-red-800'
};

// Formatear fecha
export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Formatear fecha solo
export const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES');
};

// Obtener display de prioridad
export const getPrioridadDisplay = (prioridad) => {
    const displays = {
        [PRIORIDADES.BAJA]: 'Baja',
        [PRIORIDADES.MEDIA]: 'Media',
        [PRIORIDADES.ALTA]: 'Alta',
        [PRIORIDADES.URGENTE]: 'Urgente'
    };
    return displays[prioridad] || prioridad;
};

// Obtener display de destinatario
export const getDestinatarioDisplay = (tipo) => {
    const displays = {
        [TIPOS_DESTINATARIO.TODOS]: 'Todos los usuarios',
        [TIPOS_DESTINATARIO.RESIDENTES]: 'Solo residentes',
        [TIPOS_DESTINATARIO.ADMINISTRADORES]: 'Solo administradores',
        [TIPOS_DESTINATARIO.SEGURIDAD]: 'Solo seguridad',
        [TIPOS_DESTINATARIO.ADMIN_SEGURIDAD]: 'Administradores y seguridad',
        [TIPOS_DESTINATARIO.RESIDENTES_SEGURIDAD]: 'Residentes y seguridad',
        [TIPOS_DESTINATARIO.PERSONALIZADO]: 'Selección personalizada'
    };
    return displays[tipo] || tipo;
};

// Obtener icono de prioridad
export const getPrioridadIcon = (prioridad) => {
    const icons = {
        [PRIORIDADES.BAJA]: '📄',
        [PRIORIDADES.MEDIA]: '📋',
        [PRIORIDADES.ALTA]: '⚠️',
        [PRIORIDADES.URGENTE]: '🚨'
    };
    return icons[prioridad] || '📄';
};

// ============================================================================
// FUNCIONES PRINCIPALES DE AVISOS
// ============================================================================

// Listar avisos con filtros
export const getAvisos = async (filtros = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        // Aplicar filtros
        if (filtros.prioridad) queryParams.append('prioridad', filtros.prioridad);
        if (filtros.tipo_destinatario) queryParams.append('tipo_destinatario', filtros.tipo_destinatario);
        if (filtros.autor) queryParams.append('autor', filtros.autor);
        if (filtros.busqueda) queryParams.append('busqueda', filtros.busqueda);
        if (filtros.mostrar_todos) queryParams.append('mostrar_todos', filtros.mostrar_todos);
        if (filtros.page) queryParams.append('page', filtros.page);
        if (filtros.page_size) queryParams.append('page_size', filtros.page_size);
        
        const url = `${API_BASE_URL}/avisos/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching avisos:', error);
        throw error;
    }
};

// Obtener aviso por ID
export const getAviso = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching aviso:', error);
        throw error;
    }
};

// Crear nuevo aviso
export const createAviso = async (avisoData, archivo = null) => {
    try {
        let body;
        let headers = getAuthHeaders();
        
        if (archivo) {
            // Con archivo adjunto
            const formData = new FormData();
            
            // Agregar campos del aviso
            Object.keys(avisoData).forEach(key => {
                if (avisoData[key] !== null && avisoData[key] !== undefined) {
                    if (Array.isArray(avisoData[key])) {
                        formData.append(key, JSON.stringify(avisoData[key]));
                    } else {
                        formData.append(key, avisoData[key]);
                    }
                }
            });
            
            // Agregar archivo
            formData.append('adjunto', archivo);
            
            body = formData;
            headers = getFileHeaders(); // Sin Content-Type para FormData
        } else {
            // Sin archivo
            body = JSON.stringify(avisoData);
        }
        
        const response = await fetch(`${API_BASE_URL}/avisos/`, {
            method: 'POST',
            headers,
            body,
        });
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error creating aviso:', error);
        throw error;
    }
};

// Actualizar aviso
export const updateAviso = async (id, avisoData, archivo = null) => {
    try {
        let body;
        let headers = getAuthHeaders();
        
        if (archivo) {
            // Con archivo adjunto
            const formData = new FormData();
            
            // Agregar campos del aviso
            Object.keys(avisoData).forEach(key => {
                if (avisoData[key] !== null && avisoData[key] !== undefined) {
                    if (Array.isArray(avisoData[key])) {
                        formData.append(key, JSON.stringify(avisoData[key]));
                    } else {
                        formData.append(key, avisoData[key]);
                    }
                }
            });
            
            // Agregar archivo
            formData.append('adjunto', archivo);
            
            body = formData;
            headers = getFileHeaders();
        } else {
            body = JSON.stringify(avisoData);
        }
        
        const response = await fetch(`${API_BASE_URL}/avisos/${id}/`, {
            method: 'PUT',
            headers,
            body,
        });
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error updating aviso:', error);
        throw error;
    }
};

// Actualización parcial de aviso
export const patchAviso = async (id, avisoData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${id}/`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(avisoData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error patching aviso:', error);
        throw error;
    }
};

// Eliminar aviso
export const deleteAviso = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        
        if (response.status === 204) {
            return { success: true };
        }
        
        if (response.status === 404) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'El aviso no existe o ya fue eliminado');
        }
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error deleting aviso:', error);
        if (error.message.includes('fetch')) {
            throw new Error('Error de conexión. Verifique que el servidor esté funcionando.');
        }
        throw error;
    }
};

// ============================================================================
// ACCIONES ESPECIALES DE AVISOS
// ============================================================================

// Publicar aviso
export const publicarAviso = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${id}/publicar/`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error publishing aviso:', error);
        throw error;
    }
};

// Archivar aviso
export const archivarAviso = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${id}/archivar/`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error archiving aviso:', error);
        throw error;
    }
};

// Marcar aviso como leído
export const marcarAvisoLeido = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${id}/marcar_leido/`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error marking aviso as read:', error);
        throw error;
    }
};

// ============================================================================
// COMENTARIOS
// ============================================================================

// Obtener comentarios de un aviso
export const getComentarios = async (avisoId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${avisoId}/comentarios/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching comentarios:', error);
        throw error;
    }
};

// Crear comentario
export const createComentario = async (avisoId, contenido, esRespuesta = null) => {
    try {
        const data = {
            contenido,
            ...(esRespuesta && { es_respuesta: esRespuesta })
        };
        
        const response = await fetch(`${API_BASE_URL}/avisos/${avisoId}/comentarios/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error creating comentario:', error);
        throw error;
    }
};

// ============================================================================
// LECTURAS Y ESTADÍSTICAS
// ============================================================================

// Obtener lecturas de un aviso (admin)
export const getLecturas = async (avisoId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/${avisoId}/lecturas/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching lecturas:', error);
        throw error;
    }
};

// Obtener estadísticas generales (admin)
export const getEstadisticas = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/estadisticas/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching estadisticas:', error);
        throw error;
    }
};

// ============================================================================
// VISTAS ESPECIALIZADAS
// ============================================================================

// Obtener mis avisos creados
export const getMisAvisos = async (filtros = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        if (filtros.estado) queryParams.append('estado', filtros.estado);
        if (filtros.page) queryParams.append('page', filtros.page);
        
        const url = `${API_BASE_URL}/avisos/mis_avisos/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching mis avisos:', error);
        throw error;
    }
};

// Obtener avisos no leídos
export const getAvisosNoLeidos = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/no_leidos/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching avisos no leidos:', error);
        throw error;
    }
};

// Obtener dashboard personalizado
export const getDashboard = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/dashboard/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        throw error;
    }
};

// ============================================================================
// BÚSQUEDAS Y FILTROS AVANZADOS
// ============================================================================

// Búsqueda inteligente
export const busquedaInteligente = async (query) => {
    try {
        const response = await fetch(`${API_BASE_URL}/avisos/busqueda_inteligente/?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error in smart search:', error);
        throw error;
    }
};

// Filtros avanzados
export const getFiltrosAvanzados = async (filtros = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        // Múltiples filtros
        if (filtros.fecha_desde) queryParams.append('fecha_desde', filtros.fecha_desde);
        if (filtros.fecha_hasta) queryParams.append('fecha_hasta', filtros.fecha_hasta);
        if (filtros.palabras_clave) queryParams.append('palabras_clave', filtros.palabras_clave);
        if (filtros.prioridades) queryParams.append('prioridades', filtros.prioridades);
        if (filtros.estado_lectura) queryParams.append('estado_lectura', filtros.estado_lectura);
        if (filtros.requiere_confirmacion) queryParams.append('requiere_confirmacion', filtros.requiere_confirmacion);
        if (filtros.solo_fijados) queryParams.append('solo_fijados', filtros.solo_fijados);
        if (filtros.orden) queryParams.append('orden', filtros.orden);
        
        const url = `${API_BASE_URL}/avisos/filtros_avanzados/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching advanced filters:', error);
        throw error;
    }
};

// ============================================================================
// VALIDACIONES
// ============================================================================

// Validar datos de aviso
export const validateAvisoData = (avisoData) => {
    const errors = {};
    
    // Campo título requerido
    if (!avisoData.titulo || avisoData.titulo.trim() === '') {
        errors.titulo = 'El título es requerido';
    } else if (avisoData.titulo.length > 200) {
        errors.titulo = 'El título no puede exceder 200 caracteres';
    }
    
    // Campo contenido requerido
    if (!avisoData.contenido || avisoData.contenido.trim() === '') {
        errors.contenido = 'El contenido es requerido';
    } else if (avisoData.contenido.length < 10) {
        errors.contenido = 'El contenido debe tener al menos 10 caracteres';
    }
    
    // Validar resumen si está presente
    if (avisoData.resumen && avisoData.resumen.length > 500) {
        errors.resumen = 'El resumen no puede exceder 500 caracteres';
    }
    
    // Validar prioridad
    if (avisoData.prioridad && !Object.values(PRIORIDADES).includes(avisoData.prioridad)) {
        errors.prioridad = 'Prioridad inválida';
    }
    
    // Validar tipo de destinatario
    if (avisoData.tipo_destinatario && !Object.values(TIPOS_DESTINATARIO).includes(avisoData.tipo_destinatario)) {
        errors.tipo_destinatario = 'Tipo de destinatario inválido';
    }
    
    // Validar fecha de vencimiento
    if (avisoData.fecha_vencimiento) {
        const fechaVencimiento = new Date(avisoData.fecha_vencimiento);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaVencimiento < hoy) {
            errors.fecha_vencimiento = 'La fecha de vencimiento no puede ser anterior a hoy';
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
    // Avisos CRUD
    getAvisos,
    getAviso,
    createAviso,
    updateAviso,
    patchAviso,
    deleteAviso,
    
    // Acciones especiales
    publicarAviso,
    archivarAviso,
    marcarAvisoLeido,
    
    // Comentarios
    getComentarios,
    createComentario,
    
    // Lecturas y estadísticas
    getLecturas,
    getEstadisticas,
    
    // Vistas especializadas
    getMisAvisos,
    getAvisosNoLeidos,
    getDashboard,
    
    // Búsquedas y filtros
    busquedaInteligente,
    getFiltrosAvanzados,
    
    // Constantes
    PRIORIDADES,
    ESTADOS_AVISO,
    TIPOS_DESTINATARIO,
    PRIORIDAD_COLORS,
    ESTADO_COLORS,
    
    // Utilidades
    formatDate,
    formatDateOnly,
    getPrioridadDisplay,
    getDestinatarioDisplay,
    getPrioridadIcon,
    validateAvisoData
};