const API_BASE_URL = 'http://127.0.0.1:8000/api/analytics';

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

// ==================== REPORTES FINANCIEROS ====================

// Generar reporte financiero
export const generarReporteFinanciero = async (reporteData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes-financieros/generar_reporte/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(reporteData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error generando reporte financiero:', error);
        throw error;
    }
};

// Listar reportes financieros
export const getReportesFinancieros = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const url = `${API_BASE_URL}/reportes-financieros/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching reportes financieros:', error);
        throw error;
    }
};

// Obtener reporte financiero por ID
export const getReporteFinanciero = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes-financieros/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching reporte financiero:', error);
        throw error;
    }
};

// Eliminar reporte financiero
export const deleteReporteFinanciero = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes-financieros/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (response.status === 204) {
            return { message: 'Reporte financiero eliminado exitosamente' };
        }

        return handleResponse(response);
    } catch (error) {
        console.error('Error deleting reporte financiero:', error);
        throw error;
    }
};

// ==================== REPORTES DE SEGURIDAD ====================

// Generar reporte de seguridad
export const generarReporteSeguridad = async (reporteData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes-seguridad/generar_reporte/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(reporteData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error generando reporte de seguridad:', error);
        throw error;
    }
};

// Listar reportes de seguridad
export const getReportesSeguridad = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const url = `${API_BASE_URL}/reportes-seguridad/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching reportes de seguridad:', error);
        throw error;
    }
};

// Obtener reporte de seguridad por ID
export const getReporteSeguridad = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes-seguridad/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching reporte de seguridad:', error);
        throw error;
    }
};

// Eliminar reporte de seguridad
export const deleteReporteSeguridad = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes-seguridad/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (response.status === 204) {
            return { message: 'Reporte de seguridad eliminado exitosamente' };
        }

        return handleResponse(response);
    } catch (error) {
        console.error('Error deleting reporte de seguridad:', error);
        throw error;
    }
};

// ==================== REPORTES DE USO DE ÁREAS ====================

// Generar reporte de uso de áreas
export const generarReporteUsoAreas = async (reporteData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes-uso-areas/generar_reporte/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(reporteData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error generando reporte de uso de áreas:', error);
        throw error;
    }
};

// Listar reportes de uso de áreas
export const getReportesUsoAreas = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const url = `${API_BASE_URL}/reportes-uso-areas/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching reportes de uso de áreas:', error);
        throw error;
    }
};

// Obtener reporte de uso de áreas por ID
export const getReporteUsoAreas = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes-uso-areas/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching reporte de uso de áreas:', error);
        throw error;
    }
};

// Eliminar reporte de uso de áreas
export const deleteReporteUsoAreas = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes-uso-areas/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (response.status === 204) {
            return { message: 'Reporte de uso de áreas eliminado exitosamente' };
        }

        return handleResponse(response);
    } catch (error) {
        console.error('Error deleting reporte de uso de áreas:', error);
        throw error;
    }
};

// ==================== PREDICCIONES DE MOROSIDAD ====================

// Generar predicción de morosidad con IA
export const generarPrediccionMorosidad = async (prediccionData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/predicciones-morosidad/generar_prediccion/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(prediccionData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error generando predicción de morosidad:', error);
        throw error;
    }
};

// Listar predicciones de morosidad
export const getPrediccionesMorosidad = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const url = `${API_BASE_URL}/predicciones-morosidad/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching predicciones de morosidad:', error);
        throw error;
    }
};

// Obtener predicción de morosidad por ID
export const getPrediccionMorosidad = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/predicciones-morosidad/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching predicción de morosidad:', error);
        throw error;
    }
};

// Eliminar predicción de morosidad
export const deletePrediccionMorosidad = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/predicciones-morosidad/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (response.status === 204) {
            return { message: 'Predicción de morosidad eliminada exitosamente' };
        }

        return handleResponse(response);
    } catch (error) {
        console.error('Error deleting predicción de morosidad:', error);
        throw error;
    }
};

