import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const CommunicationCenter = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('announcements');
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    // Mock data - Replace with real API calls
    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            title: 'Mantenimiento de Piscina',
            content: 'La piscina estará cerrada por mantenimiento desde el 15 al 18 de septiembre.',
            category: 'maintenance',
            priority: 'medium',
            author: 'Administración',
            date: '2025-09-10',
            status: 'published',
            pinned: true
        },
        {
            id: 2,
            title: 'Reunión Mensual de Propietarios',
            content: 'Se convoca a todos los propietarios a la reunión mensual el 25 de septiembre a las 19:00 en el salón de eventos.',
            category: 'meeting',
            priority: 'high',
            author: 'Administración',
            date: '2025-09-08',
            status: 'published',
            pinned: false
        },
        {
            id: 3,
            title: 'Nuevo Sistema de Seguridad',
            content: 'Se ha implementado un nuevo sistema de reconocimiento facial en la entrada principal.',
            category: 'security',
            priority: 'high',
            author: 'Seguridad',
            date: '2025-09-05',
            status: 'published',
            pinned: true
        }
    ]);

    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
        pinned: false
    });

    const categories = [
        { id: 'all', name: 'Todos', color: 'gray' },
        { id: 'general', name: 'General', color: 'blue' },
        { id: 'maintenance', name: 'Mantenimiento', color: 'yellow' },
        { id: 'security', name: 'Seguridad', color: 'red' },
        { id: 'meeting', name: 'Reuniones', color: 'purple' },
        { id: 'financial', name: 'Financiero', color: 'green' },
        { id: 'emergency', name: 'Emergencia', color: 'red' }
    ];

    const priorities = [
        { id: 'low', name: 'Baja', color: 'text-green-600 bg-green-100' },
        { id: 'medium', name: 'Media', color: 'text-yellow-600 bg-yellow-100' },
        { id: 'high', name: 'Alta', color: 'text-red-600 bg-red-100' }
    ];

    const tabs = [
        { id: 'announcements', name: 'Ver Anuncios', icon: '📢' },
        user?.role === 'admin' && { id: 'create', name: 'Crear Anuncio', icon: '➕' },
        user?.role === 'admin' && { id: 'manage', name: 'Gestionar', icon: '⚙️' }
    ].filter(Boolean);

    const getCategoryColor = (category) => {
        const cat = categories.find(c => c.id === category);
        return cat ? cat.color : 'gray';
    };

    const getPriorityColor = (priority) => {
        const prio = priorities.find(p => p.id === priority);
        return prio ? prio.color : 'text-gray-600 bg-gray-100';
    };

    const filteredAnnouncements = announcements.filter(announcement => 
        selectedCategory === 'all' || announcement.category === selectedCategory
    );

    const handleCreateAnnouncement = (e) => {
        e.preventDefault();
        const newId = Math.max(...announcements.map(a => a.id)) + 1;
        const announcement = {
            id: newId,
            ...newAnnouncement,
            author: user?.username || 'Admin',
            date: new Date().toISOString().split('T')[0],
            status: 'published'
        };
        
        setAnnouncements(prev => [announcement, ...prev]);
        setNewAnnouncement({
            title: '',
            content: '',
            category: 'general',
            priority: 'medium',
            pinned: false
        });
        setActiveTab('announcements');
    };

    return (
        <Layout 
            title="Centro de Comunicaciones" 
            description="Avisos, anuncios y comunicados del condominio"
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

                {/* View Announcements */}
                {activeTab === 'announcements' && (
                    <div className="space-y-6">
                        {/* Category Filter */}
                        <div className={`${
                            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } rounded-lg border shadow-sm p-4`}>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                            selectedCategory === category.id
                                                ? `bg-${category.color}-100 text-${category.color}-800 border-2 border-${category.color}-200`
                                                : isDark
                                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Announcements List */}
                        <div className="space-y-4">
                            {filteredAnnouncements
                                .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
                                .map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className={`${
                                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                                    } rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                                        announcement.pinned ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
                                    }`}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-3">
                                                {announcement.pinned && (
                                                    <div className="text-yellow-500" title="Anuncio Fijado">
                                                        📌
                                                    </div>
                                                )}
                                                <h3 className={`text-lg font-semibold ${
                                                    isDark ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {announcement.title}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    getPriorityColor(announcement.priority)
                                                }`}>
                                                    {priorities.find(p => p.id === announcement.priority)?.name}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm ${
                                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                    {announcement.date}
                                                </p>
                                                <p className={`text-xs ${
                                                    isDark ? 'text-gray-500' : 'text-gray-400'
                                                }`}>
                                                    Por {announcement.author}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <p className={`${
                                            isDark ? 'text-gray-300' : 'text-gray-700'
                                        } mb-4`}>
                                            {announcement.content}
                                        </p>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${getCategoryColor(announcement.category)}-100 text-${getCategoryColor(announcement.category)}-800`}>
                                                {categories.find(c => c.id === announcement.category)?.name || 'General'}
                                            </div>
                                            
                                            <div className="flex space-x-2">
                                                <button className={`text-sm ${
                                                    isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                                                }`}>
                                                    👁️ Ver detalles
                                                </button>
                                                {user?.role === 'admin' && (
                                                    <>
                                                        <button className="text-sm text-blue-600 hover:text-blue-800">
                                                            ✏️ Editar
                                                        </button>
                                                        <button className="text-sm text-red-600 hover:text-red-800">
                                                            🗑️ Eliminar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Announcement */}
                {activeTab === 'create' && user?.role === 'admin' && (
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } rounded-lg border shadow-sm p-6`}>
                        <h3 className={`text-lg font-semibold mb-6 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>Crear Nuevo Anuncio</h3>
                        
                        <form onSubmit={handleCreateAnnouncement} className="space-y-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Título del Anuncio
                                </label>
                                <input
                                    type="text"
                                    value={newAnnouncement.title}
                                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                        isDark 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300'
                                    }`}
                                    placeholder="Ej: Mantenimiento programado..."
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Contenido
                                </label>
                                <textarea
                                    value={newAnnouncement.content}
                                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                                    required
                                    rows={5}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                        isDark 
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                            : 'bg-white border-gray-300 placeholder-gray-500'
                                    }`}
                                    placeholder="Describe el anuncio con todos los detalles necesarios..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Categoría
                                    </label>
                                    <select
                                        value={newAnnouncement.category}
                                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, category: e.target.value }))}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-gray-300' 
                                                : 'bg-white border-gray-300 text-gray-500'
                                        }`}
                                    >
                                        {categories.filter(c => c.id !== 'all').map(category => (
                                            <option key={category.id} value={category.id} className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Prioridad
                                    </label>
                                    <select
                                        value={newAnnouncement.priority}
                                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-gray-300' 
                                                : 'bg-white border-gray-300 text-gray-500'
                                        }`}
                                    >
                                        {priorities.map(priority => (
                                            <option key={priority.id} value={priority.id} className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                                                {priority.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="pinned"
                                    checked={newAnnouncement.pinned}
                                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, pinned: e.target.checked }))}
                                    className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="pinned" className={`text-sm ${
                                    isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    📌 Fijar anuncio (aparecerá al principio)
                                </label>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setNewAnnouncement({
                                        title: '',
                                        content: '',
                                        category: 'general',
                                        priority: 'medium',
                                        pinned: false
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
                                    Publicar Anuncio
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Mobile App Push Notifications Placeholder */}
                {activeTab === 'manage' && user?.role === 'admin' && (
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } rounded-lg border shadow-sm p-8 text-center`}>
                        <div className="text-4xl mb-4">📱</div>
                        <h3 className={`text-xl font-semibold mb-2 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>Notificaciones Push</h3>
                        <p className={`${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Envío automático de notificaciones push a la aplicación móvil cuando se publican nuevos anuncios.
                            <br />
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block mt-2">
                                📱 Integrado con App Móvil
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CommunicationCenter;