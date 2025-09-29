import axios from 'axios';

// Configuración base para las APIs de IA
const API_BASE_URL = '/api/security';

class AIService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Interceptor para agregar token de autenticación
        this.client.interceptors.request.use(
            (config) => {
                // Obtener token directamente de sessionStorage
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
    }

    // ==================== GESTIÓN DE ROSTROS ====================

    /**
     * Obtener rostros registrados del usuario
     */
    async getRostrosRegistrados() {
        try {
            const response = await this.client.get('/rostros/');
            console.log('Respuesta rostros API:', response.data);
            // Manejar respuesta paginada de DRF
            return response.data.results || response.data || [];
        } catch (error) {
            console.error('Error obteniendo rostros registrados:', error);
            throw error;
        }
    }

    /**
     * Registrar un nuevo rostro usando IA
     * @param {string} imagenBase64 - Imagen en base64
     * @param {string} nombreIdentificador - Nombre descriptivo
     * @param {number} confianzaMinima - Confianza mínima (0-1)
     */
    async registrarRostro(imagenBase64, nombreIdentificador, confianzaMinima = 0.85) {
        try {
            const response = await this.client.post('/rostros/registrar_con_ia/', {
                imagen_base64: imagenBase64,
                nombre_identificador: nombreIdentificador,
                confianza_minima: confianzaMinima,
            });
            return response.data;
        } catch (error) {
            console.error('Error registrando rostro:', error);
            throw error;
        }
    }

    /**
     * Eliminar un rostro registrado
     * @param {string} rostroId - ID del rostro
     */
    async eliminarRostro(rostroId) {
        try {
            const response = await this.client.delete(`/rostros/${rostroId}/`);
            return response.data;
        } catch (error) {
            console.error('Error eliminando rostro:', error);
            throw error;
        }
    }

    // ==================== GESTIÓN DE VEHÍCULOS ====================

    /**
     * Obtener vehículos registrados del usuario
     */
    async getVehiculosRegistrados() {
        try {
            const response = await this.client.get('/vehiculos/');
            console.log('Respuesta vehículos API:', response.data);
            // Manejar respuesta paginada de DRF
            return response.data.results || response.data || [];
        } catch (error) {
            console.error('Error obteniendo vehículos registrados:', error);
            throw error;
        }
    }

    /**
     * Registrar un nuevo vehículo
     * @param {Object} vehiculoData - Datos del vehículo
     */
    async registrarVehiculo(vehiculoData) {
        try {
            const response = await this.client.post('/vehiculos/', vehiculoData);
            return response.data;
        } catch (error) {
            console.error('Error registrando vehículo:', error);
            throw error;
        }
    }

    /**
     * Actualizar vehículo registrado
     * @param {string} vehiculoId - ID del vehículo
     * @param {Object} vehiculoData - Datos actualizados
     */
    async actualizarVehiculo(vehiculoId, vehiculoData) {
        try {
            const response = await this.client.put(`/vehiculos/${vehiculoId}/`, vehiculoData);
            return response.data;
        } catch (error) {
            console.error('Error actualizando vehículo:', error);
            throw error;
        }
    }

    /**
     * Eliminar un vehículo registrado
     * @param {string} vehiculoId - ID del vehículo
     */
    async eliminarVehiculo(vehiculoId) {
        try {
            const response = await this.client.delete(`/vehiculos/${vehiculoId}/`);
            return response.data;
        } catch (error) {
            console.error('Error eliminando vehículo:', error);
            throw error;
        }
    }

    // ==================== HISTORIAL DE ACCESOS ====================

    /**
     * Obtener historial de accesos
     * @param {Object} filtros - Filtros opcionales
     */
    async getHistorialAccesos(filtros = {}) {
        try {
            const params = new URLSearchParams();

            if (filtros.tipo) params.append('tipo', filtros.tipo);
            if (filtros.estado) params.append('estado', filtros.estado);
            if (filtros.fechaDesde) params.append('fecha_desde', filtros.fechaDesde);
            if (filtros.fechaHasta) params.append('fecha_hasta', filtros.fechaHasta);

            const response = await this.client.get(`/accesos/?${params.toString()}`);
            console.log('Respuesta accesos API:', response.data);
            // Manejar respuesta paginada de DRF
            return response.data.results || response.data || [];
        } catch (error) {
            console.error('Error obteniendo historial de accesos:', error);
            throw error;
        }
    }

    // ==================== FUNCIONES DE IA ====================

    /**
     * Realizar login facial
     * @param {string} imagenBase64 - Imagen en base64
     */
    async loginFacial(imagenBase64) {
        try {
            const response = await this.client.post('/login-facial/', {
                imagen_base64: imagenBase64,
            });
            return response.data;
        } catch (error) {
            console.error('Error en login facial:', error);
            throw error;
        }
    }

    /**
     * Realizar lectura de placa vehicular
     * @param {string} imagenBase64 - Imagen de la placa en base64
     * @param {string} ubicacion - Ubicación del punto de acceso
     */
    async lecturaPlaca(imagenBase64, ubicacion = 'Entrada vehicular') {
        try {
            const response = await this.client.post('/lectura-placa/', {
                imagen_base64: imagenBase64,
                ubicacion: ubicacion,
            });
            return response.data;
        } catch (error) {
            console.error('Error en lectura de placa:', error);
            throw error;
        }
    }

    // ==================== UTILIDADES ====================

    /**
     * Convertir archivo de imagen a base64
     * @param {File} file - Archivo de imagen
     * @returns {Promise<string>} Imagen en base64
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remover el prefijo "data:image/jpeg;base64," y devolver solo el base64
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    /**
     * Capturar imagen desde webcam con mejor calidad
     * @param {HTMLVideoElement} videoElement - Elemento video
     * @param {HTMLCanvasElement} canvasElement - Elemento canvas para captura
     * @returns {string} Imagen en base64 optimizada
     */
    captureImageFromVideo(videoElement, canvasElement) {
        const context = canvasElement.getContext('2d');
        
        // Usar resolución nativa del video para mejor calidad
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        
        // Establecer tamaño del canvas al tamaño del video
        canvasElement.width = videoWidth;
        canvasElement.height = videoHeight;
        
        // Capturar imagen del video (sin efecto espejo para procesamiento)
        context.save();
        context.scale(1, 1); // Sin escala invertida para procesamiento
        context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
        context.restore();

        // Convertir a base64 con calidad optimizada para reconocimiento facial
        return canvasElement.toDataURL('image/jpeg', 0.95).split(',')[1];
    }

    /**
     * Preprocesar imagen antes del envío (mejora calidad)
     * @param {string} base64Image - Imagen en base64
     * @returns {Promise<string>} Imagen preprocesada en base64
     */
    async preprocessImage(base64Image) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Mantener resolución original para mejor calidad
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Dibujar imagen
                ctx.drawImage(img, 0, 0);
                
                // Aplicar mejoras básicas de calidad
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Mejorar contraste y brillo ligeramente
                for (let i = 0; i < data.length; i += 4) {
                    // Ajuste sutil de brillo (+5) y contraste (1.1x)
                    data[i] = Math.min(255, (data[i] - 128) * 1.1 + 128 + 5);     // Red
                    data[i + 1] = Math.min(255, (data[i + 1] - 128) * 1.1 + 128 + 5); // Green
                    data[i + 2] = Math.min(255, (data[i + 2] - 128) * 1.1 + 128 + 5); // Blue
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                // Convertir a base64 con alta calidad
                const processedBase64 = canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
                resolve(processedBase64);
            };
            img.src = `data:image/jpeg;base64,${base64Image}`;
        });
    }
}

// Exportar instancia singleton
export default new AIService();