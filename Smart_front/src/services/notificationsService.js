/**
 * Servicio para el Módulo 6: Notificaciones Push
 *
 * Gestiona todas las operaciones relacionadas con notificaciones push:
 * - Envío de notificaciones push a través de FCM
 * - Gestión de dispositivos
 * - Preferencias de notificación
 * - Historial de notificaciones
 */

const API_BASE_URL = 'http://localhost:8000/api/notifications';

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
// GESTIÓN DE DISPOSITIVOS
// ============================================================================

/**
 * Registrar un dispositivo para notificaciones push
 */
export const registrarDispositivo = async (tokenPush, tipoDispositivo = 'web', nombreDispositivo = null) => {
    try {
        const response = await fetch(`${API_BASE_URL}/dispositivos/registrar/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                token_push: tokenPush,
                tipo_dispositivo: tipoDispositivo,
                nombre_dispositivo: nombreDispositivo,
                activo: true
            })
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error registrando dispositivo:', error);
        throw error;
    }
};

/**
 * Desactivar un dispositivo
 */
export const desactivarDispositivo = async (dispositivoId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/dispositivos/${dispositivoId}/desactivar/`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error desactivando dispositivo:', error);
        throw error;
    }
};

/**
 * Obtener dispositivos del usuario
 */
export const getDispositivos = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/dispositivos/`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error obteniendo dispositivos:', error);
        throw error;
    }
};

// ============================================================================
// PREFERENCIAS DE NOTIFICACIÓN
// ============================================================================

/**
 * Obtener preferencias de notificación del usuario
 */
export const getPreferenciasNotificacion = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/preferencias/`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error obteniendo preferencias:', error);
        throw error;
    }
};

/**
 * Actualizar preferencias de notificación
 */
export const actualizarPreferencias = async (preferencias) => {
    try {
        const response = await fetch(`${API_BASE_URL}/preferencias/bulk_update/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ preferencias })
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error actualizando preferencias:', error);
        throw error;
    }
};

// ============================================================================
// ENVÍO DE NOTIFICACIONES
// ============================================================================

/**
 * Enviar notificación push
 */
export const enviarNotificacionPush = async (titulo, mensaje, tipo = 'general', usuariosIds = null, datosExtra = {}) => {
    try {
        const payload = {
            titulo,
            mensaje,
            tipo,
            datos_extra: datosExtra
        };

        if (usuariosIds && usuariosIds.length > 0) {
            payload.usuarios_ids = usuariosIds;
        }

        // Si hay destinatarios en datos_extra, enviar a roles específicos
        if (datosExtra.destinatarios && datosExtra.destinatarios.length > 0) {
            payload.destinatarios = datosExtra.destinatarios;
            console.log('Enviando destinatarios:', datosExtra.destinatarios);
        }

        console.log('Payload completo para enviar notificación:', payload);

        const response = await fetch(`${API_BASE_URL}/enviar-push/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error enviando notificación push:', error);
        throw error;
    }
};

/**
 * Crear notificación individual
 */
export const crearNotificacion = async (titulo, mensaje, usuarioId, tipo = 'general', prioridad = 1, datosExtra = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/crear-notificacion/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                titulo,
                mensaje,
                usuario: usuarioId,
                tipo,
                prioridad,
                datos_extra: datosExtra
            })
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error creando notificación:', error);
        throw error;
    }
};

// ============================================================================
// GESTIÓN DE NOTIFICACIONES
// ============================================================================

/**
 * Obtener notificaciones del usuario
 */
export const getNotificaciones = async (filtros = {}) => {
    try {
        const queryParams = new URLSearchParams();

        Object.entries(filtros).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        const url = `${API_BASE_URL}/notificaciones/?${queryParams.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
        throw error;
    }
};

/**
 * Marcar notificación como leída
 */
export const marcarNotificacionLeida = async (notificacionId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/notificaciones/${notificacionId}/marcar_leida/`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error marcando notificación como leída:', error);
        throw error;
    }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const marcarTodasLeidas = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/notificaciones/marcar_todas_leidas/`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error marcando todas las notificaciones como leídas:', error);
        throw error;
    }
};

/**
 * Obtener notificaciones no leídas
 */
export const getNotificacionesNoLeidas = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/notificaciones/no_leidas/`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error obteniendo notificaciones no leídas:', error);
        throw error;
    }
};

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * Endpoint de prueba para testing (solo desarrollo)
 */
export const testNotificaciones = async (titulo = 'Notificación de Prueba', mensaje = 'Esta es una notificación de prueba') => {
    try {
        const response = await fetch(`${API_BASE_URL}/test/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                titulo,
                mensaje,
                tipo: 'prueba'
            })
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error en test de notificaciones:', error);
        throw error;
    }
};

// ============================================================================
// CONSTANTES Y UTILIDADES
// ============================================================================

export const TIPOS_NOTIFICACION = {
    ACCESO_PERMITIDO: 'acceso_permitido',
    ACCESO_DENEGADO: 'acceso_denegado',
    NUEVO_MENSAJE: 'nuevo_mensaje',
    PAGO_REALIZADO: 'pago_realizado',
    PAGO_PENDIENTE: 'pago_pendiente',
    MANTENIMIENTO: 'mantenimiento',
    EMERGENCIA: 'emergencia',
    RECORDATORIO: 'recordatorio',
    GENERAL: 'general',
    AVISO: 'aviso'
};

export const PRIORIDADES_NOTIFICACION = {
    BAJA: 1,
    MEDIA: 2,
    ALTA: 3,
    URGENTE: 4,
    CRITICA: 5
};

export const TIPOS_DISPOSITIVO = {
    WEB: 'web',
    ANDROID: 'android',
    IOS: 'ios',
    DESKTOP: 'desktop'
};

// Formatear fecha para notificaciones
export const formatNotificationDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
        return `Hace ${Math.floor(diffInHours)} h`;
    } else {
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
    }
};

// Obtener icono según tipo de notificación
export const getNotificationIcon = (tipo) => {
    const icons = {
        [TIPOS_NOTIFICACION.ACCESO_PERMITIDO]: '✅',
        [TIPOS_NOTIFICACION.ACCESO_DENEGADO]: '❌',
        [TIPOS_NOTIFICACION.NUEVO_MENSAJE]: '💬',
        [TIPOS_NOTIFICACION.PAGO_REALIZADO]: '💰',
        [TIPOS_NOTIFICACION.PAGO_PENDIENTE]: '⏰',
        [TIPOS_NOTIFICACION.MANTENIMIENTO]: '🔧',
        [TIPOS_NOTIFICACION.EMERGENCIA]: '🚨',
        [TIPOS_NOTIFICACION.RECORDATORIO]: '🔔',
        [TIPOS_NOTIFICACION.AVISO]: '📢',
        [TIPOS_NOTIFICACION.GENERAL]: '📱'
    };
    return icons[tipo] || '📱';
};

// Obtener color según prioridad
export const getNotificationColor = (prioridad) => {
    const colors = {
        [PRIORIDADES_NOTIFICACION.BAJA]: 'bg-blue-100 text-blue-800',
        [PRIORIDADES_NOTIFICACION.MEDIA]: 'bg-yellow-100 text-yellow-800',
        [PRIORIDADES_NOTIFICACION.ALTA]: 'bg-orange-100 text-orange-800',
        [PRIORIDADES_NOTIFICACION.URGENTE]: 'bg-red-100 text-red-800',
        [PRIORIDADES_NOTIFICACION.CRITICA]: 'bg-red-600 text-white'
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-800';
};