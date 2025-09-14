import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const SecurityModule = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('access-log');
    
    // Mock data - Replace with real API calls
    const [accessLog, setAccessLog] = useState([
        {
            id: 1,
            type: 'entry',
            person: 'Juan Pérez',
            unit: 'Depto 301',
            method: 'facial_recognition',
            timestamp: '2025-09-12 08:30:15',
            status: 'authorized',
            camera: 'Entrada Principal'
        },
        {
            id: 2,
            type: 'visitor',
            person: 'María González',
            unit: 'Visitante - Depto 205',
            method: 'manual_registration',
            timestamp: '2025-09-12 10:15:22',
            status: 'pending_approval',
            camera: 'Portería'
        },
        {
            id: 3,
            type: 'vehicle',
            person: 'Carlos Ruiz',
            unit: 'Placa: ABC-123',
            method: 'license_plate',
            timestamp: '2025-09-12 07:45:10',
            status: 'authorized',
            camera: 'Entrada Vehículos'
        }
    ]);

    const [visitors, setVisitors] = useState([
        {
            id: 1,
            name: 'Ana Rodríguez',
            visitingUnit: 'Depto 205',
            resident: 'María González',
            entryTime: '2025-09-12 14:30:00',
            expectedDuration: '2 horas',
            status: 'inside',
            photo: null,
            notes: 'Visita familiar'
        },
        {
            id: 2,
            name: 'Técnico Electricista',
            visitingUnit: 'Depto 102',
            resident: 'Pedro Sánchez',
            entryTime: '2025-09-12 09:00:00',
            expectedDuration: '4 horas',
            status: 'completed',
            photo: null,
            notes: 'Reparación instalación eléctrica'
        }
    ]);

    const [newVisitor, setNewVisitor] = useState({
        name: '',
        visitingUnit: '',
        expectedDuration: '',
        notes: '',
        hasPhoto: false
    });

    const tabs = [
        { id: 'access-log', name: 'Registro de Acceso', icon: '🔐' },
        { id: 'visitors', name: 'Visitantes', icon: '👥' },
        (user?.role === 'admin' || user?.role === 'security') && { id: 'register-visitor', name: 'Registrar Visitante', icon: '➕' },
        user?.role === 'admin' && { id: 'ai-security', name: 'Seguridad con IA', icon: '🤖' },
        user?.role === 'admin' && { id: 'cameras', name: 'Cámaras', icon: '📹' }
    ].filter(Boolean);

    const getStatusColor = (status) => {
        switch (status) {
            case 'authorized': return 'text-green-600 bg-green-100';
            case 'pending_approval': return 'text-yellow-600 bg-yellow-100';
            case 'denied': return 'text-red-600 bg-red-100';
            case 'inside': return 'text-blue-600 bg-blue-100';
            case 'completed': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'authorized': return 'Autorizado';
            case 'pending_approval': return 'Pendiente';
            case 'denied': return 'Denegado';
            case 'inside': return 'Dentro';
            case 'completed': return 'Completado';
            default: return 'Desconocido';
        }
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'facial_recognition': return '🤳';
            case 'manual_registration': return '✍️';
            case 'license_plate': return '🚗';
            case 'card_access': return '💳';
            default: return '🔑';
        }
    };

    const handleVisitorRegistration = (e) => {
        e.preventDefault();
        const visitorId = Math.max(...visitors.map(v => v.id)) + 1;
        const visitor = {
            id: visitorId,
            ...newVisitor,
            resident: user?.username || 'Admin',
            entryTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'inside'
        };
        
        setVisitors(prev => [visitor, ...prev]);
        setNewVisitor({
            name: '',
            visitingUnit: '',
            expectedDuration: '',
            notes: '',
            hasPhoto: false
        });
        setActiveTab('visitors');
    };

    return (
        <Layout 
            title="Control de Seguridad" 
            description="Sistema de control de acceso y gestión de visitantes"
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

                {/* Access Log */}
                {activeTab === 'access-log' && (
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } rounded-lg border shadow-sm`}>
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <h3 className={`text-lg font-semibold ${
                                    isDark ? 'text-white' : 'text-gray-900'
                                }`}>Registro de Accesos - Tiempo Real</h3>
                                <div className={`text-sm ${
                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    🟢 Sistema activo
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {accessLog.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className={`p-4 rounded-lg border ${
                                            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-2xl">
                                                    {getMethodIcon(entry.method)}
                                                </div>
                                                <div>
                                                    <h4 className={`font-semibold ${
                                                        isDark ? 'text-white' : 'text-gray-900'
                                                    }`}>{entry.person}</h4>
                                                    <p className={`text-sm ${
                                                        isDark ? 'text-gray-300' : 'text-gray-600'
                                                    }`}>
                                                        {entry.unit} • {entry.camera}
                                                    </p>
                                                    <p className={`text-xs ${
                                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                        {entry.timestamp}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                    getStatusColor(entry.status)
                                                }`}>
                                                    {getStatusText(entry.status)}
                                                </span>
                                                <p className={`text-xs mt-1 ${
                                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                    {entry.type === 'entry' ? '🚪 Entrada' : 
                                                     entry.type === 'visitor' ? '👥 Visitante' : 
                                                     '🚗 Vehículo'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Visitors Management */}
                {activeTab === 'visitors' && (
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } rounded-lg border shadow-sm`}>
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className={`text-lg font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>Visitantes Activos</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <tr>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Visitante</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Visitando</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Entrada</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Duración</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Estado</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${
                                    isDark ? 'divide-gray-700' : 'divide-gray-200'
                                }`}>
                                    {visitors.map((visitor) => (
                                        <tr key={visitor.id}>
                                            <td className={`px-6 py-4 whitespace-nowrap ${
                                                isDark ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-white">
                                                            {visitor.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium">{visitor.name}</div>
                                                        <div className={`text-xs ${
                                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>{visitor.notes}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                isDark ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                                <div>{visitor.visitingUnit}</div>
                                                <div className="text-xs">{visitor.resident}</div>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                isDark ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                                {visitor.entryTime.replace('T', ' ').substring(0, 16)}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                isDark ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                                {visitor.expectedDuration}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    getStatusColor(visitor.status)
                                                }`}>
                                                    {getStatusText(visitor.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {visitor.status === 'inside' && (
                                                    <button className="text-red-600 hover:text-red-900">
                                                        Registrar Salida
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Register New Visitor */}
                {activeTab === 'register-visitor' && (user?.role === 'admin' || user?.role === 'security') && (
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } rounded-lg border shadow-sm p-6`}>
                        <h3 className={`text-lg font-semibold mb-6 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>Registrar Nuevo Visitante</h3>
                        
                        <form onSubmit={handleVisitorRegistration} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Nombre Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={newVisitor.name}
                                        onChange={(e) => setNewVisitor(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300'
                                        }`}
                                        placeholder="Nombre del visitante"
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Unidad a Visitar
                                    </label>
                                    <input
                                        type="text"
                                        value={newVisitor.visitingUnit}
                                        onChange={(e) => setNewVisitor(prev => ({ ...prev, visitingUnit: e.target.value }))}
                                        required
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300'
                                        }`}
                                        placeholder="Ej: Depto 301"
                                    />
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Duración Estimada
                                    </label>
                                    <select
                                        value={newVisitor.expectedDuration}
                                        onChange={(e) => setNewVisitor(prev => ({ ...prev, expectedDuration: e.target.value }))}
                                        required
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-gray-300' 
                                                : 'bg-white border-gray-300 text-gray-500'
                                        }`}
                                    >
                                        <option value="" className={isDark ? 'text-gray-300' : 'text-gray-500'}>Seleccionar duración</option>
                                        <option value="30 minutos" className={isDark ? 'text-gray-300' : 'text-gray-500'}>30 minutos</option>
                                        <option value="1 hora" className={isDark ? 'text-gray-300' : 'text-gray-500'}>1 hora</option>
                                        <option value="2 horas" className={isDark ? 'text-gray-300' : 'text-gray-500'}>2 horas</option>
                                        <option value="4 horas" className={isDark ? 'text-gray-300' : 'text-gray-500'}>4 horas</option>
                                        <option value="Todo el día" className={isDark ? 'text-gray-300' : 'text-gray-500'}>Todo el día</option>
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="hasPhoto"
                                        checked={newVisitor.hasPhoto}
                                        onChange={(e) => setNewVisitor(prev => ({ ...prev, hasPhoto: e.target.checked }))}
                                        className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="hasPhoto" className={`text-sm ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        📸 Foto tomada en recepción
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Notas Adicionales
                                </label>
                                <textarea
                                    value={newVisitor.notes}
                                    onChange={(e) => setNewVisitor(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    placeholder="Motivo de la visita, empresa, etc."
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
                                    onClick={() => setNewVisitor({
                                        name: '',
                                        visitingUnit: '',
                                        expectedDuration: '',
                                        notes: '',
                                        hasPhoto: false
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
                                    Registrar Visitante
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* AI Security Features - Future Implementation */}
                {activeTab === 'ai-security' && user?.role === 'admin' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                title: 'Reconocimiento Facial',
                                description: 'Acceso automático para residentes registrados',
                                icon: '🤳',
                                status: 'Próximamente',
                                color: 'blue'
                            },
                            {
                                title: 'Detección de Anomalías',
                                description: 'IA detecta comportamientos sospechosos',
                                icon: '👁️',
                                status: 'En Desarrollo',
                                color: 'yellow'
                            },
                            {
                                title: 'OCR para Vehículos',
                                description: 'Lectura automática de placas vehiculares',
                                icon: '🚗',
                                status: 'Próximamente',
                                color: 'purple'
                            },
                            {
                                title: 'Alertas Inteligentes',
                                description: 'Notificaciones automáticas de incidentes',
                                icon: '🚨',
                                status: 'Planificado',
                                color: 'red'
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className={`${
                                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                } rounded-lg border shadow-sm p-6 text-center`}
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className={`text-lg font-semibold mb-2 ${
                                    isDark ? 'text-white' : 'text-gray-900'
                                }`}>{feature.title}</h3>
                                <p className={`mb-4 ${
                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>{feature.description}</p>
                                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full bg-${feature.color}-100 text-${feature.color}-800`}>
                                    🤖 {feature.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Camera Management */}
                {activeTab === 'cameras' && user?.role === 'admin' && (
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } rounded-lg border shadow-sm p-8 text-center`}>
                        <div className="text-4xl mb-4">📹</div>
                        <h3 className={`text-xl font-semibold mb-2 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>Control Centralizado de Cámaras</h3>
                        <p className={`${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Gestión de cámaras con visión artificial para control de acceso y detección de anomalías.
                            <br />
                            <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full inline-block mt-2">
                                🤖 Requiere IA y Visión Artificial
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SecurityModule;