// ==================== GESTIÓN DE RESIDENTES ====================

// Obtener lista de residentes para predicciones individuales
export const getResidentes = async () => {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/users/residentes/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching residentes:', error);
        throw error;
    }
};

// Tipos de reportes financieros
export const TIPOS_REPORTE_FINANCIERO = {
    INGRESOS: 'ingresos',
    EGRESOS: 'egresos',
    BALANCE: 'balance',
    ESTADO_CUENTA: 'estado_cuenta',
    MOROSIDAD: 'morosidad',
    PRESUPUESTO: 'presupuesto',
};

// Periodos disponibles
export const PERIODOS_REPORTE = {
    DIARIO: 'diario',
    SEMANAL: 'semanal',
    MENSUAL: 'mensual',
    TRIMESTRAL: 'trimestral',
    ANUAL: 'anual',
};

// Formatos de salida
export const FORMATOS_REPORTE = {
    JSON: 'json',
    PDF: 'pdf',
    EXCEL: 'excel',
    CSV: 'csv',
};

// Tipos de reportes de seguridad
export const TIPOS_REPORTE_SEGURIDAD = {
    ACCESOS: 'accesos',
    INCIDENTES: 'incidentes',
    ALERTAS: 'alertas',
    PATRONES: 'patrones',
    AUDITORIA: 'auditoria',
};

// Áreas comunes para reportes
export const AREAS_COMUNES = {
    GIMNASIO: 'gimnasio',
    PISCINA: 'piscina',
    SALON_EVENTOS: 'salon_eventos',
    ESTACIONAMIENTO: 'estacionamiento',
    AREAS_VERDES: 'areas_verdes',
    TODAS: 'todas',
};

// Métricas de uso de áreas
export const METRICAS_USO_AREAS = {
    OCUPACION: 'ocupacion',
    RESERVAS: 'reservas',
    TIEMPO_PROMEDIO: 'tiempo_promedio',
    PATRONES_HORARIOS: 'patrones_horarios',
    COMPARATIVO: 'comparativo',
};

// Modelos de IA para predicciones
export const MODELOS_IA = {
    GROK_4_FAST_FREE: 'grok-4-fast-free',
};

// Niveles de confianza
export const NIVELES_CONFIANZA = {
    BAJO: 'bajo',
    MEDIO: 'medio',
    ALTO: 'alto',
    MUY_ALTO: 'muy_alto',
};

// Niveles de riesgo de morosidad
export const NIVELES_RIESGO_MOROSIDAD = {
    BAJO: 'bajo',
    MEDIO: 'medio',
    ALTO: 'alto',
};

// Función para formatear montos
export const formatMoney = (amount) => {
    const num = parseFloat(amount || 0);
    return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB'
    }).format(num);
};

// Función para formatear porcentajes
export const formatPercentage = (value) => {
    const num = parseFloat(value || 0);
    return `${num.toFixed(2)}%`;
};

// Función para formatear fechas
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// Función para formatear fechas con hora
export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Función para obtener el color del badge según el tipo de reporte
export const getTipoReporteBadgeColor = (tipo, categoria = 'financiero') => {
    const colorMap = {
        financiero: {
            ingresos: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            egresos: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            balance: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            morosidad: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            presupuesto: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            estado_cuenta: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
        },
        seguridad: {
            accesos: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
            incidentes: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            alertas: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            patrones: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            auditoria: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
        },
        areas: {
            gimnasio: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
            piscina: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            salon_eventos: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            estacionamiento: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
            areas_verdes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            todas: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
        }
    };

    return colorMap[categoria]?.[tipo] || 'bg-gray-100 text-gray-800';
};

