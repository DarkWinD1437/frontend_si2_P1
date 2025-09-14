import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import communicationsService, { 
    PRIORIDADES, 
    ESTADOS_AVISO, 
    TIPOS_DESTINATARIO,
    PRIORIDAD_COLORS,
    ESTADO_COLORS,
    formatDate,
    formatDateOnly,
    getPrioridadDisplay,
    getDestinatarioDisplay,
    getPrioridadIcon
} from '../services/communicationsService';
import { useNavigate } from 'react-router-dom';

const GestionAvisos = () => {
    const navigate = useNavigate();
    const initRef = useRef(false);
    
    // Estados principales
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estados de filtros
    const [filtros, setFiltros] = useState({
        busqueda: '',
        prioridad: '',
        tipo_destinatario: '',
        autor: '',
        mostrar_todos: false
    });
    
    // Estados de paginación
    const [paginacion, setPaginacion] = useState({
        page: 1,
        page_size: 10,
        total: 0,
        total_pages: 0
    });
    
    // Estados del dashboard y estadísticas
    const [dashboard, setDashboard] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);
    const [vista, setVista] = useState('lista'); // 'lista', 'dashboard', 'estadisticas'
    
    // Estados de selección
    const [avisosSeleccionados, setAvisosSeleccionados] = useState([]);
    const [avisoAEliminar, setAvisoAEliminar] = useState(null);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    
    // Estados de acciones masivas
    const [accionMasiva, setAccionMasiva] = useState('');
    const [procesandoAccionMasiva, setProcesandoAccionMasiva] = useState(false);

    // Función para cargar avisos
    const cargarAvisos = useCallback(async () => {
        if (loading) return;
        
        try {
            setLoading(true);
            setError('');
            
            const filtrosActivos = {
                ...filtros,
                page: paginacion.page,
                page_size: paginacion.page_size
            };
            
            // Limpiar filtros vacíos
            Object.keys(filtrosActivos).forEach(key => {
                if (filtrosActivos[key] === '' || filtrosActivos[key] === null) {
                    delete filtrosActivos[key];
                }
            });
            
            console.log('Cargando avisos con filtros:', filtrosActivos);
            // console.log('Token en localStorage:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
            
            const response = await communicationsService.getAvisos(filtrosActivos);
            
            if (response?.results) {
                setAvisos(response.results);
                setPaginacion(prev => ({
                    ...prev,
                    total: response.count || 0,
                    total_pages: Math.ceil((response.count || 0) / prev.page_size)
                }));
                console.log(`Cargados ${response.results.length} avisos de ${response.count} total`);
            } else {
                setAvisos(response || []);
                console.log(`Cargados ${response?.length || 0} avisos (sin paginación)`);
            }
            
        } catch (error) {
            console.error('Error cargando avisos:', error);
            console.error('Status:', error.status);
            console.error('Data:', error.data);
            setError(`Error al cargar avisos: ${error.message}`);
            setAvisos([]);
        } finally {
            setLoading(false);
            if (initialLoading) {
                setInitialLoading(false);
            }
        }
    }, [filtros, paginacion.page, paginacion.page_size]);
    
    // Función para cargar dashboard
    const cargarDashboard = useCallback(async () => {
        try {
            console.log('Cargando dashboard...');
            const response = await communicationsService.getDashboard();
            setDashboard(response);
        } catch (error) {
            console.error('Error cargando dashboard:', error);
            setError('Error al cargar dashboard');
        }
    }, []);
    
    // Función para cargar estadísticas
    const cargarEstadisticas = useCallback(async () => {
        try {
            console.log('Cargando estadísticas...');
            const response = await communicationsService.getEstadisticas();
            setEstadisticas(response);
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            setError('Error al cargar estadísticas');
        }
    }, []);

    // Effect de inicialización
    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;
        
        // console.log('Inicializando GestionAvisos...');
        
        const inicializar = async () => {
            try {
                // Cargar vista según selección
                if (vista === 'dashboard') {
                    await Promise.all([cargarAvisos(), cargarDashboard()]);
                } else if (vista === 'estadisticas') {
                    await Promise.all([cargarAvisos(), cargarEstadisticas()]);
                } else {
                    await cargarAvisos();
                }
            } catch (error) {
                console.error('Error en inicialización:', error);
                setError('Error al inicializar');
                setInitialLoading(false);
            }
        };
        
        inicializar();
        
        return () => {
            initRef.current = false;
        };
    }, []); // Solo ejecutar una vez al montar

    // Effect para recargar al cambiar vista
    useEffect(() => {
        if (!initRef.current) return;
        
        if (vista === 'dashboard' && !dashboard) {
            cargarDashboard();
        } else if (vista === 'estadisticas' && !estadisticas) {
            cargarEstadisticas();
        }
    }, [vista]); // Simplificar dependencias

    // Manejar cambios de filtros
    const manejarCambioFiltro = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
        setPaginacion(prev => ({
            ...prev,
            page: 1
        }));
    };

    // Manejar búsqueda
    const manejarBusqueda = (e) => {
        e.preventDefault();
        cargarAvisos();
    };

    // Limpiar filtros
    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            prioridad: '',
            tipo_destinatario: '',
            autor: '',
            mostrar_todos: false
        });
        setPaginacion(prev => ({
            ...prev,
            page: 1
        }));
    };

    // Manejar cambio de página
    const cambiarPagina = (nuevaPagina) => {
        setPaginacion(prev => ({
            ...prev,
            page: nuevaPagina
        }));
    };

    // Selección de avisos
    const manejarSeleccionAviso = (avisoId, seleccionado) => {
        if (seleccionado) {
            setAvisosSeleccionados(prev => [...prev, avisoId]);
        } else {
            setAvisosSeleccionados(prev => prev.filter(id => id !== avisoId));
        }
    };

    // Seleccionar todos
    const seleccionarTodos = () => {
        if (avisosSeleccionados.length === avisos.length) {
            setAvisosSeleccionados([]);
        } else {
            setAvisosSeleccionados(avisos.map(aviso => aviso.id));
        }
    };

    // Acciones de aviso
    const publicarAviso = async (avisoId) => {
        try {
            setLoading(true);
            await communicationsService.publicarAviso(avisoId);
            setSuccess('Aviso publicado exitosamente');
            cargarAvisos();
        } catch (error) {
            setError(error.message || 'Error al publicar aviso');
        } finally {
            setLoading(false);
        }
    };

    const archivarAviso = async (avisoId) => {
        try {
            setLoading(true);
            await communicationsService.archivarAviso(avisoId);
            setSuccess('Aviso archivado exitosamente');
            cargarAvisos();
        } catch (error) {
            setError(error.message || 'Error al archivar aviso');
        } finally {
            setLoading(false);
        }
    };

    const eliminarAviso = async (avisoId) => {
        try {
            setLoading(true);
            await communicationsService.deleteAviso(avisoId);
            setSuccess('Aviso eliminado exitosamente');
            setMostrarModalEliminar(false);
            setAvisoAEliminar(null);
            cargarAvisos();
        } catch (error) {
            console.error('Error al eliminar aviso:', error);
            setMostrarModalEliminar(false);
            setAvisoAEliminar(null);
            
            if (error.message.includes('no existe') || error.message.includes('ya fue eliminado')) {
                setError('El aviso no existe o ya fue eliminado. Actualizando la lista...');
                // Actualizar la lista después de un breve delay
                setTimeout(() => {
                    cargarAvisos();
                }, 1500);
            } else {
                setError(error.message || 'Error al eliminar aviso');
            }
        } finally {
            setLoading(false);
        }
    };

    // Acciones masivas
    const ejecutarAccionMasiva = async () => {
        if (!accionMasiva || avisosSeleccionados.length === 0) return;
        
        try {
            setProcesandoAccionMasiva(true);
            
            const promesas = avisosSeleccionados.map(avisoId => {
                switch (accionMasiva) {
                    case 'publicar':
                        return communicationsService.publicarAviso(avisoId);
                    case 'archivar':
                        return communicationsService.archivarAviso(avisoId);
                    case 'eliminar':
                        return communicationsService.deleteAviso(avisoId);
                    default:
                        return Promise.resolve();
                }
            });
            
            await Promise.all(promesas);
            
            setSuccess(`Acción ${accionMasiva} ejecutada en ${avisosSeleccionados.length} avisos`);
            setAvisosSeleccionados([]);
            setAccionMasiva('');
            cargarAvisos();
        } catch (error) {
            setError(error.message || 'Error al ejecutar acción masiva');
        } finally {
            setProcesandoAccionMasiva(false);
        }
    };

    // Limpiar mensajes
    const limpiarMensajes = () => {
        setError('');
        setSuccess('');
    };

    // Renderizado condicional de loading inicial
    if (initialLoading) {
        return (
            <Layout currentSection="Comunicaciones">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">
                        Cargando gestión de avisos...
                    </span>
                </div>
            </Layout>
        );
    }

    return (
        <Layout currentSection="Comunicaciones">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            📢 Gestión de Avisos
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Administra todos los avisos del condominio
                        </p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/comunicaciones/crear')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            ➕ Nuevo Aviso
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

                {/* Navegación de vistas */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { key: 'lista', label: '📋 Lista de Avisos' },
                            { key: 'dashboard', label: '📊 Dashboard' },
                            { key: 'estadisticas', label: '📈 Estadísticas' }
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setVista(key)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    vista === key
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Dashboard */}
                {vista === 'dashboard' && dashboard && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Avisos', value: dashboard.total_avisos, icon: '📢', color: 'blue' },
                            { label: 'Publicados', value: dashboard.publicados, icon: '✅', color: 'green' },
                            { label: 'Borradores', value: dashboard.borradores, icon: '📝', color: 'yellow' },
                            { label: 'No Leídos', value: dashboard.no_leidos, icon: '🔔', color: 'red' }
                        ].map((stat, index) => (
                            <div key={index} className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-${stat.color}-500`}>
                                <div className="flex items-center">
                                    <div className="text-2xl mr-3">{stat.icon}</div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {stat.label}
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Estadísticas */}
                {vista === 'estadisticas' && estadisticas && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            📊 Estadísticas Detalladas
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Por Prioridad</h4>
                                {Object.entries(estadisticas.por_prioridad || {}).map(([prioridad, count]) => (
                                    <div key={prioridad} className="flex justify-between py-1">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {getPrioridadIcon(prioridad)} {getPrioridadDisplay(prioridad)}
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Por Estado</h4>
                                {Object.entries(estadisticas.por_estado || {}).map(([estado, count]) => (
                                    <div key={estado} className="flex justify-between py-1">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {estado}
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Lecturas</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600 dark:text-gray-400">Total lecturas</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {estadisticas.total_lecturas || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600 dark:text-gray-400">Promedio por aviso</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {estadisticas.promedio_lecturas || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtros y búsqueda */}
                {vista === 'lista' && (
                    <>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <form onSubmit={manejarBusqueda} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Búsqueda
                                        </label>
                                        <input
                                            type="text"
                                            value={filtros.busqueda}
                                            onChange={(e) => manejarCambioFiltro('busqueda', e.target.value)}
                                            placeholder="Título, contenido..."
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Prioridad
                                        </label>
                                        <select
                                            value={filtros.prioridad}
                                            onChange={(e) => manejarCambioFiltro('prioridad', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                                        >
                                            <option value="" className="text-gray-500 dark:text-gray-300">Todas las prioridades</option>
                                            {Object.entries(PRIORIDADES).map(([key, value]) => (
                                                <option key={value} value={value} className="text-gray-500 dark:text-gray-300">
                                                    {getPrioridadDisplay(value)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Destinatario
                                        </label>
                                        <select
                                            value={filtros.tipo_destinatario}
                                            onChange={(e) => manejarCambioFiltro('tipo_destinatario', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                                        >
                                            <option value="" className="text-gray-500 dark:text-gray-300">Todos los destinatarios</option>
                                            {Object.entries(TIPOS_DESTINATARIO).map(([key, value]) => (
                                                <option key={value} value={value} className="text-gray-500 dark:text-gray-300">
                                                    {getDestinatarioDisplay(value)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="flex items-end">
                                        <div className="w-full space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="mostrar_todos"
                                                    checked={filtros.mostrar_todos}
                                                    onChange={(e) => manejarCambioFiltro('mostrar_todos', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="mostrar_todos" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                    Mostrar archivados
                                                </label>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={limpiarFiltros}
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Limpiar filtros
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading && <LoadingSpinner size="sm" />}
                                        🔍 Buscar
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Acciones masivas */}
                        {avisosSeleccionados.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-blue-700 dark:text-blue-300">
                                            {avisosSeleccionados.length} aviso(s) seleccionado(s)
                                        </span>
                                        <select
                                            value={accionMasiva}
                                            onChange={(e) => setAccionMasiva(e.target.value)}
                                            className="px-3 py-1 border border-blue-300 dark:border-blue-600 rounded dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                                        >
                                            <option value="" className="text-gray-500 dark:text-gray-300">Seleccionar acción</option>
                                            <option value="publicar" className="text-gray-500 dark:text-gray-300">Publicar</option>
                                            <option value="archivar" className="text-gray-500 dark:text-gray-300">Archivar</option>
                                            <option value="eliminar" className="text-gray-500 dark:text-gray-300">Eliminar</option>
                                        </select>
                                        <button
                                            onClick={ejecutarAccionMasiva}
                                            disabled={!accionMasiva || procesandoAccionMasiva}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {procesandoAccionMasiva && <LoadingSpinner size="sm" />}
                                            Ejecutar
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setAvisosSeleccionados([])}
                                        className="text-blue-400 hover:text-blue-600"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tabla de avisos */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Lista de Avisos
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={seleccionarTodos}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {avisosSeleccionados.length === avisos.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                                        </button>
                                        <button
                                            onClick={() => cargarAvisos()}
                                            disabled={loading}
                                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                        >
                                            🔄 Actualizar
                                        </button>
                                    </div>
                                </div>
                                {filtros.mostrar_todos && (
                                    <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded">
                                        <div className="flex items-start">
                                            <div className="text-amber-500 mr-2">ℹ️</div>
                                            <div>
                                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                                    <strong>Mostrando avisos archivados:</strong> Los avisos archivados se muestran con un icono 📁 
                                                    y no están disponibles para visualización o edición. Solo se muestran con fines de referencia.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {loading && !initialLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <LoadingSpinner />
                                    <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando avisos...</span>
                                </div>
                            ) : avisos.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">📭</div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No hay avisos
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        No se encontraron avisos con los filtros aplicados
                                    </p>
                                    <button
                                        onClick={() => navigate('/comunicaciones/crear')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                    >
                                        Crear primer aviso
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    <input
                                                        type="checkbox"
                                                        checked={avisosSeleccionados.length === avisos.length && avisos.length > 0}
                                                        onChange={seleccionarTodos}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Aviso
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Prioridad
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Estado
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Fecha
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Lecturas
                                                </th>
                                                <th scope="col" className="relative px-6 py-3">
                                                    <span className="sr-only">Acciones</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {avisos.map((aviso) => (
                                                <tr key={aviso.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {aviso.estado === 'archivado' ? (
                                                            <span className="text-gray-400">-</span>
                                                        ) : (
                                                            <input
                                                                type="checkbox"
                                                                checked={avisosSeleccionados.includes(aviso.id)}
                                                                onChange={(e) => manejarSeleccionAviso(aviso.id, e.target.checked)}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start">
                                                            <div className="text-2xl mr-3 mt-1">
                                                                {getPrioridadIcon(aviso.prioridad)}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                {aviso.estado === 'archivado' ? (
                                                                    <div className="text-left cursor-not-allowed">
                                                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate flex items-center">
                                                                            <span>📁</span>
                                                                            <span className="ml-2">{aviso.titulo}</span>
                                                                            <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                                                                Archivado - No disponible para visualización
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                                                            {aviso.resumen || (aviso.contenido && aviso.contenido.length > 100 
                                                                                ? aviso.contenido.substring(0, 100) + '...'
                                                                                : aviso.contenido
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => navigate(`/comunicaciones/${aviso.id}`)}
                                                                        className="text-left"
                                                                    >
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate">
                                                                            {aviso.titulo}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                            {aviso.resumen || (aviso.contenido && aviso.contenido.length > 100 
                                                                                ? aviso.contenido.substring(0, 100) + '...'
                                                                                : aviso.contenido
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                )}
                                                                {aviso.autor_nombre && (
                                                                    <div className="text-xs text-gray-400 mt-1">
                                                                        Por: {aviso.autor_nombre}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORIDAD_COLORS[aviso.prioridad] || 'bg-gray-100 text-gray-800'}`}>
                                                            {getPrioridadDisplay(aviso.prioridad)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[aviso.estado] || 'bg-gray-100 text-gray-800'}`}>
                                                            {aviso.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        <div>{formatDate(aviso.fecha_publicacion || aviso.fecha_creacion)}</div>
                                                        {aviso.fecha_vencimiento && (
                                                            <div className="text-xs text-red-500">
                                                                Vence: {formatDateOnly(aviso.fecha_vencimiento)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        <div>{aviso.total_lecturas || 0}</div>
                                                        {aviso.total_comentarios > 0 && (
                                                            <div className="text-xs text-blue-500">
                                                                💬 {aviso.total_comentarios}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            {aviso.estado === 'archivado' ? (
                                                                <span className="text-gray-400 dark:text-gray-500 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                                                    Sin acciones disponibles
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => navigate(`/comunicaciones/${aviso.id}`)}
                                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                        title="Ver aviso"
                                                                    >
                                                                        👁️
                                                                    </button>
                                                                    <button
                                                                        onClick={() => navigate(`/comunicaciones/${aviso.id}/editar`)}
                                                                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                                        title="Editar aviso"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                    {aviso.estado === 'borrador' && (
                                                                        <button
                                                                            onClick={() => publicarAviso(aviso.id)}
                                                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                            title="Publicar aviso"
                                                                        >
                                                                            ✅
                                                                        </button>
                                                                    )}
                                                                    {aviso.estado === 'publicado' && (
                                                                        <button
                                                                            onClick={() => archivarAviso(aviso.id)}
                                                                            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                                                                            title="Archivar aviso"
                                                                        >
                                                                            📦
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => {
                                                                            setAvisoAEliminar(aviso);
                                                                            setMostrarModalEliminar(true);
                                                                        }}
                                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                        title="Eliminar aviso"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Paginación */}
                            {paginacion.total_pages > 1 && (
                                <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            <button
                                                onClick={() => cambiarPagina(paginacion.page - 1)}
                                                disabled={paginacion.page <= 1}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Anterior
                                            </button>
                                            <button
                                                onClick={() => cambiarPagina(paginacion.page + 1)}
                                                disabled={paginacion.page >= paginacion.total_pages}
                                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    Mostrando{' '}
                                                    <span className="font-medium">
                                                        {((paginacion.page - 1) * paginacion.page_size) + 1}
                                                    </span>{' '}
                                                    a{' '}
                                                    <span className="font-medium">
                                                        {Math.min(paginacion.page * paginacion.page_size, paginacion.total)}
                                                    </span>{' '}
                                                    de{' '}
                                                    <span className="font-medium">{paginacion.total}</span>{' '}
                                                    resultados
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                    <button
                                                        onClick={() => cambiarPagina(paginacion.page - 1)}
                                                        disabled={paginacion.page <= 1}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                                    >
                                                        ‹
                                                    </button>
                                                    
                                                    {Array.from({ length: Math.min(5, paginacion.total_pages) }, (_, i) => {
                                                        const pageNum = paginacion.page - 2 + i;
                                                        if (pageNum < 1 || pageNum > paginacion.total_pages) return null;
                                                        
                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => cambiarPagina(pageNum)}
                                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                    pageNum === paginacion.page
                                                                        ? 'z-10 bg-blue-50 dark:bg-blue-900/50 border-blue-500 text-blue-600 dark:text-blue-400'
                                                                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                                }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    })}
                                                    
                                                    <button
                                                        onClick={() => cambiarPagina(paginacion.page + 1)}
                                                        disabled={paginacion.page >= paginacion.total_pages}
                                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                                    >
                                                        ›
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Modal de eliminación */}
                {mostrarModalEliminar && avisoAEliminar && (
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
                                        ¿Estás seguro de que deseas eliminar el aviso "{avisoAEliminar.titulo}"?
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                        Esta acción no se puede deshacer.
                                    </p>
                                </div>
                                <div className="flex gap-3 justify-center mt-4">
                                    <button
                                        onClick={() => {
                                            setMostrarModalEliminar(false);
                                            setAvisoAEliminar(null);
                                        }}
                                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => eliminarAviso(avisoAEliminar.id)}
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading && <LoadingSpinner size="sm" />}
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

export default GestionAvisos;