import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { getAreasComunes, getDisponibilidadArea, reservarArea, getMisReservas, getReservas, confirmarReserva, cancelarReserva, eliminarReserva, getEstadoReservaBadgeColor } from '../../services/reservationsService';

const ReservationManagement = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('calendar');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedArea, setSelectedArea] = useState('');
    
    // Estado para disponibilidad de áreas
    const [areaAvailability, setAreaAvailability] = useState({});

    const [newReservation, setNewReservation] = useState({
        areaId: '',
        date: '',
        startTime: '',
        endTime: '',
        notes: ''
    });

    // Estados faltantes que causan el error
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [commonAreas, setCommonAreas] = useState([]);
    const [reservations, setReservations] = useState([]);

    // Definir las pestañas disponibles
    const tabs = [
        { 
            id: 'calendar', 
            name: 'Calendario', 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        { 
            id: 'reserve', 
            name: 'Nueva Reserva', 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            )
        },
        { 
            id: 'my-reservations', 
            name: 'Mis Reservas', 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            )
        },
        user?.role === 'admin' && { 
            id: 'manage-areas', 
            name: 'Gestionar Áreas', 
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        }
    ].filter(Boolean);

    const [messageTimer, setMessageTimer] = useState(null);

    // Limpiar mensajes después de 5 segundos
    useEffect(() => {
        if (error || success) {
            // Limpiar timer anterior si existe
            if (messageTimer) {
                clearTimeout(messageTimer);
            }
            // Crear nuevo timer
            const timer = setTimeout(() => {
                setError(null);
                setSuccess(null);
                setMessageTimer(null);
            }, 5000);
            setMessageTimer(timer);
        } else if (messageTimer) {
            // Limpiar timer si no hay mensajes
            clearTimeout(messageTimer);
            setMessageTimer(null);
        }

        return () => {
            if (messageTimer) {
                clearTimeout(messageTimer);
            }
        };
    }, [error, success, messageTimer]);

    // Cargar datos iniciales al montar el componente
    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    // Recargar reservas cuando cambia la pestaña activa
    useEffect(() => {
        if (commonAreas.length > 0) { // Solo recargar si ya se cargaron las áreas
            cargarReservasPorPestana();
        }
    }, [activeTab]);

    // Cargar disponibilidad cuando cambia la fecha
    useEffect(() => {
        if (activeTab === 'calendar' && commonAreas.length > 0 && selectedDate) {
            cargarDisponibilidadAreas(selectedDate);
        }
    }, [selectedDate, activeTab, commonAreas]);

    const cargarDatosIniciales = async () => {
        try {
            setLoading(true);
            const areasResponse = await getAreasComunes();
            setCommonAreas(areasResponse);
            // Cargar reservas después de cargar áreas
            await cargarReservasPorPestana();
        } catch (err) {
            setError('Error al cargar los datos');
            console.error('Error cargando datos:', err);
        } finally {
            setLoading(false);
        }
    };

    const cargarDisponibilidadAreas = async (fecha) => {
        if (!fecha || !commonAreas.length) return;

        try {
            const availabilityPromises = commonAreas.map(async (area) => {
                try {
                    const disponibilidad = await getDisponibilidadArea(area.id, fecha);
                    return { areaId: area.id, disponibilidad };
                } catch (err) {
                    console.error(`Error cargando disponibilidad para área ${area.id}:`, err);
                    return { areaId: area.id, disponibilidad: { slots_disponibles: [] } };
                }
            });

            const availabilityResults = await Promise.all(availabilityPromises);
            const availabilityMap = {};
            availabilityResults.forEach(result => {
                availabilityMap[result.areaId] = result.disponibilidad;
            });

            setAreaAvailability(availabilityMap);
        } catch (err) {
            console.error('Error cargando disponibilidad de áreas:', err);
        }
    };

    const cargarReservasPorPestana = async () => {
        try {
            if (activeTab === 'my-reservations') {
                const misReservas = await getMisReservas();
                setReservations(misReservas);
            } else if (activeTab === 'manage-areas' && user?.role === 'admin') {
                const todasReservas = await getReservas();
                setReservations(todasReservas);
            } else {
                setReservations([]);
            }
        } catch (err) {
            console.error('Error cargando reservas:', err);
            setError('Error al cargar las reservas');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'confirmed': return 'Confirmada';
            case 'pending': return 'Pendiente';
            case 'cancelled': return 'Cancelada';
            default: return 'Desconocido';
        }
    };

    const handleCancelarReserva = async (reservaId) => {
        if (!confirm('¿Está seguro de que desea cancelar esta reserva?')) return;

        try {
            setLoading(true);
            await cancelarReserva(reservaId);
            setSuccess('Reserva cancelada exitosamente');
            await cargarReservasPorPestana();
        } catch (err) {
            setError(err.message || 'Error al cancelar la reserva');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmarPago = async (reservaId) => {
        if (!confirm('¿Está seguro de que desea confirmar el pago de esta reserva?')) return;

        try {
            setLoading(true);
            await confirmarReserva(reservaId);
            setSuccess('Pago confirmado exitosamente');
            await cargarReservasPorPestana();
        } catch (err) {
            setError(err.message || 'Error al confirmar el pago');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarReserva = async (reservaId) => {
        if (!confirm('¿Está seguro de que desea eliminar esta reserva? Esta acción no se puede deshacer.')) return;

        try {
            setLoading(true);
            await eliminarReserva(reservaId);
            setSuccess('Reserva eliminada exitosamente');
            await cargarReservasPorPestana();
        } catch (err) {
            setError(err.message || 'Error al eliminar la reserva');
        } finally {
            setLoading(false);
        }
    };

    const handleSlotClick = async (area, slotTime, slotInfo) => {
        if (!slotInfo?.disponible) return;

        // Calcular hora de fin basada en la duración del slot
        const [hora, minuto] = slotTime.split(':').map(Number);
        const horaFin = new Date();
        horaFin.setHours(hora + slotInfo.duracion_horas, minuto);
        const horaFinStr = horaFin.toTimeString().slice(0, 5);

        // Pre-llenar el formulario de nueva reserva
        setNewReservation({
            areaId: area.id.toString(),
            date: selectedDate,
            startTime: slotTime,
            endTime: horaFinStr,
            notes: ''
        });

        // Cambiar a la pestaña de nueva reserva
        setActiveTab('reserve');

        // Mostrar mensaje informativo
        setSuccess(`Reserva pre-configurada para ${area.nombre} de ${slotTime} a ${horaFinStr}`);
    };

    const handleReservationSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            // Validar datos antes de enviar
            const selectedArea = commonAreas.find(a => a.id === parseInt(newReservation.areaId));
            if (!selectedArea) {
                setError('Área no encontrada');
                return;
            }

            const reservationDateTime = new Date(`${newReservation.date}T${newReservation.startTime}`);
            const now = new Date();
            const hoursDiff = (reservationDateTime - now) / (1000 * 60 * 60);

            console.log('Validando reserva:', {
                area: selectedArea.nombre,
                fecha: newReservation.date,
                horaInicio: newReservation.startTime,
                horaFin: newReservation.endTime,
                fechaHoraReserva: reservationDateTime,
                ahora: now,
                horasAnticipacion: hoursDiff,
                anticipacionRequerida: selectedArea.anticipo_minimo_horas,
                capacidadMaxima: selectedArea.capacidad_maxima
            });

            // Validar anticipación mínima
            if (hoursDiff < selectedArea.anticipo_minimo_horas) {
                setError(`Se requiere reserva con al menos ${selectedArea.anticipo_minimo_horas} horas de anticipación. Actualmente: ${hoursDiff.toFixed(1)} horas.`);
                return;
            }

            // Validar capacidad
            if (1 > selectedArea.capacidad_maxima) {
                setError(`El número de personas excede la capacidad máxima (${selectedArea.capacidad_maxima})`);
                return;
            }

            // Calcular duración
            const startTime = new Date(`2000-01-01T${newReservation.startTime}`);
            const endTime = new Date(`2000-01-01T${newReservation.endTime}`);
            const durationHours = (endTime - startTime) / (1000 * 60 * 60);

            console.log('Duración calculada:', durationHours, 'horas');

            // Validar duración
            if (durationHours < selectedArea.tiempo_minimo_reserva || durationHours > selectedArea.tiempo_maximo_reserva) {
                setError(`La duración debe estar entre ${selectedArea.tiempo_minimo_reserva} y ${selectedArea.tiempo_maximo_reserva} horas. Actual: ${durationHours} horas.`);
                return;
            }

            const reservationData = {
                fecha: newReservation.date,
                hora_inicio: newReservation.startTime,
                hora_fin: newReservation.endTime,
                numero_personas: 1, // Default value
                observaciones: newReservation.notes
            };

            console.log('Enviando datos al backend:', reservationData);

            await reservarArea(newReservation.areaId, reservationData);
            setSuccess('Reserva creada exitosamente');

            // Reset form
            setNewReservation({
                areaId: '',
                date: '',
                startTime: '',
                endTime: '',
                notes: ''
            });

            // Reload data
            await cargarReservasPorPestana();
            await cargarDisponibilidadAreas(selectedDate);

            // Switch to my reservations tab
            setActiveTab('my-reservations');

        } catch (err) {
            console.error('Error completo:', err);
            setError(err.message || 'Error al crear la reserva');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout 
            title="Reservas de Instalaciones" 
            description="Sistema de reservas para espacios comunes del condominio"
        >
            <div className="space-y-6">
                {/* Tab Navigation */}
                <div className={`${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                } rounded-lg border-2 shadow-lg`}>
                    <nav className="flex space-x-8 px-6 py-4 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                                    activeTab === tab.id
                                        ? isDark 
                                            ? 'bg-indigo-900 text-indigo-300 border-2 border-indigo-700'
                                            : 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                                        : isDark
                                            ? 'text-gray-300 hover:text-gray-200 hover:bg-gray-700'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Mensajes de éxito y error */}
                {error && typeof error === 'string' && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                {success && typeof success === 'string' && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {success}
                    </div>
                )}

                {/* Areas Overview */}
                {activeTab === 'calendar' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Areas List */}
                        <div className="lg:col-span-1 space-y-4">
                            <h3 className={`text-lg font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>Áreas Comunes</h3>
                            {commonAreas && commonAreas.length > 0 ? commonAreas.map((area) => (
                                <div
                                    key={area.id}
                                    className={`${
                                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                                    } rounded-lg border-2 shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer ${
                                        selectedArea === area.id ? 'ring-2 ring-indigo-500' : ''
                                    }`}
                                    onClick={() => setSelectedArea(area.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`font-semibold ${
                                                isDark ? 'text-white' : 'text-gray-900'
                                            }`}>{area.nombre}</h4>
                                            <p className={`text-sm ${
                                                isDark ? 'text-gray-300' : 'text-gray-600'
                                            }`}>Capacidad: {area.capacidad_maxima} personas</p>
                                            <p className={`text-sm font-medium ${
                                                isDark ? 'text-indigo-400' : 'text-indigo-700'
                                            }`}>${area.costo_por_hora}/hora</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            area.estado === 'activa' ? 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200' : 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {area.estado === 'activa' ? 'Disponible' : 'Inactiva'}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-500 dark:text-gray-400">
                                        No hay áreas disponibles
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Calendar View */}
                        <div className="lg:col-span-2">
                            <div className={`${
                                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                            } rounded-lg border-2 shadow-lg p-6`}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className={`text-lg font-semibold ${
                                        isDark ? 'text-white' : 'text-gray-900'
                                    }`}>Reservas del Día</h3>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className={`px-3 py-2 border-2 rounded-md ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-400'
                                        }`}
                                    />
                                </div>
                                
                                {/* Time Slots */}
                                <div className="space-y-2">
                                        {/* Crear un grid de slots basado en la disponibilidad de todas las áreas */}
                                    {(() => {
                                        // Si no hay disponibilidad cargada aún, mostrar mensaje de carga
                                        if (!areaAvailability || Object.keys(areaAvailability).length === 0) {
                                            return (
                                                <div className="text-center py-8">
                                                    <div className="text-gray-500 dark:text-gray-400">
                                                        Cargando disponibilidad...
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Obtener todos los slots únicos disponibles de todas las áreas
                                        const allSlots = new Set();
                                        commonAreas.forEach(area => {
                                            const availability = areaAvailability[area.id];
                                            if (availability?.slots_disponibles) {
                                                availability.slots_disponibles.forEach(slot => {
                                                    allSlots.add(slot.hora_inicio);
                                                });
                                            }
                                        });

                                        // Si no hay slots disponibles, mostrar mensaje
                                        if (allSlots.size === 0) {
                                            return (
                                                <div className="text-center py-8">
                                                    <div className="text-gray-500 dark:text-gray-400">
                                                        No hay slots disponibles para esta fecha
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Convertir a array y ordenar
                                        const sortedSlots = Array.from(allSlots).sort();

                                        return sortedSlots.map((slotTime) => (
                                            <div key={slotTime} className="flex items-center space-x-4 py-2 border-b-2 border-gray-200 dark:border-gray-700">
                                                <div className={`w-16 text-sm ${
                                                    isDark ? 'text-gray-300' : 'text-gray-600'
                                                }`}>
                                                    {slotTime}
                                                </div>
                                                <div className="flex-1 grid grid-cols-5 gap-2">
                                                    {commonAreas.map((area) => {
                                                        const availability = areaAvailability?.[area.id];
                                                        const slotInfo = availability?.slots_disponibles?.find(s => s.hora_inicio === slotTime);
                                                        
                                                        // Verificar si hay reserva en este slot
                                                        const hasReservation = reservations?.some(r => 
                                                            r.area_comun === area.id && 
                                                            r.fecha === selectedDate &&
                                                            r.hora_inicio <= slotTime + ':00' && 
                                                            r.hora_fin > slotTime + ':00' &&
                                                            ['confirmada', 'pagada', 'usada'].includes(r.estado)
                                                        ) || false;

                                                        let statusColor = '';
                                                        let statusText = '';
                                                        let clickable = false;

                                                        if (area.estado !== 'activa') {
                                                            statusColor = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-500';
                                                            statusText = 'Inactiva';
                                                        } else if (hasReservation) {
                                                            statusColor = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
                                                            statusText = 'Ocupado';
                                                        } else if (slotInfo?.disponible) {
                                                            statusColor = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800';
                                                            statusText = 'Libre';
                                                            clickable = true;
                                                        } else {
                                                            statusColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
                                                            statusText = 'No disponible';
                                                        }

                                                        return (
                                                            <div
                                                                key={`${area.id}-${slotTime}`}
                                                                className={`h-8 rounded text-xs flex items-center justify-center cursor-pointer transition-colors ${statusColor} ${
                                                                    clickable ? 'hover:opacity-80' : ''
                                                                }`}
                                                                title={`${area.nombre} - ${statusText}`}
                                                                onClick={clickable ? () => handleSlotClick(area, slotTime, slotInfo) : undefined}
                                                            >
                                                                {statusText}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* New Reservation Form */}
                {activeTab === 'reserve' && (
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    } rounded-lg border-2 shadow-lg p-6`}>
                        <h3 className={`text-lg font-semibold mb-6 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>Nueva Reserva</h3>
                        
                        <form onSubmit={handleReservationSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Área Común
                                    </label>
                                    <select
                                        value={newReservation.areaId}
                                        onChange={(e) => setNewReservation(prev => ({ ...prev, areaId: e.target.value }))}
                                        required
                                        className={`w-full px-3 py-2 border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-gray-300' 
                                                : 'bg-white border-gray-400 text-gray-700'
                                        }`}
                                    >
                                        <option value="" className={isDark ? 'text-gray-300' : 'text-gray-500'}>Seleccionar área</option>
                                        {commonAreas.filter(area => area.estado === 'activa').map(area => (
                                            <option key={area.id} value={area.id} className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                                                {area.nombre} - ${area.costo_por_hora}/hora (Cap: {area.capacidad_maxima})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        value={newReservation.date}
                                        onChange={(e) => setNewReservation(prev => ({ ...prev, date: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                        className={`w-full px-3 py-2 border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-400'
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Hora de Inicio
                                    </label>
                                    <input
                                        type="time"
                                        value={newReservation.startTime}
                                        onChange={(e) => setNewReservation(prev => ({ ...prev, startTime: e.target.value }))}
                                        required
                                        className={`w-full px-3 py-2 border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-400'
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Hora de Fin
                                    </label>
                                    <input
                                        type="time"
                                        value={newReservation.endTime}
                                        onChange={(e) => setNewReservation(prev => ({ ...prev, endTime: e.target.value }))}
                                        required
                                        className={`w-full px-3 py-2 border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-400'
                                        }`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Notas Adicionales
                                </label>
                                <textarea
                                    value={newReservation.notes}
                                    onChange={(e) => setNewReservation(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    placeholder="Detalles especiales o comentarios..."
                                    className={`w-full px-3 py-2 border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                        isDark 
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                            : 'bg-white border-gray-400 placeholder-gray-500'
                                    }`}
                                />
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setNewReservation({
                                        areaId: '',
                                        date: '',
                                        startTime: '',
                                        endTime: '',
                                        notes: ''
                                    })}
                                    className={`px-4 py-2 border-2 rounded-md font-medium transition-colors ${
                                        isDark
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                                            : 'border-gray-400 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    Realizar Reserva
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* My Reservations */}
                {activeTab === 'my-reservations' && (
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    } rounded-lg border-2 shadow-lg`}>
                        <div className="px-6 py-4 border-b-2 border-gray-300 dark:border-gray-700">
                            <h3 className={`text-lg font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>Mis Reservas</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {reservations.map((reservation) => (
                                    <div
                                        key={reservation.id}
                                        className={`p-4 rounded-lg border-2 ${
                                            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className={`font-semibold ${
                                                    isDark ? 'text-white' : 'text-gray-900'
                                                }`}>{reservation.area_comun_nombre}</h4>
                                                <p className={`text-sm ${
                                                    isDark ? 'text-gray-300' : 'text-gray-600'
                                                }`}>
                                                    {reservation.fecha} - {reservation.hora_inicio.slice(0, 5)} a {reservation.hora_fin.slice(0, 5)}
                                                </p>
                                                <p className={`text-sm font-medium ${
                                                    isDark ? 'text-green-400' : 'text-green-700'
                                                }`}>
                                                    Monto: ${reservation.costo_total}
                                                </p>
                                                {reservation.observaciones && (
                                                    <p className={`text-xs mt-1 ${
                                                        isDark ? 'text-gray-300' : 'text-gray-500'
                                                    }`}>
                                                        {reservation.observaciones}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                    getEstadoReservaBadgeColor(reservation.estado)
                                                }`}>
                                                    {reservation.estado_display}
                                                </span>
                                                {reservation.estado === 'confirmada' && (
                                                    <div className="mt-2 space-y-1">
                                                        <button 
                                                            onClick={() => handleConfirmarPago(reservation.id)}
                                                            className="block text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                                                        >
                                                            💳 Confirmar Pago
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEliminarReserva(reservation.id)}
                                                            className="block text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                                                        >
                                                            🗑️ Eliminar Reserva
                                                        </button>
                                                    </div>
                                                )}
                                                {reservation.estado === 'pendiente' && (
                                                    <div className="mt-2 space-y-1">
                                                        <button 
                                                            onClick={() => handleConfirmarReserva(reservation.id)}
                                                            className="block text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                                                        >
                                                            Confirmar con Pago
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEliminarReserva(reservation.id)}
                                                            className="block text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                                                        >
                                                            🗑️ Eliminar Reserva
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Future Mobile App Integration Placeholder */}
                {activeTab === 'manage-areas' && user?.role === 'admin' && (
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    } rounded-lg border-2 shadow-lg p-8 text-center`}>
                        <div className="text-4xl mb-4">📱</div>
                        <h3 className={`text-xl font-semibold mb-2 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>Gestión Desde App Móvil</h3>
                        <p className={`${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                            Configuración de áreas, horarios y tarifas disponibles desde la aplicación móvil.
                            <br />
                            <span className="text-sm bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full inline-block mt-2">
                                📱 Disponible en App Móvil
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ReservationManagement;