// Función para obtener el color del badge según el nivel de riesgo
export const getRiesgoBadgeColor = (riesgo) => {
    const colorMap = {
        bajo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        medio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        alto: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    return colorMap[riesgo] || 'bg-gray-100 text-gray-800';
};

// Función para obtener el color del badge según el nivel de confianza
export const getConfianzaBadgeColor = (confianza) => {
    const colorMap = {
        bajo: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        medio: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        alto: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        muy_alto: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    };

    return colorMap[confianza] || 'bg-gray-100 text-gray-800';
};

// Función para obtener el nombre display del tipo de reporte financiero
export const getTipoReporteFinancieroDisplay = (tipo) => {
    const displayMap = {
        ingresos: 'Ingresos',
        egresos: 'Egresos',
        balance: 'Balance General',
        estado_cuenta: 'Estado de Cuenta',
        morosidad: 'Morosidad',
        presupuesto: 'Presupuesto',
    };

    return displayMap[tipo] || tipo;
};

// Función para obtener el nombre display del tipo de reporte de seguridad
export const getTipoReporteSeguridadDisplay = (tipo) => {
    const displayMap = {
        accesos: 'Accesos al Condominio',
        incidentes: 'Incidentes de Seguridad',
        alertas: 'Alertas del Sistema',
        patrones: 'Patrones de Comportamiento',
        auditoria: 'Auditoría de Seguridad',
    };

    return displayMap[tipo] || tipo;
};

// Función para obtener el nombre display del área común
export const getAreaComunDisplay = (area) => {
    const displayMap = {
        gimnasio: 'Gimnasio',
        piscina: 'Piscina',
        salon_eventos: 'Salón de Eventos',
        estacionamiento: 'Estacionamiento',
        areas_verdes: 'Áreas Verdes',
        todas: 'Todas las Áreas',
    };

    return displayMap[area] || area;
};

// Función para obtener el nombre display de la métrica
export const getMetricaDisplay = (metrica) => {
    const displayMap = {
        ocupacion: 'Tasa de Ocupación',
        reservas: 'Número de Reservas',
        tiempo_promedio: 'Tiempo Promedio de Uso',
        patrones_horarios: 'Patrones Horarios',
        comparativo: 'Comparativo Periódico',
    };

    return displayMap[metrica] || metrica;
};

// Función para obtener el nombre display del modelo de IA
export const getModeloIADisplay = (modelo) => {
    const displayMap = {
        'grok-4-fast-free': 'Grok 4 Fast Free',
    };

    return displayMap[modelo] || modelo;
};

// Función para obtener el nombre display del nivel de confianza
export const getNivelConfianzaDisplay = (nivel) => {
    const displayMap = {
        bajo: 'Bajo (60-70%)',
        medio: 'Medio (70-80%)',
        alto: 'Alto (80-90%)',
        muy_alto: 'Muy Alto (90-95%)',
    };

    return displayMap[nivel] || nivel;
};

// Función para obtener el nombre display del riesgo
export const getRiesgoDisplay = (riesgo) => {
    const displayMap = {
        bajo: 'Bajo',
        medio: 'Medio',
        alto: 'Alto',
    };

    return displayMap[riesgo] || riesgo;
};

// Función para validar datos de reporte financiero
export const validateReporteFinancieroData = (data) => {
    const errors = {};

    if (!data.titulo || data.titulo.trim().length === 0) {
        errors.titulo = 'El título es obligatorio';
    }

    if (!data.tipo) {
        errors.tipo = 'El tipo de reporte es obligatorio';
    }

    if (!data.periodo) {
        errors.periodo = 'El período es obligatorio';
    }

    if (!data.fecha_inicio) {
        errors.fecha_inicio = 'La fecha de inicio es obligatoria';
    }

    if (!data.fecha_fin) {
        errors.fecha_fin = 'La fecha de fin es obligatoria';
    }

    if (data.fecha_inicio && data.fecha_fin) {
        if (new Date(data.fecha_fin) < new Date(data.fecha_inicio)) {
            errors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Función para validar datos de reporte de seguridad
export const validateReporteSeguridadData = (data) => {
    const errors = {};

    if (!data.titulo || data.titulo.trim().length === 0) {
        errors.titulo = 'El título es obligatorio';
    }

    if (!data.tipo) {
        errors.tipo = 'El tipo de reporte es obligatorio';
    }

    if (!data.fecha_inicio) {
        errors.fecha_inicio = 'La fecha y hora de inicio son obligatorias';
    }

    if (!data.fecha_fin) {
        errors.fecha_fin = 'La fecha y hora de fin son obligatorias';
    }

    if (data.fecha_inicio && data.fecha_fin) {
        if (new Date(data.fecha_fin) <= new Date(data.fecha_inicio)) {
            errors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Función para validar datos de reporte de uso de áreas
export const validateReporteUsoAreasData = (data) => {
    const errors = {};

    if (!data.titulo || data.titulo.trim().length === 0) {
        errors.titulo = 'El título es obligatorio';
    }

    if (!data.area) {
        errors.area = 'El área común es obligatoria';
    }

    if (!data.metrica_principal) {
        errors.metrica_principal = 'La métrica principal es obligatoria';
    }

    if (!data.periodo) {
        errors.periodo = 'El período es obligatorio';
    }

    if (!data.fecha_inicio) {
        errors.fecha_inicio = 'La fecha de inicio es obligatoria';
    }

    if (!data.fecha_fin) {
        errors.fecha_fin = 'La fecha de fin es obligatoria';
    }

    if (data.fecha_inicio && data.fecha_fin) {
        if (new Date(data.fecha_fin) < new Date(data.fecha_inicio)) {
            errors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Función para validar datos de predicción de morosidad
export const validatePrediccionMorosidadData = (data) => {
    const errors = {};

    if (!data.titulo || data.titulo.trim().length === 0) {
        errors.titulo = 'El título es obligatorio';
    }

    if (!data.periodo_predicho) {
        errors.periodo_predicho = 'El período predicho es obligatorio';
    }

    if (data.tipo_prediccion === 'individual' && !data.residente_id) {
        errors.residente_id = 'Debe seleccionar un residente para predicción individual';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export default {
    // Reportes Financieros
    generarReporteFinanciero,
    getReportesFinancieros,
    getReporteFinanciero,
    deleteReporteFinanciero,

    // Reportes de Seguridad
    generarReporteSeguridad,
    getReportesSeguridad,
    getReporteSeguridad,
    deleteReporteSeguridad,

    // Reportes de Uso de Áreas
    generarReporteUsoAreas,
    getReportesUsoAreas,
    getReporteUsoAreas,
    deleteReporteUsoAreas,

    // Predicciones de Morosidad
    generarPrediccionMorosidad,
    getPrediccionesMorosidad,
    getPrediccionMorosidad,
    deletePrediccionMorosidad,

    // Gestión de Residentes
    getResidentes,

    // Utilidades
    TIPOS_REPORTE_FINANCIERO,
    PERIODOS_REPORTE,
    FORMATOS_REPORTE,
    TIPOS_REPORTE_SEGURIDAD,
    AREAS_COMUNES,
    METRICAS_USO_AREAS,
    MODELOS_IA,
    NIVELES_CONFIANZA,
    NIVELES_RIESGO_MOROSIDAD,
    formatMoney,
    formatPercentage,
    formatDate,
    formatDateTime,
    getTipoReporteBadgeColor,
    getRiesgoBadgeColor,
    getConfianzaBadgeColor,
    getTipoReporteFinancieroDisplay,
    getTipoReporteSeguridadDisplay,
    getAreaComunDisplay,
    getMetricaDisplay,
    getModeloIADisplay,
    getNivelConfianzaDisplay,
    getRiesgoDisplay,
    validateReporteFinancieroData,
    validateReporteSeguridadData,
    validateReporteUsoAreasData,
    validatePrediccionMorosidadData
};