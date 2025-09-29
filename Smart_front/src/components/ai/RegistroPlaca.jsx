import React, { useState, useRef, useEffect } from 'react';
import { Car, Camera, CheckCircle, XCircle, Loader, Plus } from 'lucide-react';
import AIService from '../../services/aiService';

const RegistroPlaca = () => {
    const [camarasDisponibles, setCamarasDisponibles] = useState([]);
    const [camaraSeleccionada, setCamaraSeleccionada] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mensajeIA, setMensajeIA] = useState('');
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState('');
    const [vehiculosRegistrados, setVehiculosRegistrados] = useState([]);

    // Datos del vehículo
    const [vehiculoData, setVehiculoData] = useState({
        placa: '',
        marca: '',
        modelo: '',
        color: '',
        descripcion: ''
    });

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Verificar compatibilidad del navegador
    const verificarCompatibilidad = () => {
        const checks = {
            getUserMedia: !!navigator.mediaDevices?.getUserMedia,
            enumerateDevices: !!navigator.mediaDevices?.enumerateDevices,
            permissions: !!navigator.permissions?.query,
            https: window.location.protocol === 'https:' || window.location.hostname === 'localhost'
        };

        console.log('Verificación de compatibilidad:', checks);

        const incompatibilidades = [];
        if (!checks.getUserMedia) incompatibilidades.push('getUserMedia API no soportada');
        if (!checks.enumerateDevices) incompatibilidades.push('enumerateDevices API no soportada');
        if (!checks.permissions) incompatibilidades.push('Permissions API no soportada');
        if (!checks.https) incompatibilidades.push('Se requiere HTTPS para acceso a cámara');

        return {
            compatible: incompatibilidades.length === 0,
            checks,
            incompatibilidades
        };
    };

    // Cargar cámaras disponibles y vehículos registrados
    useEffect(() => {
        const compatibilidad = verificarCompatibilidad();
        if (!compatibilidad.compatible) {
            setError(`Tu navegador no es compatible con las funciones de cámara: ${compatibilidad.incompatibilidades.join(', ')}`);
            return;
        }

        cargarCamaras();
        cargarVehiculosRegistrados();
    }, []);

    // Setear cámara por defecto cuando se cargan las cámaras
    useEffect(() => {
        if (camarasDisponibles.length > 0 && !camaraSeleccionada) {
            setCamaraSeleccionada(camarasDisponibles[0].deviceId);
            console.log('Cámara seleccionada por defecto:', camarasDisponibles[0].label || camarasDisponibles[0].deviceId);
        }
    }, [camarasDisponibles, camaraSeleccionada]);

    // Función de diagnóstico para la consola
    useEffect(() => {
        window.diagnosticarCamara = async () => {
            console.log('=== DIAGNÓSTICO DE CÁMARA ===');

            // Verificar APIs
            console.log('1. Verificación de APIs:');
            console.log('- navigator.mediaDevices:', !!navigator.mediaDevices);
            console.log('- getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
            console.log('- enumerateDevices:', !!navigator.mediaDevices?.enumerateDevices);
            console.log('- permissions:', !!navigator.permissions?.query);

            // Verificar HTTPS/Localhost
            console.log('2. Verificación de protocolo:');
            console.log('- Protocolo:', window.location.protocol);
            console.log('- Hostname:', window.location.hostname);
            console.log('- Es HTTPS/Localhost:', window.location.protocol === 'https:' || window.location.hostname === 'localhost');

            // Verificar permisos
            try {
                console.log('3. Verificación de permisos:');
                const permissionStatus = await navigator.permissions.query({ name: 'camera' });
                console.log('- Estado de permisos:', permissionStatus.state);
            } catch (error) {
                console.log('- Error verificando permisos:', error.message);
            }

            // Listar dispositivos
            try {
                console.log('4. Dispositivos disponibles:');
                const devices = await navigator.mediaDevices.enumerateDevices();
                const cameras = devices.filter(device => device.kind === 'videoinput');
                console.log('- Cámaras encontradas:', cameras.length);
                cameras.forEach((cam, index) => {
                    console.log(`  ${index + 1}. ${cam.label || 'Sin nombre'} (ID: ${cam.deviceId.slice(0, 8)}...)`);
                });
            } catch (error) {
                console.log('- Error listando dispositivos:', error.message);
            }

            console.log('=== FIN DIAGNÓSTICO ===');
            console.log('Para más ayuda, ejecuta: diagnosticarCamara()');
        };

        // Limpiar función al desmontar
        return () => {
            delete window.diagnosticarCamara;
        };
    }, []);

    const cargarCamaras = async () => {
        try {
            console.log('Verificando permisos de cámara...');

            // Verificar si tenemos permisos
            const permissionStatus = await navigator.permissions.query({ name: 'camera' });
            console.log('Estado de permisos de cámara:', permissionStatus.state);

            if (permissionStatus.state === 'denied') {
                setError('Los permisos de cámara están denegados. Por favor, habilita el acceso a la cámara en la configuración del navegador.');
                return;
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log('Dispositivos encontrados:', devices);

            const camaras = devices.filter(device => device.kind === 'videoinput').sort((a, b) => a.deviceId.localeCompare(b.deviceId));
            console.log('Cámaras disponibles:', camaras);

            setCamarasDisponibles(camaras);
        } catch (error) {
            console.error('Error cargando cámaras:', error);
            setError('Error al acceder a las cámaras. Verifica que tu navegador soporte acceso a cámara.');
        }
    };

    const cargarVehiculosRegistrados = async () => {
        try {
            const vehiculos = await AIService.getVehiculosRegistrados();
            console.log('Vehículos obtenidos:', vehiculos);
            // Asegurar que sea un array
            const vehiculosArray = Array.isArray(vehiculos) ? vehiculos : [];
            setVehiculosRegistrados(vehiculosArray);
        } catch (error) {
            console.error('Error cargando vehículos registrados:', error);
            setVehiculosRegistrados([]); // Resetear a array vacío en caso de error
        }
    };

    const iniciarStream = async () => {
        try {
            setError('');
            setMensajeIA('Inicializando cámara para captura de placa vehicular...');

            // Detener stream anterior si existe
            if (streamRef.current) {
                detenerStream();
            }

            console.log('Solicitando acceso a cámara:', camaraSeleccionada);

            const constraints = {
                video: {
                    deviceId: camaraSeleccionada ? { exact: camaraSeleccionada } : undefined,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            console.log('Constraints:', constraints);

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Stream obtenido:', stream);

            streamRef.current = stream;

            if (videoRef.current) {
                console.log('Asignando stream al video element');
                videoRef.current.srcObject = stream;

                // Esperar a que el video esté listo
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Timeout esperando video metadata'));
                    }, 5000);

                    videoRef.current.onloadedmetadata = () => {
                        clearTimeout(timeout);
                        console.log('Video metadata loaded, playing...');
                        videoRef.current.play().then(() => {
                            console.log('Video playing successfully');
                            resolve();
                        }).catch(reject);
                    };

                    videoRef.current.onerror = (e) => {
                        clearTimeout(timeout);
                        console.error('Video error:', e);
                        reject(new Error('Error loading video'));
                    };
                });
            } else {
                throw new Error('Video element not available');
            }

            setIsStreaming(true);
            setMensajeIA('Cámara activa. Coloca la placa del vehículo en el centro del marco y presiona "Capturar Placa" cuando esté lista.');
            // Actualizar labels de cámaras después de conceder permisos
            cargarCamaras();
        } catch (error) {
            console.error('Error iniciando stream:', error);
            let errorMessage = 'Error al acceder a la cámara. ';

            if (error.name === 'NotAllowedError') {
                errorMessage += 'Debes permitir el acceso a la cámara.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No se encontró ninguna cámara.';
            } else if (error.name === 'NotReadableError') {
                errorMessage += 'La cámara está siendo usada por otra aplicación.';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage += 'La cámara seleccionada no está disponible.';
            } else {
                errorMessage += error.message || 'Verifica los permisos.';
            }

            setError(errorMessage);
            setMensajeIA('Error al inicializar la cámara. Por favor, verifica los permisos de acceso a la cámara.');
        }
    };

    const detenerStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsStreaming(false);
    };

    const capturarPlaca = async () => {
        if (!isStreaming || !videoRef.current || !canvasRef.current) return;

        setIsProcessing(true);
        setError('');
        setResultado(null);
        setMensajeIA('Procesando imagen de placa con IA...');

        try {
            // Capturar imagen
            const imagenBase64 = AIService.captureImageFromVideo(videoRef.current, canvasRef.current);

            // Procesar con IA para extraer placa
            const resultadoLectura = await AIService.lecturaPlaca(
                imagenBase64,
                'Registro vehicular'
            );

            if (resultadoLectura.acceso_permitido) {
                // Placa ya registrada
                setError('Esta placa ya está registrada en el sistema');
                setMensajeIA(resultadoLectura.mensaje_ia);
            } else if (resultadoLectura.placa_detectada) {
                // Placa detectada pero no registrada - autocompletar
                setVehiculoData(prev => ({
                    ...prev,
                    placa: resultadoLectura.placa_detectada
                }));
                setMensajeIA(`¡Placa detectada: ${resultadoLectura.placa_detectada}! Ahora completa los datos del vehículo y registra.`);
            } else {
                // No se pudo detectar placa
                setError('No se pudo detectar la placa en la imagen');
                setMensajeIA(resultadoLectura.mensaje_ia || 'No se pudo leer la placa. Intenta nuevamente con mejor iluminación.');
            }

        } catch (error) {
            console.error('Error procesando placa:', error);
            setError(error.response?.data?.error || 'Error al procesar la placa');
            setMensajeIA(error.response?.data?.mensaje_ia || 'Error en el procesamiento. Intenta nuevamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    const registrarVehiculo = async () => {
        // Validar datos
        if (!vehiculoData.placa || !vehiculoData.marca || !vehiculoData.modelo || !vehiculoData.color) {
            setError('Por favor completa todos los campos obligatorios');
            return;
        }

        // Validar formato de placa
        const placaRegex = /^\d{3,4}[A-Z]{3}$/;
        if (!placaRegex.test(vehiculoData.placa.toUpperCase())) {
            setError('Formato de placa inválido. Use formato: 123ABC o 1234ABC');
            return;
        }

        setIsProcessing(true);
        setError('');
        setResultado(null);
        setMensajeIA('Registrando vehículo en el sistema...');

        try {
            const resultadoRegistro = await AIService.registrarVehiculo({
                ...vehiculoData,
                placa: vehiculoData.placa.toUpperCase()
            });

            setResultado(resultadoRegistro);
            setMensajeIA('¡Vehículo registrado exitosamente! Ahora puede acceder al condominio.');

            // Limpiar formulario
            setVehiculoData({
                placa: '',
                marca: '',
                modelo: '',
                color: '',
                descripcion: ''
            });

            // Recargar lista de vehículos
            await cargarVehiculosRegistrados();

        } catch (error) {
            console.error('Error registrando vehículo:', error);
            setError(error.response?.data?.placa?.[0] || error.response?.data?.error || 'Error al registrar el vehículo');
            setMensajeIA('Error en el registro. Verifica los datos e intenta nuevamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    const cambiarCamara = (deviceId) => {
        if (deviceId !== camaraSeleccionada) {
            const wasStreaming = isStreaming;
            detenerStream();
            setCamaraSeleccionada(deviceId);
            if (wasStreaming) {
                setTimeout(() => iniciarStream(), 100);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Información de Compatibilidad */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Car className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Información de Cámara
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            Asegúrate de permitir el acceso a la cámara cuando el navegador lo solicite.
                            Si no ves la vista previa, verifica los permisos del navegador.
                        </p>
                    </div>
                </div>
            </div>
            {/* Configuración de Cámara */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Configuración de Cámara
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Selección de Cámara */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cámara a Utilizar
                        </label>
                        <div className="flex space-x-2 mb-2">
                            <select
                                value={camaraSeleccionada}
                                onChange={(e) => cambiarCamara(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                {camarasDisponibles.map((camara, index) => (
                                    <option key={camara.deviceId} value={camara.deviceId}>
                                        {camara.label || `Cámara ${index + 1}`}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={cargarCamaras}
                                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
                                title="Refrescar lista de cámaras"
                            >
                                ↻
                            </button>
                        </div>
                        {camarasDisponibles.length === 0 && (
                            <p className="text-sm text-orange-600 mt-1">
                                No se encontraron cámaras disponibles. Haz clic en ↻ para refrescar.
                            </p>
                        )}
                        {camarasDisponibles.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                {camarasDisponibles.length} cámara{camarasDisponibles.length !== 1 ? 's' : ''} disponible{camarasDisponibles.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    {/* Controles de Streaming */}
                    <div className="flex items-end space-x-2">
                        {!isStreaming ? (
                            <button
                                onClick={iniciarStream}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                                disabled={camarasDisponibles.length === 0}
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Iniciar Cámara
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={detenerStream}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Detener
                                </button>
                                <button
                                    onClick={capturarPlaca}
                                    disabled={isProcessing}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center"
                                >
                                    {isProcessing ? (
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Car className="w-4 h-4 mr-2" />
                                    )}
                                    {isProcessing ? 'Procesando...' : 'Capturar Placa'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Área de Video */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" style={{ display: isStreaming ? 'block' : 'none' }}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Captura de Placa Vehicular
                </h3>

                <div className="relative max-w-4xl mx-auto">
                    <video
                        ref={videoRef}
                        className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg object-cover"
                        autoPlay
                        muted
                        playsInline
                    />
                    <canvas
                        ref={canvasRef}
                        className="hidden"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none">
                        <div className="absolute inset-8 border-2 border-dashed border-blue-300 rounded">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-sm font-medium text-center">
                                Centra la placa aquí
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        Cámara Activa
                    </div>
                    <div className="absolute bottom-2 left-2 bg-blue-500 bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                        Captura de Placa
                    </div>
                </div>
            </div>

            {/* Formulario de Datos del Vehículo */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Datos del Vehículo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Placa *
                        </label>
                        <input
                            type="text"
                            value={vehiculoData.placa}
                            onChange={(e) => handleInputChange('placa', e.target.value.toUpperCase())}
                            placeholder="Ej: 123ABC"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            maxLength={7}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Formato: 123ABC o 1234ABC
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Marca *
                        </label>
                        <input
                            type="text"
                            value={vehiculoData.marca}
                            onChange={(e) => handleInputChange('marca', e.target.value)}
                            placeholder="Ej: Toyota"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Modelo *
                        </label>
                        <input
                            type="text"
                            value={vehiculoData.modelo}
                            onChange={(e) => handleInputChange('modelo', e.target.value)}
                            placeholder="Ej: Corolla"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Color *
                        </label>
                        <input
                            type="text"
                            value={vehiculoData.color}
                            onChange={(e) => handleInputChange('color', e.target.value)}
                            placeholder="Ej: Blanco"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descripción Adicional
                        </label>
                        <textarea
                            value={vehiculoData.descripcion}
                            onChange={(e) => handleInputChange('descripcion', e.target.value)}
                            placeholder="Información adicional sobre el vehículo..."
                            rows={3}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <button
                        onClick={registrarVehiculo}
                        disabled={isProcessing || !vehiculoData.placa}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg flex items-center"
                    >
                        {isProcessing ? (
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        {isProcessing ? 'Registrando...' : 'Registrar Vehículo'}
                    </button>
                </div>
            </div>

            {/* Mensaje de IA */}
            {mensajeIA && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">AI</span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                {mensajeIA}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Resultado */}
            {resultado && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                            <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
                                Registro Exitoso
                            </h4>
                            <p className="text-sm text-green-700 dark:text-green-400">
                                Vehículo con placa {resultado.placa} registrado exitosamente
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <XCircle className="w-5 h-5 text-red-600 mr-2" />
                        <div>
                            <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                                Error
                            </h4>
                            <p className="text-sm text-red-700 dark:text-red-400">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Vehículos Registrados */}
            {vehiculosRegistrados.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Vehículos Registrados ({vehiculosRegistrados.length})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vehiculosRegistrados.map(vehiculo => (
                            <div key={vehiculo.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                                        {vehiculo.placa}
                                    </h4>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        vehiculo.activo
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    }`}>
                                        {vehiculo.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {vehiculo.marca} {vehiculo.modelo}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Color: {vehiculo.color}
                                </p>
                                {vehiculo.descripcion && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {vehiculo.descripcion}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                    Registrado: {new Date(vehiculo.fecha_registro).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistroPlaca;