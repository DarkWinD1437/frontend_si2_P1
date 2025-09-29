const API_BASE_URL = 'http://127.0.0.1:8000/api/finances';

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

// ==================== CONCEPTOS FINANCIEROS ====================

// Obtener todos los conceptos financieros
export const getConceptos = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/conceptos/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching conceptos:', error);
        throw error;
    }
};

// Obtener conceptos vigentes
export const getConceptosVigentes = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/conceptos/vigentes/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching conceptos vigentes:', error);
        throw error;
    }
};

// Obtener un concepto por ID
export const getConcepto = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/conceptos/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching concepto:', error);
        throw error;
    }
};

// Crear nuevo concepto financiero
export const createConcepto = async (conceptoData) => {
    try {
        // Limpiar datos antes de enviar
        const cleanData = { ...conceptoData };
        
        // Si fecha_vigencia_hasta está vacía, enviar null en lugar de cadena vacía
        if (!cleanData.fecha_vigencia_hasta || cleanData.fecha_vigencia_hasta.trim() === '') {
            cleanData.fecha_vigencia_hasta = null;
        }
        
        const response = await fetch(`${API_BASE_URL}/conceptos/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(cleanData),
        });
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error creating concepto:', error);
        throw error;
    }
};

// Actualizar concepto existente
export const updateConcepto = async (id, conceptoData) => {
    try {
        // Limpiar datos antes de enviar
        const cleanData = { ...conceptoData };

        // Asegurar que descripcion sea una cadena, no null o undefined
        if (cleanData.descripcion === null || cleanData.descripcion === undefined) {
            cleanData.descripcion = '';
        }
        
        // Si fecha_vigencia_hasta está vacía, enviar null en lugar de cadena vacía
        if (!cleanData.fecha_vigencia_hasta || cleanData.fecha_vigencia_hasta.trim() === '') {
            cleanData.fecha_vigencia_hasta = null;
        }
        
        const response = await fetch(`${API_BASE_URL}/conceptos/${id}/`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(cleanData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error updating concepto:', error);
        throw error;
    }
};// Actualizar concepto parcialmente
export const patchConcepto = async (id, conceptoData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/conceptos/${id}/`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(conceptoData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error patching concepto:', error);
        throw error;
    }
};

// Eliminar concepto
export const deleteConcepto = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/conceptos/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        
        if (response.status === 204) {
            return { message: 'Concepto eliminado exitosamente' };
        }
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error deleting concepto:', error);
        throw error;
    }
};

// Alternar estado del concepto (activo/inactivo)
export const toggleConceptoEstado = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/conceptos/${id}/toggle_estado/`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error toggling concepto estado:', error);
        throw error;
    }
};

// ==================== CARGOS FINANCIEROS ====================

// Obtener todos los cargos (admin) o propios (residente)
export const getCargos = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });
        
        const url = `${API_BASE_URL}/cargos/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching cargos:', error);
        throw error;
    }
};

// Obtener cargos del usuario actual
export const getMisCargos = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/cargos/mis_cargos/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching mis cargos:', error);
        throw error;
    }
};

// Obtener cargos vencidos
export const getCargosVencidos = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/cargos/vencidos/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching cargos vencidos:', error);
        throw error;
    }
};

// Obtener un cargo por ID
export const getCargo = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/cargos/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching cargo:', error);
        throw error;
    }
};

// Crear nuevo cargo
export const createCargo = async (cargoData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/cargos/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(cargoData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error creating cargo:', error);
        throw error;
    }
};

// Actualizar cargo
export const updateCargo = async (id, cargoData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/cargos/${id}/`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(cargoData),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error updating cargo:', error);
        throw error;
    }
};

// Eliminar cargo
export const deleteCargo = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/cargos/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        
        if (response.status === 204) {
            return { message: 'Cargo eliminado exitosamente' };
        }
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error deleting cargo:', error);
        throw error;
    }
};

// Procesar pago de un cargo
export const pagarCargo = async (id, referenciaPago, observaciones = '') => {
    try {
        const response = await fetch(`${API_BASE_URL}/cargos/${id}/pagar/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                referencia_pago: referenciaPago,
                observaciones: observaciones,
            }),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error procesando pago:', error);
        throw error;
    }
};

