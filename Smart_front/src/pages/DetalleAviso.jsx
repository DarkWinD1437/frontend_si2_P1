import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import communicationsService, { 
    PRIORIDAD_COLORS,
    ESTADO_COLORS,
    formatDate,
    formatDateOnly,
    getPrioridadDisplay,
    getDestinatarioDisplay,
    getPrioridadIcon
} from '../services/communicationsService';

const DetalleAviso = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const initRef = useRef(false);
    const comentarioRef = useRef(null);
    
    // Estados principales
    const [aviso, setAviso] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estados de comentarios
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [loadingComentarios, setLoadingComentarios] = useState(false);
    const [respuestasAbiertas, setRespuestasAbiertas] = useState({});
    const [respuestaTexto, setRespuestaTexto] = useState({});
    
    // Estados de lecturas (admin)
    const [lecturas, setLecturas] = useState([]);
    const [loadingLecturas, setLoadingLecturas] = useState(false);
    const [mostrarLecturas, setMostrarLecturas] = useState(false);
    
    // Estados de acciones
    const [procesandoAccion, setProcesandoAccion] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [leido, setLeido] = useState(false);
    
    // Estados de vista
    const [vistaActiva, setVistaActiva] = useState('aviso'); // 'aviso', 'comentarios', 'lecturas'

    // Cargar aviso
    const cargarAviso = useCallback(async () => {
        if (!id) return;
        
        try {
            setLoading(true);
            setError('');
            
            console.log('Cargando aviso:', id);
            const avisoData = await communicationsService.getAviso(id);
            setAviso(avisoData);
            
            // Marcar como leído automáticamente
            if (!avisoData.usuario_ha_leido) {
                try {
                    await communicationsService.marcarAvisoLeido(id);
                    setLeido(true);
                } catch (error) {
                    console.warn('Error marcando como leído:', error);
                }
            } else {
                setLeido(true);
            }
            
        } catch (error) {
            console.error('Error cargando aviso:', error);
            setError(error.message || 'Error al cargar aviso');
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Cargar comentarios
    const cargarComentarios = useCallback(async () => {
        if (!id) return;
        
        try {
            setLoadingComentarios(true);
            console.log('Cargando comentarios del aviso:', id);
            const comentariosData = await communicationsService.getComentarios(id);
            setComentarios(comentariosData);
        } catch (error) {
            console.error('Error cargando comentarios:', error);
            setError('Error al cargar comentarios');
        } finally {
            setLoadingComentarios(false);
        }
    }, [id]);

    // Cargar lecturas (admin)
    const cargarLecturas = useCallback(async () => {
        if (!id || !mostrarLecturas) return;
        
        try {
            setLoadingLecturas(true);
            console.log('Cargando lecturas del aviso:', id);
            const lecturasData = await communicationsService.getLecturas(id);
            setLecturas(lecturasData);
        } catch (error) {
            console.error('Error cargando lecturas:', error);
            setError('Error al cargar lecturas');
        } finally {
            setLoadingLecturas(false);
        }
    }, [id, mostrarLecturas]);

    // Función de inicialización
    const inicializar = useCallback(async () => {
        if (initRef.current) return;
        initRef.current = true;
        
        console.log('Inicializando DetalleAviso...', { id });
        
        try {
            await cargarAviso();
            if (vistaActiva === 'comentarios') {
                await cargarComentarios();
            }
        } catch (error) {
            console.error('Error en inicialización:', error);
            setError('Error al inicializar');
        }
    }, [cargarAviso, cargarComentarios, vistaActiva]);

    // Effect de inicialización
    useEffect(() => {
        inicializar();
        
        return () => {
            initRef.current = false;
        };
    }, [inicializar]);

    // Effect para cargar contenido según vista activa
    useEffect(() => {
        if (!initRef.current) return;
        
        if (vistaActiva === 'comentarios' && comentarios.length === 0) {
            cargarComentarios();
        } else if (vistaActiva === 'lecturas' && !mostrarLecturas) {
            setMostrarLecturas(true);
        }
    }, [vistaActiva, comentarios.length, mostrarLecturas, cargarComentarios]);

    // Effect para cargar lecturas cuando mostrarLecturas cambia
    useEffect(() => {
        if (mostrarLecturas) {
            cargarLecturas();
        }
    }, [mostrarLecturas, cargarLecturas]);

    // Enviar comentario
    const enviarComentario = async (esRespuesta = null) => {
        const texto = esRespuesta ? respuestaTexto[esRespuesta] : nuevoComentario;
        
        if (!texto.trim()) return;
        
        try {
            setProcesandoAccion(true);
            setError('');
            
            await communicationsService.createComentario(id, texto, esRespuesta);
            
            if (esRespuesta) {
                setRespuestaTexto(prev => ({
                    ...prev,
                    [esRespuesta]: ''
                }));
                setRespuestasAbiertas(prev => ({
                    ...prev,
                    [esRespuesta]: false
                }));
            } else {
                setNuevoComentario('');
            }
            
            setSuccess('Comentario agregado exitosamente');
            await cargarComentarios();
            
            // Auto-scroll al nuevo comentario
            setTimeout(() => {
                if (comentarioRef.current) {
                    comentarioRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500);
            
        } catch (error) {
            console.error('Error enviando comentario:', error);
            setError(error.message || 'Error al enviar comentario');
        } finally {
            setProcesandoAccion(false);
        }
    };

    // Acciones de aviso
    const publicarAviso = async () => {
        try {
            setProcesandoAccion(true);
            await communicationsService.publicarAviso(id);
            setSuccess('Aviso publicado exitosamente');
            cargarAviso();
        } catch (error) {
            setError(error.message || 'Error al publicar aviso');
        } finally {
            setProcesandoAccion(false);
        }
    };

    const archivarAviso = async () => {
        try {
            setProcesandoAccion(true);
            await communicationsService.archivarAviso(id);
            setSuccess('Aviso archivado exitosamente');
            cargarAviso();
        } catch (error) {
            setError(error.message || 'Error al archivar aviso');
        } finally {
            setProcesandoAccion(false);
        }
    };

    const eliminarAviso = async () => {
        try {
            setProcesandoAccion(true);
            await communicationsService.deleteAviso(id);
            setSuccess('Aviso eliminado exitosamente');
            setTimeout(() => {
                navigate('/comunicaciones');
            }, 1500);
        } catch (error) {
            setError(error.message || 'Error al eliminar aviso');
        } finally {
            setProcesandoAccion(false);
            setMostrarModalEliminar(false);
        }
    };

    // Manejar respuesta
    const abrirRespuesta = (comentarioId) => {
        setRespuestasAbiertas(prev => ({
            ...prev,
            [comentarioId]: true
        }));
    };

    const cerrarRespuesta = (comentarioId) => {
        setRespuestasAbiertas(prev => ({
            ...prev,
            [comentarioId]: false
        }));
        setRespuestaTexto(prev => ({
            ...prev,
            [comentarioId]: ''
        }));
    };

    // Limpiar mensajes
    const limpiarMensajes = () => {
        setError('');
        setSuccess('');
    };

    // Formatear fecha relativa
    const formatearFechaRelativa = (fecha) => {
        const ahora = new Date();
        const fechaObj = new Date(fecha);
        const diferencia = ahora - fechaObj;
        
        const minutos = Math.floor(diferencia / (1000 * 60));
        const horas = Math.floor(diferencia / (1000 * 60 * 60));
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        
        if (minutos < 1) return 'Hace un momento';
        if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
        if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
        if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
        
        return formatDate(fecha);
    };

    // Renderizado condicional de loading
    if (loading) {
        return (
            <Layout currentSection="Comunicaciones">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">
                        Cargando aviso...
                    </span>
                </div>
            </Layout>
        );
    }

    // Si no se encuentra el aviso
    if (!aviso) {
        return (
            <Layout currentSection="Comunicaciones">
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">❓</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Aviso no encontrado
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        El aviso que buscas no existe o no tienes permisos para verlo.
                    </p>
                    <button
                        onClick={() => navigate('/comunicaciones')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        Volver a Comunicaciones
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout currentSection="Comunicaciones">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header con navegación */}
                <div className="flex justify-between items-start">
                    <div>
                        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <button 
                                onClick={() => navigate('/comunicaciones')}
                                className="hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                📢 Comunicaciones
                            </button>
                            <span>›</span>
                            <span>Detalle del Aviso</span>
                        </nav>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {getPrioridadIcon(aviso.prioridad)} {aviso.titulo}
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {aviso.puede_editar && (
                            <button
                                onClick={() => navigate(`/comunicaciones/${id}/editar`)}
                                className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                            >
                                ✏️ Editar
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/comunicaciones')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕ Cerrar
                        </button>
                    </div>
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

                {/* Información del aviso */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-6">
                        {/* Metadatos */}
                        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORIDAD_COLORS[aviso.prioridad] || 'bg-gray-100 text-gray-800'}`}>
                                {getPrioridadDisplay(aviso.prioridad)}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[aviso.estado] || 'bg-gray-100 text-gray-800'}`}>
                                {aviso.estado}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                                📅 {formatDate(aviso.fecha_publicacion || aviso.fecha_creacion)}
                            </span>
                            {aviso.autor_nombre && (
                                <span className="text-gray-500 dark:text-gray-400">
                                    👤 Por {aviso.autor_nombre}
                                </span>
                            )}
                            <span className="text-gray-500 dark:text-gray-400">
                                👥 {getDestinatarioDisplay(aviso.tipo_destinatario)}
                            </span>
                            {leido && (
                                <span className="text-green-600 dark:text-green-400 text-xs">
                                    ✅ Leído
                                </span>
                            )}
                        </div>

                        {/* Resumen */}
                        {aviso.resumen && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 mb-6 rounded">
                                <p className="text-blue-800 dark:text-blue-200 font-medium">
                                    {aviso.resumen}
                                </p>
                            </div>
                        )}

                        {/* Contenido principal */}
                        <div className="prose dark:prose-invert max-w-none mb-6">
                            <div className="whitespace-pre-wrap text-gray-900 dark:text-white leading-relaxed">
                                {aviso.contenido}
                            </div>
                        </div>

                        {/* Archivo adjunto */}
                        {aviso.adjunto && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    📎 Archivo Adjunto
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-3">📄</span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {aviso.adjunto_nombre || 'Archivo adjunto'}
                                                </p>
                                                {aviso.adjunto_tamaño && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {Math.round(aviso.adjunto_tamaño / 1024)} KB
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <a
                                            href={aviso.adjunto}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                                        >
                                            📥 Descargar
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Información adicional */}
                        {(aviso.fecha_vencimiento || aviso.es_fijado || aviso.requiere_confirmacion) && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    {aviso.fecha_vencimiento && (
                                        <div className="flex items-center text-orange-600 dark:text-orange-400">
                                            <span className="mr-2">⏰</span>
                                            <div>
                                                <p className="font-medium">Fecha de vencimiento</p>
                                                <p>{formatDateOnly(aviso.fecha_vencimiento)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {aviso.es_fijado && (
                                        <div className="flex items-center text-blue-600 dark:text-blue-400">
                                            <span className="mr-2">📌</span>
                                            <p className="font-medium">Aviso fijado</p>
                                        </div>
                                    )}
                                    {aviso.requiere_confirmacion && (
                                        <div className="flex items-center text-purple-600 dark:text-purple-400">
                                            <span className="mr-2">✋</span>
                                            <p className="font-medium">Requiere confirmación</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Acciones del aviso (admin) */}
                    {aviso.puede_administrar && (
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Acciones:</span>
                                    
                                    {aviso.estado === 'borrador' && (
                                        <button
                                            onClick={publicarAviso}
                                            disabled={procesandoAccion}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {procesandoAccion && <LoadingSpinner size="xs" />}
                                            ✅ Publicar
                                        </button>
                                    )}
                                    
                                    {aviso.estado === 'publicado' && (
                                        <button
                                            onClick={archivarAviso}
                                            disabled={procesandoAccion}
                                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {procesandoAccion && <LoadingSpinner size="xs" />}
                                            📦 Archivar
                                        </button>
                                    )}
                                </div>
                                
                                <button
                                    onClick={() => setMostrarModalEliminar(true)}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                >
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navegación por tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { key: 'aviso', label: '📄 Aviso', count: null },
                            { key: 'comentarios', label: '💬 Comentarios', count: aviso.total_comentarios },
                            ...(aviso.puede_administrar ? [{ key: 'lecturas', label: '👀 Lecturas', count: aviso.total_lecturas }] : [])
                        ].map(({ key, label, count }) => (
                            <button
                                key={key}
                                onClick={() => setVistaActiva(key)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                    vistaActiva === key
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                {label}
                                {count !== null && count > 0 && (
                                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                                        {count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Contenido según vista activa */}
                {vistaActiva === 'comentarios' && (
                    <div className="space-y-6">
                        {/* Formulario para nuevo comentario */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                💬 Agregar Comentario
                            </h3>
                            <div className="space-y-4">
                                <textarea
                                    ref={comentarioRef}
                                    value={nuevoComentario}
                                    onChange={(e) => setNuevoComentario(e.target.value)}
                                    placeholder="Escribe tu comentario..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => enviarComentario()}
                                        disabled={!nuevoComentario.trim() || procesandoAccion}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {procesandoAccion && <LoadingSpinner size="sm" />}
                                        📤 Enviar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Lista de comentarios */}
                        {loadingComentarios ? (
                            <div className="flex justify-center items-center py-8">
                                <LoadingSpinner />
                                <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando comentarios...</span>
                            </div>
                        ) : comentarios.length === 0 ? (
                            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                                <div className="text-4xl mb-4">💬</div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No hay comentarios
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Sé el primero en comentar este aviso
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {comentarios.map((comentario) => (
                                    <div key={comentario.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                                    {comentario.autor_nombre ? comentario.autor_nombre.charAt(0).toUpperCase() : '?'}
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {comentario.autor_nombre || 'Usuario'}
                                                        </h4>
                                                        {comentario.es_respuesta && (
                                                            <span className="text-xs text-blue-600 dark:text-blue-400">
                                                                ↳ Respuesta
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatearFechaRelativa(comentario.fecha_creacion)}
                                                    </span>
                                                </div>
                                                <div className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                                                    {comentario.contenido}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!comentario.es_respuesta && (
                                                        <button
                                                            onClick={() => respuestasAbiertas[comentario.id] 
                                                                ? cerrarRespuesta(comentario.id)
                                                                : abrirRespuesta(comentario.id)
                                                            }
                                                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            {respuestasAbiertas[comentario.id] ? 'Cancelar' : '↳ Responder'}
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                {/* Formulario de respuesta */}
                                                {respuestasAbiertas[comentario.id] && (
                                                    <div className="mt-4 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                                                        <textarea
                                                            value={respuestaTexto[comentario.id] || ''}
                                                            onChange={(e) => setRespuestaTexto(prev => ({
                                                                ...prev,
                                                                [comentario.id]: e.target.value
                                                            }))}
                                                            placeholder="Escribe tu respuesta..."
                                                            rows={2}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                                        />
                                                        <div className="flex justify-end mt-2">
                                                            <button
                                                                onClick={() => enviarComentario(comentario.id)}
                                                                disabled={!respuestaTexto[comentario.id]?.trim() || procesandoAccion}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 flex items-center gap-1"
                                                            >
                                                                {procesandoAccion && <LoadingSpinner size="xs" />}
                                                                📤 Responder
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Vista de lecturas (admin) */}
                {vistaActiva === 'lecturas' && aviso.puede_administrar && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                👀 Seguimiento de Lecturas
                            </h3>
                            
                            {loadingLecturas ? (
                                <div className="flex justify-center items-center py-8">
                                    <LoadingSpinner />
                                    <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando lecturas...</span>
                                </div>
                            ) : lecturas.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">👀</div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Sin lecturas
                                    </h4>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Aún no hay usuarios que hayan leído este aviso
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Usuario
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Fecha de Lectura
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Estado
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {lecturas.map((lectura) => (
                                                <tr key={lectura.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                                {lectura.usuario_nombre ? lectura.usuario_nombre.charAt(0).toUpperCase() : '?'}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {lectura.usuario_nombre || 'Usuario'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(lectura.fecha_lectura)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            ✅ Leído
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal de confirmación de eliminación */}
                {mostrarModalEliminar && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                            <div className="mt-3 text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                                    <span className="text-2xl">🗑️</span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                                    Eliminar Aviso
                                </h3>
                                <div className="mt-2 px-7 py-3">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        ¿Estás seguro de que deseas eliminar este aviso?
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                        Esta acción no se puede deshacer.
                                    </p>
                                </div>
                                <div className="flex gap-3 justify-center mt-4">
                                    <button
                                        onClick={() => setMostrarModalEliminar(false)}
                                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={eliminarAviso}
                                        disabled={procesandoAccion}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {procesandoAccion && <LoadingSpinner size="sm" />}
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default DetalleAviso;