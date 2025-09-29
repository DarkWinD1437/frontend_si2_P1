const API_BASE_URL = 'http://127.0.0.1:8000/api/reservations';

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Token ${token}` : '',
    };
};

// Función helper para manejar errores de respuesta
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

// ==================== ÁREAS COMUNES ====================

// Obtener todas las áreas comunes
export const getAreasComunes = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/areas/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching áreas comunes:', error);
        throw error;
    }
};

// Obtener detalle de un área común
export const getAreaComun = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/areas/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching área común:', error);
        throw error;
    }
};

// Consultar disponibilidad de un área
export const getDisponibilidadArea = async (areaId, fecha) => {
    try {
        const response = await fetch(`${API_BASE_URL}/areas/${areaId}/disponibilidad/?fecha=${fecha}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching disponibilidad:', error);
        throw error;
    }
};

// ==================== RESERVAS ====================

// Obtener todas las reservas (con filtros de permisos)
export const getReservas = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const url = `${API_BASE_URL}/reservas/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching reservas:', error);
        throw error;
    }
};

// Obtener reservas del usuario actual
export const getMisReservas = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/mis_reservas/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching mis reservas:', error);
        throw error;
    }
};

// Obtener detalle de una reserva
export const getReserva = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching reserva:', error);
        throw error;
    }
};

// Crear nueva reserva
export const reservarArea = async (areaId, reservaData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/areas/${areaId}/reservar/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(reservaData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error creando reserva:', error);
        throw error;
    }
};

// Confirmar reserva con pago
export const confirmarReserva = async (reservaId, datosPago = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}/confirmar/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(datosPago),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error confirmando reserva:', error);
        throw error;
    }
};

// Cancelar reserva
export const cancelarReserva = async (reservaId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}/cancelar/`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error cancelando reserva:', error);
        throw error;
    }
};

// Eliminar reserva (alias de cancelar para mejor UX)
export const eliminarReserva = cancelarReserva;

// ==================== HORARIOS ====================

// Obtener horarios disponibles
export const getHorariosDisponibles = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/horarios/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching horarios:', error);
        throw error;
    }
};

// ==================== UTILIDADES ====================

// Estados de reserva
export const ESTADOS_RESERVA = {
    PENDIENTE: 'pendiente',
    CONFIRMADA: 'confirmada',
    CANCELADA: 'cancelada',
    COMPLETADA: 'completada'
};

// Función para obtener el color del badge según el estado de reserva
export const getEstadoReservaBadgeColor = (estado) => {
    const colorMap = {
        pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        confirmada: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        cancelada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        completada: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };

    return colorMap[estado] || 'bg-gray-100 text-gray-800';
};

// Función para formatear fecha y hora
export const formatFechaHora = (fecha, hora) => {
    if (!fecha || !hora) return '';

    const fechaObj = new Date(fecha);
    const [horaStr, minStr] = hora.split(':');

    fechaObj.setHours(parseInt(horaStr), parseInt(minStr));

    return fechaObj.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Función para calcular duración en horas
export const calcularDuracion = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return 0;

    const [horaIni, minIni] = horaInicio.split(':').map(Number);
    const [horaFinNum, minFin] = horaFin.split(':').map(Number);

    const minutosIni = horaIni * 60 + minIni;
    const minutosFin = horaFinNum * 60 + minFin;

    return (minutosFin - minutosIni) / 60;
};

// Función para calcular costo total
export const calcularCostoTotal = (duracion, costoPorHora) => {
    return duracion * costoPorHora;
};

export default {
    // Áreas
    getAreasComunes,
    getAreaComun,
    getDisponibilidadArea,

    // Reservas
    getReservas,
    getMisReservas,
    getReserva,
    reservarArea,
    confirmarReserva,
    cancelarReserva,
    eliminarReserva,

    // Horarios
    getHorariosDisponibles,

    // Utilidades
    ESTADOS_RESERVA,
    getEstadoReservaBadgeColor,
    formatFechaHora,
    calcularDuracion,
    calcularCostoTotal
};