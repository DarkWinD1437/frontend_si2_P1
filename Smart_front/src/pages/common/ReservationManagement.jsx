import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const ReservationManagement = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('calendar');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedArea, setSelectedArea] = useState('');
    
    // Mock data - Replace with real API calls
    const [commonAreas, setCommonAreas] = useState([
        { id: 1, name: 'Piscina', capacity: 20, hourlyRate: 150, available: true },
        { id: 2, name: 'Salón de Eventos', capacity: 50, hourlyRate: 300, available: true },
        { id: 3, name: 'Cancha de Tenis', capacity: 4, hourlyRate: 100, available: true },
        { id: 4, name: 'Área de Parrillas', capacity: 15, hourlyRate: 200, available: false },
        { id: 5, name: 'Gimnasio', capacity: 12, hourlyRate: 80, available: true }
    ]);

    const [reservations, setReservations] = useState([
        { 
            id: 1, 
            area: 'Piscina', 
            resident: 'Juan Pérez', 
            unit: 'Depto 301',
            date: '2025-09-15', 
            time: '10:00 - 12:00', 
            status: 'confirmed',
            amount: 300
        },
        { 
            id: 2, 
            area: 'Salón de Eventos', 
            resident: 'María González', 
            unit: 'Depto 205',
            date: '2025-09-18', 
            time: '18:00 - 22:00', 
            status: 'pending',
            amount: 1200
        }
    ]);

    const [newReservation, setNewReservation] = useState({
        areaId: '',
        date: '',
        startTime: '',
        endTime: '',
        notes: ''
    });

    const tabs = [
        { id: 'calendar', name: 'Calendario', icon: '📅' },
        { id: 'reserve', name: 'Nueva Reserva', icon: '➕' },
        { id: 'my-reservations', name: 'Mis Reservas', icon: '📋' },
        user?.role === 'admin' && { id: 'manage-areas', name: 'Gestionar Áreas', icon: '⚙️' },
        user?.role === 'admin' && { id: 'all-reservations', name: 'Todas las Reservas', icon: '📊' }
    ].filter(Boolean);

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

    const handleReservationSubmit = (e) => {
        e.preventDefault();
        // Here you would make an API call to create the reservation
        console.log('Nueva reserva:', newReservation);
        // Reset form
        setNewReservation({
            areaId: '',
            date: '',
            startTime: '',
            endTime: '',
            notes: ''
        });
        setActiveTab('my-reservations');
    };

    return (
        <Layout 
            title="Reservas de Instalaciones" 
            description="Sistema de reservas para espacios comunes del condominio"
        >
            <div className="space-y-6">
                {/* Tab Navigation */}
                <div className={`${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } rounded-lg border shadow-sm`}>
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
                                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Areas Overview */}
                {activeTab === 'calendar' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Areas List */}
                        <div className="lg:col-span-1 space-y-4">
                            <h3 className={`text-lg font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>Áreas Comunes</h3>
                            {commonAreas.map((area) => (
                                <div
                                    key={area.id}
                                    className={`${
                                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                    } rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${
                                        selectedArea === area.id ? 'ring-2 ring-indigo-500' : ''
                                    }`}
                                    onClick={() => setSelectedArea(area.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`font-semibold ${
                                                isDark ? 'text-white' : 'text-gray-900'
                                            }`}>{area.name}</h4>
                                            <p className={`text-sm ${
                                                isDark ? 'text-gray-400' : 'text-gray-600'
                                            }`}>Capacidad: {area.capacity} personas</p>
                                            <p className={`text-sm font-medium ${
                                                isDark ? 'text-indigo-400' : 'text-indigo-600'
                                            }`}>${area.hourlyRate}/hora</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            area.available 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {area.available ? 'Disponible' : 'Ocupado'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Calendar View */}
                        <div className="lg:col-span-2">
                            <div className={`${
                                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            } rounded-lg border shadow-sm p-6`}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className={`text-lg font-semibold ${
                                        isDark ? 'text-white' : 'text-gray-900'
                                    }`}>Reservas del Día</h3>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className={`px-3 py-2 border rounded-md ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300'
                                        }`}
                                    />
                                </div>
                                
                                {/* Time Slots */}
                                <div className="space-y-2">
                                    {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                                        <div key={hour} className="flex items-center space-x-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                            <div className={`w-16 text-sm ${
                                                isDark ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {hour}:00
                                            </div>
                                            <div className="flex-1 grid grid-cols-5 gap-2">
                                                {commonAreas.map((area) => {
                                                    const hasReservation = reservations.some(r => 
                                                        r.area === area.name && 
                                                        r.date === selectedDate &&
                                                        r.time.includes(`${hour}:00`)
                                                    );
                                                    return (
                                                        <div
                                                            key={`${area.id}-${hour}`}
                                                            className={`h-8 rounded text-xs flex items-center justify-center cursor-pointer transition-colors ${
                                                                hasReservation 
                                                                    ? 'bg-red-100 text-red-800' 
                                                                    : area.available 
                                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                        : 'bg-gray-100 text-gray-400'
                                                            }`}
                                                            title={area.name}
                                                        >
                                                            {hasReservation ? 'Ocupado' : 'Libre'}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* New Reservation Form */}
                {activeTab === 'reserve' && (
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } rounded-lg border shadow-sm p-6`}>
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
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-gray-300' 
                                                : 'bg-white border-gray-300 text-gray-500'
                                        }`}
                                    >
                                        <option value="" className={isDark ? 'text-gray-300' : 'text-gray-500'}>Seleccionar área</option>
                                        {commonAreas.filter(area => area.available).map(area => (
                                            <option key={area.id} value={area.id} className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                                                {area.name} - ${area.hourlyRate}/hora
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
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300'
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
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300'
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
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300'
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
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                        isDark 
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                            : 'bg-white border-gray-300 placeholder-gray-500'
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
                                    className={`px-4 py-2 border rounded-md font-medium transition-colors ${
                                        isDark
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Realizar Reserva
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* My Reservations */}
                {activeTab === 'my-reservations' && (
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } rounded-lg border shadow-sm`}>
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className={`text-lg font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>Mis Reservas</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {reservations
                                    .filter(reservation => user?.role !== 'admin' ? reservation.resident === user?.username : true)
                                    .map((reservation) => (
                                    <div
                                        key={reservation.id}
                                        className={`p-4 rounded-lg border ${
                                            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className={`font-semibold ${
                                                    isDark ? 'text-white' : 'text-gray-900'
                                                }`}>{reservation.area}</h4>
                                                <p className={`text-sm ${
                                                    isDark ? 'text-gray-300' : 'text-gray-600'
                                                }`}>
                                                    {reservation.date} - {reservation.time}
                                                </p>
                                                <p className={`text-sm font-medium text-green-600`}>
                                                    Monto: ${reservation.amount}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                    getStatusColor(reservation.status)
                                                }`}>
                                                    {getStatusText(reservation.status)}
                                                </span>
                                                {reservation.status === 'confirmed' && (
                                                    <button className="block mt-2 text-red-600 hover:text-red-800 text-sm">
                                                        Cancelar
                                                    </button>
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
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } rounded-lg border shadow-sm p-8 text-center`}>
                        <div className="text-4xl mb-4">📱</div>
                        <h3 className={`text-xl font-semibold mb-2 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>Gestión Desde App Móvil</h3>
                        <p className={`${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Configuración de áreas, horarios y tarifas disponibles desde la aplicación móvil.
                            <br />
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block mt-2">
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