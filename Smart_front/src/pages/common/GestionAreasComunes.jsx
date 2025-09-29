import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { getAreasComunes, getDisponibilidadArea } from '../../services/reservationsService';

const GestionAreasComunes = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [disponibilidad, setDisponibilidad] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar áreas comunes al montar el componente
    useEffect(() => {
        cargarAreas();
    }, []);

    const cargarAreas = async () => {
        try {
            setLoading(true);
            const response = await getAreasComunes();
            setAreas(response);
        } catch (err) {
            setError('Error al cargar las áreas comunes');
            console.error('Error cargando áreas:', err);
        } finally {
            setLoading(false);
        }
    };

    const consultarDisponibilidad = async (areaId, fecha) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Consultando disponibilidad para área:', areaId, 'fecha:', fecha);
            const response = await getDisponibilidadArea(areaId, fecha);
            console.log('Respuesta de disponibilidad:', response);

            // Verificar si la respuesta tiene el formato esperado
            if (!response || typeof response !== 'object') {
                throw new Error('Respuesta del servidor no válida');
            }

            // Verificar si hay slots disponibles
            if (!response.slots_disponibles) {
                console.warn('No se encontraron slots_disponibles en la respuesta');
                response.slots_disponibles = [];
            }

            setDisponibilidad(response);
            setSelectedArea(areaId);
        } catch (err) {
            console.error('Error completo:', err);
            setError('Error al consultar disponibilidad: ' + err.message);
            setDisponibilidad(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAreaClick = (area) => {
        console.log('Haciendo clic en área:', area.id, area.nombre);
        console.log('Fecha seleccionada:', selectedDate);
        // Si el área ya está seleccionada, no hacer nada para evitar consultas innecesarias
        if (selectedArea === area.id) {
            console.log('Área ya seleccionada, no se consulta nuevamente');
            return;
        }
        consultarDisponibilidad(area.id, selectedDate);
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        console.log('Cambiando fecha a:', newDate);
        console.log('Área seleccionada actual:', selectedArea);

        // Validar que la fecha no sea anterior a hoy
        const today = new Date().toISOString().split('T')[0];
        if (newDate < today) {
            setError('No se puede seleccionar una fecha anterior a hoy');
            return;
        }

        setSelectedDate(newDate);
        setError(null); // Limpiar errores anteriores

        if (selectedArea) {
            console.log('Consultando disponibilidad para área existente:', selectedArea);
            consultarDisponibilidad(selectedArea, newDate);
        } else {
            console.log('No hay área seleccionada, limpiando disponibilidad');
            setDisponibilidad(null);
        }
    };

    const getStatusColor = (disponible) => {
        return disponible 
            ? 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200';
    };

    return (
        <Layout
            title="Gestión de Áreas Comunes"
            description="Consulta la disponibilidad de espacios comunes del condominio"
        >
            <div className="space-y-6">
                {/* Selector de fecha */}
                <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-lg border-2 shadow-lg p-6`}>
                    <div className="flex items-center space-x-4">
                        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Seleccionar Fecha:
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={`px-3 py-2 border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-400'
                            }`}
                        />
                    </div>
                </div>

                {/* Mensaje de error */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Lista de áreas comunes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {areas.map((area) => (
                        <div
                            key={area.id}
                            className={`${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-300 hover:bg-gray-50'} rounded-lg border-2 shadow-md p-6 cursor-pointer transition-colors`}
                            onClick={() => handleAreaClick(area)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {area.nombre}
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {area.tipo_display}
                                    </p>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    area.estado === 'activa' ? 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200' : 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                    {area.estado === 'activa' ? 'Activa' : 'Inactiva'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Capacidad:</span>
                                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {area.capacidad_maxima} personas
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Costo por hora:</span>
                                    <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                                        ${area.costo_por_hora}
                                    </span>
                                </div>
                                {area.tiempo_minimo_reserva && (
                                    <div className="flex justify-between text-sm">
                                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Tiempo mínimo:</span>
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {area.tiempo_minimo_reserva} horas
                                        </span>
                                    </div>
                                )}
                            </div>

                            {area.descripcion && (
                                <p className={`text-xs mt-3 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {area.descripcion}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Disponibilidad detallada */}
                {disponibilidad && selectedArea && (
                    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-lg border-2 shadow-lg p-6`}>
                        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-300 dark:border-gray-700 pb-4">
                            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Disponibilidad - {areas.find(a => a.id === selectedArea)?.nombre}
                            </h3>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Fecha: {new Date(selectedDate).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Consultando disponibilidad...
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {disponibilidad.slots_disponibles && disponibilidad.slots_disponibles.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {disponibilidad.slots_disponibles.map((slot, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-lg border-2 ${
                                                    slot.disponible
                                                        ? isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300'
                                                        : isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {slot.hora_inicio} - {slot.hora_fin}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.disponible)}`}>
                                                        {slot.disponible ? 'Disponible' : 'Ocupado'}
                                                    </span>
                                                </div>
                                                {slot.disponible && (
                                                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                                                        Costo: ${disponibilidad.costo_por_hora}/hora
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                            No hay slots disponibles para esta fecha
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Loading overlay */}
                {loading && !disponibilidad && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-400'} rounded-lg p-6 flex items-center space-x-4 shadow-xl border-2`}>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span>Cargando áreas comunes...</span>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default GestionAreasComunes;