// Obtener resumen financiero de un usuario
export const getResumenFinanciero = async (userId = null) => {
    try {
        const endpoint = userId ? `/cargos/resumen/${userId}/` : '/cargos/resumen/';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching resumen financiero:', error);
        throw error;
    }
};

// ==================== ESTADÍSTICAS ====================

// Obtener estadísticas financieras generales (solo admin)
export const getEstadisticasFinancieras = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/estadisticas/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching estadísticas financieras:', error);
        throw error;
    }
};

// ==================== ESTADO DE CUENTA ====================

// Obtener estado de cuenta completo del residente
export const getEstadoCuenta = async (residenteId = null) => {
    try {
        let url = `${API_BASE_URL}/cargos/estado_cuenta/`;
        if (residenteId) {
            url += `?residente=${residenteId}`;
        }

        console.log('Haciendo petición a:', url);
        console.log('Headers:', getAuthHeaders());

        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response text:', errorText);
            
            if (response.status === 403) {
                throw new Error('No tiene permisos para consultar el estado de cuenta de otros residentes');
            }
            if (response.status === 404) {
                throw new Error('Endpoint no encontrado. Verifique que el backend tenga implementado el endpoint /api/finances/cargos/estado_cuenta/');
            }
            if (response.status === 401) {
                throw new Error('No está autenticado. Inicie sesión nuevamente.');
            }
            throw new Error(`Error HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('Error al obtener estado de cuenta:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Obtener estado de cuenta administrativo con filtros (solo admin)
export const getEstadoCuentaAdmin = async (filtros = {}) => {
    try {
        const params = new URLSearchParams();
        
        // Agregar filtros si existen
        Object.keys(filtros).forEach(key => {
            if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
                params.append(key, filtros[key]);
            }
        });

        const url = `${API_BASE_URL}/cargos/estado_cuenta_admin/${params.toString() ? `?${params.toString()}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('No tiene permisos de administrador para esta funcionalidad');
            }
            throw new Error(`Error al obtener estado de cuenta administrativo: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('Error al obtener estado de cuenta administrativo:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// ==================== UTILIDADES ====================

// Tipos de conceptos disponibles
export const TIPOS_CONCEPTO = {
    CUOTA_MENSUAL: 'cuota_mensual',
    CUOTA_EXTRAORDINARIA: 'cuota_extraordinaria',
    MULTA_RUIDO: 'multa_ruido',
    MULTA_MASCOTAS: 'multa_mascota',
    MULTA_ESTACIONAMIENTO: 'multa_estacionamiento',
    MULTA_AREAS_COMUNES: 'multa_areas_comunes',
    OTROS: 'otros'
};

// Estados de conceptos
export const ESTADOS_CONCEPTO = {
    ACTIVO: 'activo',
    INACTIVO: 'inactivo',
    SUSPENDIDO: 'suspendido'
};

// Estados de cargos
export const ESTADOS_CARGO = {
    PENDIENTE: 'pendiente',
    PAGADO: 'pagado',
    VENCIDO: 'vencido',
    CANCELADO: 'cancelado'
};

// Función para formatear montos
export const formatMoney = (amount) => {
    const num = parseFloat(amount || 0);
    return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB'
    }).format(num);
};

// Función para obtener el color del badge según el estado
export const getEstadoBadgeColor = (estado, tipo = 'concepto') => {
    const colorMap = {
        concepto: {
            activo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            inactivo: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
            suspendido: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
        },
        cargo: {
            pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            pagado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            vencido: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            cancelado: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        }
    };
    
    return colorMap[tipo]?.[estado] || 'bg-gray-100 text-gray-800';
};

// Función para obtener el nombre display del tipo de concepto
export const getTipoConceptoDisplay = (tipo) => {
    const displayMap = {
        cuota_mensual: 'Cuota Mensual',
        cuota_extraordinaria: 'Cuota Extraordinaria',
        multa_ruido: 'Multa por Ruido',
        multa_mascota: 'Multa por Mascota',
        multa_estacionamiento: 'Multa de Estacionamiento',
        multa_areas_comunes: 'Multa Áreas Comunes',
        otros: 'Otros'
    };
    
    return displayMap[tipo] || tipo;
};

// Función para validar datos de concepto
export const validateConceptoData = (data) => {
    const errors = {};
    
    if (!data.nombre || data.nombre.trim().length === 0) {
        errors.nombre = 'El nombre es obligatorio';
    }
    
    if (!data.tipo) {
        errors.tipo = 'El tipo es obligatorio';
    }
    
    if (!data.monto || parseFloat(data.monto) <= 0) {
        errors.monto = 'El monto debe ser mayor a 0';
    }
    
    if (!data.fecha_vigencia_desde) {
        errors.fecha_vigencia_desde = 'La fecha de inicio de vigencia es obligatoria';
    }
    
    if (data.fecha_vigencia_hasta && data.fecha_vigencia_desde) {
        if (new Date(data.fecha_vigencia_hasta) <= new Date(data.fecha_vigencia_desde)) {
            errors.fecha_vigencia_hasta = 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Función para validar datos de cargo
export const validateCargoData = (data) => {
    const errors = {};
    
    if (!data.concepto) {
        errors.concepto = 'El concepto es obligatorio';
    }
    
    if (!data.residente) {
        errors.residente = 'El residente es obligatorio';
    }
    
    if (!data.monto || parseFloat(data.monto) <= 0) {
        errors.monto = 'El monto debe ser mayor a 0';
    }
    
    if (!data.fecha_vencimiento) {
        errors.fecha_vencimiento = 'La fecha de vencimiento es obligatoria';
    }
    
    if (data.fecha_vencimiento) {
        const fechaVencimiento = new Date(data.fecha_vencimiento);
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

// Generar y descargar comprobante PDF
export const generarComprobantePDF = async (cargoId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/cargos/${cargoId}/comprobante/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        }

        // Obtener información del archivo de los headers
        const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') 
                         || `Comprobante_${cargoId}_${new Date().getTime()}.pdf`;
        const numeroComprobante = response.headers.get('X-Numero-Comprobante');
        const residente = response.headers.get('X-Residente');
        const monto = response.headers.get('X-Monto');

        // Convertir respuesta a blob
        const blob = await response.blob();
        
        // Crear URL temporal para descarga
        const url = window.URL.createObjectURL(blob);
        
        // Crear elemento de descarga temporal
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar URL temporal
        window.URL.revokeObjectURL(url);

        return {
            success: true,
            filename,
            numeroComprobante,
            residente,
            monto: parseFloat(monto),
            message: 'Comprobante descargado exitosamente'
        };

    } catch (error) {
        console.error('Error generando comprobante PDF:', error);
        throw error;
    }
};

// Obtener lista de comprobantes disponibles
export const getComprobantesDisponibles = async (filtros = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        if (filtros.residente) {
            queryParams.append('residente', filtros.residente);
        }
        if (filtros.fecha_desde) {
            queryParams.append('fecha_desde', filtros.fecha_desde);
        }
        if (filtros.fecha_hasta) {
            queryParams.append('fecha_hasta', filtros.fecha_hasta);
        }

        const url = `${API_BASE_URL}/cargos/comprobantes/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching comprobantes disponibles:', error);
        throw error;
    }
};

export default {
    // Conceptos
    getConceptos,
    getConceptosVigentes,
    getConcepto,
    createConcepto,
    updateConcepto,
    patchConcepto,
    deleteConcepto,
    toggleConceptoEstado,
    
    // Cargos
    getCargos,
    getMisCargos,
    getCargosVencidos,
    getCargo,
    createCargo,
    updateCargo,
    deleteCargo,
    pagarCargo,
    getResumenFinanciero,
    
    // Estadísticas
    getEstadisticasFinancieras,
    
    // Estado de Cuenta
    getEstadoCuenta,
    getEstadoCuentaAdmin,
    
    // Comprobantes PDF
    generarComprobantePDF,
    getComprobantesDisponibles,
    
    // Utilidades
    TIPOS_CONCEPTO,
    ESTADOS_CONCEPTO,
    ESTADOS_CARGO,
    formatMoney,
    getEstadoBadgeColor,
    getTipoConceptoDisplay,
    validateConceptoData,
    validateCargoData
};