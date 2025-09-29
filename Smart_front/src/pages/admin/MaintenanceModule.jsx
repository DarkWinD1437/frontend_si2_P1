import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import maintenanceService from '../../services/maintenanceService';

const MaintenanceModule = () => {
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('register');
    const [newRequest, setNewRequest] = useState({
        descripcion: '',
        ubicacion: '',
        prioridad: 'media'
    });
    const [assignmentData, setAssignmentData] = useState({
        asignado_a_id: '',
        descripcion_tarea: '',
        notas: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const mockMaintenanceRequests = [
        {
            id: 1,
            descripcion: 'Fuga de agua en apartamento 301',
            ubicacion: 'Apartamento 301',
            prioridad: 'alta',
            estado: 'pendiente',
            fecha_solicitud: '2024-01-15T10:30:00Z',
            solicitante_info: {
                id: 1,
                username: 'residente1',
                nombre_completo: 'Juan Pérez'
            }
        },
        {
            id: 2,
            descripcion: 'Mantenimiento de ascensor',
            ubicacion: 'Ascensor Principal',
            prioridad: 'media',
            estado: 'asignada',
            fecha_solicitud: '2024-01-14T09:15:00Z',
            solicitante_info: {
                id: 2,
                username: 'residente2',
                nombre_completo: 'María García'
            },
            tarea_info: {
                id: 1,
                asignado_a: {
                    id: 3,
                    username: 'mantenimiento1',
                    nombre_completo: 'Carlos López'
                },
                estado: 'en_progreso',
                fecha_asignacion: '2024-01-14T11:00:00Z'
            }
        }
    ];

    const mockWorkers = [
        { id: 3, username: 'mantenimiento1', first_name: 'Carlos', last_name: 'López', role: 'maintenance' },
        { id: 4, username: 'mantenimiento2', first_name: 'Ana', last_name: 'Martínez', role: 'maintenance' }
    ];

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Verificar autenticación primero
            const token = sessionStorage.getItem('token');
            const user = sessionStorage.getItem('user');
            
            if (!token || !user) {
                console.error('No hay token o usuario en sessionStorage');
                setError('Sesión expirada. Redirigiendo al login...');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                return;
            }

            // Cargar solicitudes de mantenimiento
            const solicitudes = await maintenanceService.getSolicitudes();

            // Cargar usuarios de mantenimiento
            const usuariosMantenimiento = await maintenanceService.getMaintenanceUsers();

            setMaintenanceRequests(solicitudes);
            setWorkers(usuariosMantenimiento);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            
            // Handle authentication errors
            if (error.response?.status === 401) {
                console.error('Error 401 - Usuario no autenticado');
                setError('Sesión expirada. Redirigiendo al login...');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                return;
            }
            
            // Handle network errors
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                console.error('Error de timeout/conexión');
                setError('Error de conexión. Verifica tu conexión a internet.');
            } else {
                console.error('Error desconocido:', error.message);
                setError('Error al cargar los datos. Por favor, intenta de nuevo.');
            }

            // Fallback a datos mock en caso de error
            setMaintenanceRequests(mockMaintenanceRequests);
            setWorkers(mockWorkers);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'alta': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
            case 'urgente': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
            case 'media': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
            case 'baja': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
            default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendiente': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900';
            case 'asignada': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
            case 'en_progreso': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
            case 'completada': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
            case 'cancelada': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
            default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Layout 
            title="Gestión de Mantenimiento"
            description="Administra solicitudes de mantenimiento y asigna trabajadores"
        >
            <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Gestión de Mantenimiento
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Administra solicitudes de mantenimiento y asigna trabajadores
                </p>
            </div>

            {/* Global Messages */}
            {error && (
                <div className="mb-6 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-700 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {success}
                        <button
                            onClick={() => setSuccess(null)}
                            className="ml-auto text-green-700 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'register'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        Registrar Solicitud
                    </button>
                    <button
                        onClick={() => setActiveTab('assign')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'assign'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        Asignar Tareas
                    </button>
                    <button
                        onClick={() => setActiveTab('tracking')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'tracking'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        Seguimiento de Estados
                    </button>
                </nav>
            </div>

            {/* Register Request Tab */}
            {activeTab === 'register' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Registrar Nueva Solicitud de Mantenimiento
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                setError(null);
                                const response = await maintenanceService.createSolicitud(newRequest);
                                setMaintenanceRequests([response, ...maintenanceRequests]);
                                setNewRequest({
                                    descripcion: '',
                                    ubicacion: '',
                                    prioridad: 'media'
                                });
                                setSuccess('Solicitud registrada exitosamente');
                                setTimeout(() => setSuccess(null), 3000);
                            } catch (error) {
                                setError('Error al registrar la solicitud. Intenta de nuevo.');
                                console.error('Error:', error);
                            }
                        }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Ubicación *
                                    </label>
                                    <input
                                        type="text"
                                        value={newRequest.ubicacion}
                                        onChange={(e) => setNewRequest({...newRequest, ubicacion: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Ej: Apartamento 301, Ascensor Principal"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Prioridad *
                                    </label>
                                    <select
                                        value={newRequest.prioridad}
                                        onChange={(e) => setNewRequest({...newRequest, prioridad: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        required
                                    >
                                        <option value="baja">Baja</option>
                                        <option value="media">Media</option>
                                        <option value="alta">Alta</option>
                                        <option value="urgente">Urgente</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descripción Detallada *
                                </label>
                                <textarea
                                    value={newRequest.descripcion}
                                    onChange={(e) => setNewRequest({...newRequest, descripcion: e.target.value})}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Describa detalladamente el problema o mantenimiento requerido..."
                                    required
                                />
                            </div>

                            {error && (
                                <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 px-4 py-3 rounded">
                                    {success}
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setNewRequest({
                                        descripcion: '',
                                        ubicacion: '',
                                        prioridad: 'media'
                                    })}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Limpiar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                    Registrar Solicitud
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Recent Requests Summary */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Solicitudes Recientes
                        </h3>
                        <div className="space-y-3">
                            {maintenanceRequests.slice(0, 3).map((request) => (
                                <div key={request.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">{request.descripcion.substring(0, 50)}...</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {request.ubicacion} - {request.solicitante_info?.nombre_completo || 'Usuario'}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(request.prioridad)}`}>
                                            {request.prioridad_display}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.estado)}`}>
                                            {request.estado_display}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {maintenanceRequests.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                    No hay solicitudes registradas aún
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Tasks Tab */}
            {activeTab === 'assign' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Asignar Tareas de Mantenimiento
                        </h2>
                    </div>

                    {/* Pending Requests */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Solicitudes Pendientes de Asignación
                        </h3>
                        <div className="space-y-4">
                            {maintenanceRequests.filter(req => req.estado === 'pendiente').map((request) => (
                                <div key={request.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{request.descripcion.substring(0, 60)}...</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{request.ubicacion}</p>
                                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span>Solicitante: {request.solicitante_info?.nombre_completo}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(request.prioridad)}`}>
                                                    {request.prioridad_display}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{request.fecha_solicitud_display}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">Asignar Tarea:</h5>

                                        {/* Assignment Form */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Asignar a:
                                                </label>
                                                <select
                                                    value={assignmentData.asignado_a_id}
                                                    onChange={(e) => setAssignmentData({...assignmentData, asignado_a_id: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                                >
                                                    <option value="">Seleccionar trabajador...</option>
                                                    {workers.map((worker) => (
                                                        <option key={worker.id} value={worker.id}>
                                                            {worker.first_name} {worker.last_name} ({worker.username})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Descripción de la tarea:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={assignmentData.descripcion_tarea}
                                                    onChange={(e) => setAssignmentData({...assignmentData, descripcion_tarea: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                                    placeholder="Describa la tarea específica..."
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Notas adicionales:
                                            </label>
                                            <textarea
                                                value={assignmentData.notas}
                                                onChange={(e) => setAssignmentData({...assignmentData, notas: e.target.value})}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="Notas adicionales (opcional)..."
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                onClick={async () => {
                                                    if (!assignmentData.asignado_a_id || !assignmentData.descripcion_tarea.trim()) {
                                                        setError('Debe seleccionar un trabajador y proporcionar una descripción de la tarea');
                                                        return;
                                                    }

                                                    try {
                                                        setError(null);
                                                        await maintenanceService.assignTarea(request.id, assignmentData);
                                                        setSuccess('Tarea asignada exitosamente');

                                                        // Reload data
                                                        await loadData();

                                                        // Reset form
                                                        setAssignmentData({
                                                            asignado_a_id: '',
                                                            descripcion_tarea: '',
                                                            notas: ''
                                                        });

                                                        setTimeout(() => setSuccess(null), 3000);
                                                    } catch (error) {
                                                        setError('Error al asignar la tarea. Intenta de nuevo.');
                                                        console.error('Error:', error);
                                                    }
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                            >
                                                Asignar Tarea
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {maintenanceRequests.filter(req => req.estado === 'pendiente').length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No hay solicitudes pendientes de asignación
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assigned Tasks Overview */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Tareas Asignadas Recientemente
                        </h3>
                        <div className="space-y-3">
                            {maintenanceRequests.filter(req => req.estado === 'asignada').slice(0, 5).map((request) => (
                                <div key={request.id} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">{request.descripcion.substring(0, 50)}...</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Asignado a: {request.tarea_info?.asignado_a?.nombre_completo} - {request.ubicacion}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.estado)}`}>
                                            {request.estado_display}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {maintenanceRequests.filter(req => req.estado === 'asignada').length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                    No hay tareas asignadas recientemente
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Tracking Tab */}
            {activeTab === 'tracking' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Seguimiento de Estados de Mantenimiento
                        </h2>
                    </div>

                    {/* Status Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {maintenanceRequests.filter(req => req.estado === 'pendiente').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Asignadas</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {maintenanceRequests.filter(req => req.estado === 'asignada').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Progreso</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {maintenanceRequests.filter(req => req.estado === 'en_progreso').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                            <div className="flex items-center">
                                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completadas</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {maintenanceRequests.filter(req => req.estado === 'completada').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* All Requests with Status Tracking */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Todas las Solicitudes de Mantenimiento
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {maintenanceRequests.map((request) => (
                                <div key={request.id} className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{request.descripcion}</h4>
                                            <p className="text-gray-600 dark:text-gray-300 mt-1">{request.ubicacion}</p>
                                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span>Solicitante: {request.solicitante_info?.nombre_completo}</span>
                                                <span>Creada: {request.fecha_solicitud_display}</span>
                                                {request.tarea_info?.fecha_completado && (
                                                    <span>Completada: {request.tarea_info.fecha_completado}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(request.priority)}`}>
                                                {request.priority === 'high' ? 'Alta' : request.priority === 'medium' ? 'Media' : 'Baja'}
                                            </span>
                                            <select
                                                value={request.tarea_info?.estado || request.estado}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    if (request.tarea_info) {
                                                        try {
                                                            setError(null);
                                                            await maintenanceService.updateEstadoTarea(request.tarea_info.id, {
                                                                estado: newStatus,
                                                                notas: `Estado actualizado a ${newStatus} por administrador`
                                                            });
                                                            setSuccess('Estado actualizado exitosamente');
                                                            await loadData();
                                                            setTimeout(() => setSuccess(null), 3000);
                                                        } catch (error) {
                                                            setError('Error al actualizar el estado. Intenta de nuevo.');
                                                            console.error('Error:', error);
                                                        }
                                                    }
                                                }}
                                                className={`px-3 py-1 rounded text-sm border ${getStatusColor(request.tarea_info?.estado || request.estado)} border-current`}
                                                disabled={!request.tarea_info}
                                            >
                                                <option value="asignada">Asignada</option>
                                                <option value="en_progreso">En Progreso</option>
                                                <option value="completada">Completada</option>
                                                <option value="cancelada">Cancelada</option>
                                            </select>
                                        </div>
                                    </div>

                                    {request.tarea_info && (
                                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                                <strong>Asignado a:</strong> {request.tarea_info.asignado_a.nombre_completo}
                                                <br />
                                                <strong>Descripción de tarea:</strong> {request.tarea_info.descripcion_tarea}
                                                {request.tarea_info.fecha_asignacion_display && (
                                                    <>
                                                        <br />
                                                        <strong>Fecha de asignación:</strong> {request.tarea_info.fecha_asignacion_display}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    {/* Task Notes Section */}
                                    {request.tarea_info?.notas && (
                                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Notas de la Tarea</h5>
                                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{request.tarea_info.notas}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            </div>
        </Layout>
    );
};

export default MaintenanceModule;