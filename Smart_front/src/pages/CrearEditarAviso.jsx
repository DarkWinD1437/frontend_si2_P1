import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import communicationsService, { 
    PRIORIDADES, 
    TIPOS_DESTINATARIO,
    getPrioridadDisplay,
    getDestinatarioDisplay,
    validateAvisoData
} from '../services/communicationsService';

const CrearEditarAviso = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const initRef = useRef(false);
    const fileInputRef = useRef(null);
    
    // Estados principales
    const [formData, setFormData] = useState({
        titulo: '',
        contenido: '',
        resumen: '',
        prioridad: PRIORIDADES.MEDIA,
        tipo_destinatario: TIPOS_DESTINATARIO.TODOS,
        destinatarios_personalizados: [],
        requiere_confirmacion: false,
        fecha_vencimiento: '',
        es_fijado: false,
        adjunto: null
    });
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    
    // Estados para archivos
    const [archivoActual, setArchivoActual] = useState(null);
    const [archivoNuevo, setArchivoNuevo] = useState(null);
    const [eliminarArchivo, setEliminarArchivo] = useState(false);
    
    // Estados para destinatarios personalizados (si se implementa)
    const [usuarios, setUsuarios] = useState([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    
    // Estados de vista previa
    const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);

    // Cargar aviso para edición
    const cargarAviso = useCallback(async () => {
        if (!id || !isEditing) return;
        
        try {
            setInitialLoading(true);
            setError('');
            
            console.log('Cargando aviso para edición:', id);
            const aviso = await communicationsService.getAviso(id);
            
            setFormData({
                titulo: aviso.titulo || '',
                contenido: aviso.contenido || '',
                resumen: aviso.resumen || '',
                prioridad: aviso.prioridad || PRIORIDADES.MEDIA,
                tipo_destinatario: aviso.tipo_destinatario || TIPOS_DESTINATARIO.TODOS,
                destinatarios_personalizados: aviso.destinatarios_personalizados || [],
                requiere_confirmacion: aviso.requiere_confirmacion || false,
                fecha_vencimiento: aviso.fecha_vencimiento ? aviso.fecha_vencimiento.split('T')[0] : '',
                es_fijado: aviso.es_fijado || false,
                adjunto: null // El archivo nuevo se manejará por separado
            });
            
            // Guardar archivo actual si existe
            if (aviso.adjunto) {
                setArchivoActual({
                    nombre: aviso.adjunto_nombre || 'Archivo adjunto',
                    url: aviso.adjunto,
                    tamaño: aviso.adjunto_tamaño || 0
                });
            }
            
        } catch (error) {
            console.error('Error cargando aviso:', error);
            setError(error.message || 'Error al cargar aviso');
        } finally {
            setInitialLoading(false);
        }
    }, [id, isEditing]);

    // Función de inicialización
    const inicializar = useCallback(async () => {
        if (initRef.current) return;
        initRef.current = true;
        
        console.log('Inicializando CrearEditarAviso...', { id, isEditing });
        
        try {
            if (isEditing) {
                await cargarAviso();
            } else {
                setInitialLoading(false);
            }
        } catch (error) {
            console.error('Error en inicialización:', error);
            setError('Error al inicializar');
            setInitialLoading(false);
        }
    }, [isEditing, cargarAviso]);

    // Effect de inicialización
    useEffect(() => {
        inicializar();
        
        return () => {
            initRef.current = false;
        };
    }, [inicializar]);

    // Manejar cambios en el formulario
    const manejarCambio = (campo, valor) => {
        setFormData(prev => ({
            ...prev,
            [campo]: valor
        }));
        
        // Limpiar error de validación específico
        if (validationErrors[campo]) {
            setValidationErrors(prev => ({
                ...prev,
                [campo]: undefined
            }));
        }
    };

    // Manejar selección de archivo
    const manejarArchivoSeleccionado = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validaciones de archivo
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = [
                'image/jpeg', 'image/png', 'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ];
            
            if (file.size > maxSize) {
                setError('El archivo es muy grande. Máximo 10MB.');
                return;
            }
            
            if (!allowedTypes.includes(file.type)) {
                setError('Tipo de archivo no permitido. Solo se permiten imágenes, PDF, Word y texto.');
                return;
            }
            
            setArchivoNuevo(file);
            setEliminarArchivo(false);
        }
    };

    // Eliminar archivo nuevo seleccionado
    const eliminarArchivoNuevo = () => {
        setArchivoNuevo(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Marcar archivo actual para eliminación
    const marcarEliminarArchivoActual = () => {
        setEliminarArchivo(true);
    };

    // Cancelar eliminación de archivo actual
    const cancelarEliminarArchivo = () => {
        setEliminarArchivo(false);
    };

    // Validar formulario
    const validarFormulario = () => {
        const validation = validateAvisoData(formData);
        setValidationErrors(validation.errors);
        return validation.isValid;
    };

    // Guardar aviso
    const guardarAviso = async (estado = 'borrador') => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            
            // Validar formulario
            if (!validarFormulario()) {
                setError('Por favor corrige los errores en el formulario');
                return;
            }
            
            // Preparar datos
            const avisoData = {
                ...formData,
                estado,
                // Manejar fecha de vencimiento
                fecha_vencimiento: formData.fecha_vencimiento || null
            };
            
            // Manejar eliminación de archivo actual
            if (eliminarArchivo && archivoActual) {
                avisoData.eliminar_adjunto = true;
            }
            
            let response;
            
            if (isEditing) {
                console.log('Actualizando aviso:', id, avisoData);
                response = await communicationsService.updateAviso(id, avisoData, archivoNuevo);
            } else {
                console.log('Creando aviso:', avisoData);
                response = await communicationsService.createAviso(avisoData, archivoNuevo);
            }
            
            const accion = isEditing ? 'actualizado' : 'creado';
            const estadoTexto = estado === 'publicado' ? ' y publicado' : '';
            
            setSuccess(`Aviso ${accion}${estadoTexto} exitosamente`);
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                if (response?.id) {
                    navigate(`/comunicaciones/${response.id}`);
                } else {
                    navigate('/comunicaciones');
                }
            }, 1500);
            
        } catch (error) {
            console.error('Error guardando aviso:', error);
            setError(error.message || 'Error al guardar aviso');
        } finally {
            setLoading(false);
        }
    };

    // Guardar como borrador
    const guardarBorrador = () => {
        guardarAviso('borrador');
    };

    // Publicar aviso
    const publicarAviso = () => {
        guardarAviso('publicado');
    };

    // Limpiar mensajes
    const limpiarMensajes = () => {
        setError('');
        setSuccess('');
    };

    // Cancelar y volver
    const cancelar = () => {
        if (isEditing && id) {
            navigate(`/comunicaciones/${id}`);
        } else {
            navigate('/comunicaciones');
        }
    };

    // Formatear tamaño de archivo
    const formatearTamañoArchivo = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Renderizado condicional de loading inicial
    if (initialLoading) {
        return (
            <Layout currentSection="Comunicaciones">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">
                        {isEditing ? 'Cargando aviso...' : 'Inicializando...'}
                    </span>
                </div>
            </Layout>
        );
    }

    return (
        <Layout currentSection="Comunicaciones">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEditing ? '✏️ Editar Aviso' : '➕ Nuevo Aviso'}
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {isEditing 
                                ? 'Modifica el aviso y sus configuraciones'
                                : 'Crea un nuevo aviso para el condominio'
                            }
                        </p>
                    </div>
                    
                    <button
                        onClick={cancelar}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ✕ Cerrar
                    </button>
                </div>

                {/* Mensajes de estado */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded">
                        <div className="flex justify-between items-center">
                            <p className="text-red-700 dark:text-red-300">{error}</p>
                            <button 
                                onClick={limpiarMensajes}
                                className="text-red-400 hover:text-red-600"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded">
                        <div className="flex justify-between items-center">
                            <p className="text-green-700 dark:text-green-300">{success}</p>
                            <button 
                                onClick={limpiarMensajes}
                                className="text-green-400 hover:text-green-600"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Formulario principal */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-6 space-y-6">
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Título del Aviso *
                            </label>
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={(e) => manejarCambio('titulo', e.target.value)}
                                placeholder="Título del aviso..."
                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                                    validationErrors.titulo 
                                        ? 'border-red-300 dark:border-red-600' 
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                                maxLength={200}
                            />
                            {validationErrors.titulo && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {validationErrors.titulo}
                                </p>
                            )}
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {formData.titulo.length}/200 caracteres
                            </p>
                        </div>

                        {/* Resumen */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Resumen (Opcional)
                            </label>
                            <textarea
                                value={formData.resumen}
                                onChange={(e) => manejarCambio('resumen', e.target.value)}
                                placeholder="Breve resumen del aviso..."
                                rows={2}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                                    validationErrors.resumen 
                                        ? 'border-red-300 dark:border-red-600' 
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                                maxLength={500}
                            />
                            {validationErrors.resumen && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {validationErrors.resumen}
                                </p>
                            )}
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {formData.resumen.length}/500 caracteres
                            </p>
                        </div>

                        {/* Contenido */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Contenido del Aviso *
                            </label>
                            <textarea
                                value={formData.contenido}
                                onChange={(e) => manejarCambio('contenido', e.target.value)}
                                placeholder="Contenido completo del aviso..."
                                rows={8}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                                    validationErrors.contenido 
                                        ? 'border-red-300 dark:border-red-600' 
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                            />
                            {validationErrors.contenido && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {validationErrors.contenido}
                                </p>
                            )}
                        </div>

                        {/* Configuraciones en grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Prioridad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Prioridad
                                </label>
                                <select
                                    value={formData.prioridad}
                                    onChange={(e) => manejarCambio('prioridad', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                                >
                                    {Object.entries(PRIORIDADES).map(([key, value]) => (
                                        <option key={value} value={value} className="text-gray-500 dark:text-gray-300">
                                            {getPrioridadDisplay(value)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Destinatarios */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Destinatarios
                                </label>
                                <select
                                    value={formData.tipo_destinatario}
                                    onChange={(e) => manejarCambio('tipo_destinatario', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                                >
                                    {Object.entries(TIPOS_DESTINATARIO).map(([key, value]) => (
                                        <option key={value} value={value} className="text-gray-500 dark:text-gray-300">
                                            {getDestinatarioDisplay(value)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Fecha de vencimiento */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecha de Vencimiento (Opcional)
                            </label>
                            <input
                                type="date"
                                value={formData.fecha_vencimiento}
                                onChange={(e) => manejarCambio('fecha_vencimiento', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                                    validationErrors.fecha_vencimiento 
                                        ? 'border-red-300 dark:border-red-600' 
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                            />
                            {validationErrors.fecha_vencimiento && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {validationErrors.fecha_vencimiento}
                                </p>
                            )}
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Si se establece, el aviso se marcará como vencido automáticamente
                            </p>
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="requiere_confirmacion"
                                    checked={formData.requiere_confirmacion}
                                    onChange={(e) => manejarCambio('requiere_confirmacion', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="requiere_confirmacion" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Requiere confirmación de lectura
                                </label>
                            </div>
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="es_fijado"
                                    checked={formData.es_fijado}
                                    onChange={(e) => manejarCambio('es_fijado', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="es_fijado" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Fijar aviso (se mostrará prominentemente)
                                </label>
                            </div>
                        </div>

                        {/* Sección de archivos */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                📎 Archivo Adjunto
                            </h3>
                            
                            {/* Archivo actual (en edición) */}
                            {isEditing && archivoActual && !eliminarArchivo && (
                                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-3">📄</span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {archivoActual.nombre}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatearTamañoArchivo(archivoActual.tamaño)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <a
                                                href={archivoActual.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                👁️ Ver
                                            </a>
                                            <button
                                                onClick={marcarEliminarArchivoActual}
                                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Confirmación de eliminación */}
                            {eliminarArchivo && archivoActual && (
                                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                                El archivo será eliminado al guardar
                                            </p>
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {archivoActual.nombre}
                                            </p>
                                        </div>
                                        <button
                                            onClick={cancelarEliminarArchivo}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Archivo nuevo seleccionado */}
                            {archivoNuevo && (
                                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-3">📄</span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {archivoNuevo.name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatearTamañoArchivo(archivoNuevo.size)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={eliminarArchivoNuevo}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Selector de archivo */}
                            {(!archivoActual || eliminarArchivo) && !archivoNuevo && (
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={manejarArchivoSeleccionado}
                                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-colors"
                                    >
                                        <div className="text-4xl mb-2">📎</div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            Haz clic para seleccionar un archivo
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            JPG, PNG, GIF, PDF, Word, TXT (máx. 10MB)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                        <div className="flex justify-between">
                            <button
                                onClick={cancelar}
                                disabled={loading}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={guardarBorrador}
                                    disabled={loading}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading && <LoadingSpinner size="sm" />}
                                    📝 Guardar Borrador
                                </button>
                                
                                <button
                                    onClick={publicarAviso}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading && <LoadingSpinner size="sm" />}
                                    ✅ {isEditing ? 'Guardar y Publicar' : 'Crear y Publicar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vista previa (opcional, para implementar más tarde) */}
                {mostrarVistaPrevia && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    👁️ Vista Previa
                                </h3>
                                <button
                                    onClick={() => setMostrarVistaPrevia(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {formData.titulo || 'Título del aviso'}
                                </h4>
                                {formData.resumen && (
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                                        {formData.resumen}
                                    </p>
                                )}
                                <div className="prose dark:prose-invert max-w-none">
                                    {formData.contenido ? (
                                        <div className="whitespace-pre-wrap">
                                            {formData.contenido}
                                        </div>
                                    ) : (
                                        <p className="text-gray-400">Contenido del aviso aparecerá aquí...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CrearEditarAviso;