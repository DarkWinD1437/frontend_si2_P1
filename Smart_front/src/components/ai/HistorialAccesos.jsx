import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, Car, Eye, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import AIService from '../../services/aiService';

const HistorialAccesos = () => {
    const [accesos, setAccesos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtros, setFiltros] = useState({
        tipo: '',
        estado: '',
        fechaDesde: '',
        fechaHasta: ''
    });
    const [showFiltros, setShowFiltros] = useState(false);

    // Cargar historial al montar y cuando cambien los filtros
    useEffect(() => {
        cargarHistorial();
    }, [filtros]);

    const cargarHistorial = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await AIService.getHistorialAccesos(filtros);
            setAccesos(data);
        } catch (error) {
            console.error('Error cargando historial:', error);
            setError('Error al cargar el historial de accesos');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            tipo: '',
            estado: '',
            fechaDesde: '',
            fechaHasta: ''
        });
    };

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case 'facial':
                return <User className="w-4 h-4" />;
            case 'placa':
                return <Car className="w-4 h-4" />;
            case 'manual':
                return <Eye className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'permitido':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'denegado':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'pendiente':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'permitido':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'denegado':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getTipoColor = (tipo) => {
        switch (tipo) {
            case 'facial':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'placa':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'manual':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const formatFecha = (fechaString) => {
        const fecha = new Date(fechaString);
        return {
            fecha: fecha.toLocaleDateString(),
            hora: fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    const estadisticas = {
        total: accesos.length,
        permitidos: accesos.filter(a => a.estado === 'permitido').length,
        denegados: accesos.filter(a => a.estado === 'denegado').length,
        faciales: accesos.filter(a => a.tipo_acceso === 'facial').length,
        placas: accesos.filter(a => a.tipo_acceso === 'placa').length
    };

    return (
        <div className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {estadisticas.total}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Permitidos</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {estadisticas.permitidos}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Denegados</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {estadisticas.denegados}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Faciales</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {estadisticas.faciales}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                            <Car className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Placas</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {estadisticas.placas}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        Filtros de Búsqueda
                    </h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowFiltros(!showFiltros)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm"
                        >
                            {showFiltros ? 'Ocultar' : 'Mostrar'} Filtros
                        </button>
                        <button
                            onClick={limpiarFiltros}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center"
                        >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Limpiar
                        </button>
                    </div>
                </div>

                {showFiltros && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tipo de Acceso
                            </label>
                            <select
                                value={filtros.tipo}
                                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Todos</option>
                                <option value="facial">Reconocimiento Facial</option>
                                <option value="placa">Lectura de Placa</option>
                                <option value="manual">Acceso Manual</option>
                                <option value="codigo">Código de Acceso</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Estado
                            </label>
                            <select
                                value={filtros.estado}
                                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Todos</option>
                                <option value="permitido">Permitido</option>
                                <option value="denegado">Denegado</option>
                                <option value="pendiente">Pendiente</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fecha Desde
                            </label>
                            <input
                                type="date"
                                value={filtros.fechaDesde}
                                onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fecha Hasta
                            </label>
                            <input
                                type="date"
                                value={filtros.fechaHasta}
                                onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de Accesos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Historial de Accesos
                    </h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando historial...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                ) : accesos.length === 0 ? (
                    <div className="p-8 text-center">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No se encontraron accesos con los filtros aplicados</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Fecha y Hora
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Ubicación
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Confianza IA
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Observaciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {accesos.map((acceso) => {
                                    const fechaFormateada = formatFecha(acceso.fecha_hora);
                                    return (
                                        <tr key={acceso.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {fechaFormateada.fecha}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {fechaFormateada.hora}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(acceso.tipo_acceso)}`}>
                                                        {getTipoIcon(acceso.tipo_acceso)}
                                                        <span className="ml-1 capitalize">{acceso.tipo_acceso}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {acceso.usuario_nombre || 'Desconocido'}
                                                </div>
                                                {acceso.rostro_nombre && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Rostro: {acceso.rostro_nombre}
                                                    </div>
                                                )}
                                                {acceso.vehiculo_placa && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Placa: {acceso.vehiculo_placa}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getEstadoIcon(acceso.estado)}
                                                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(acceso.estado)}`}>
                                                        {acceso.estado}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {acceso.ubicacion}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {acceso.confianza_ia ? `${(acceso.confianza_ia * 100).toFixed(1)}%` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                                {acceso.observaciones || '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialAccesos;