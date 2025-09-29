import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    getNotificacionesNoLeidas,
    marcarNotificacionLeida,
    marcarTodasLeidas,
    formatNotificationDate,
    getNotificationIcon
} from '../services/notificationsService';

const NotificationsPanel = ({ isOpen, onClose, onUnreadCountChange }) => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const panelRef = useRef(null);

    // Cargar notificaciones no leídas
    const cargarNotificaciones = async () => {
        if (!isOpen) return;

        try {
            setLoading(true);
            setError('');
            const response = await getNotificacionesNoLeidas();
            setNotificaciones(response || []);
            onUnreadCountChange?.((response || []).length);
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
            setError('Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    };

    // Marcar notificación como leída
    const marcarLeida = async (notificacionId) => {
        try {
            await marcarNotificacionLeida(notificacionId);
            // Remover la notificación de la lista
            setNotificaciones(prev => {
                const nuevas = prev.filter(n => n.id !== notificacionId);
                onUnreadCountChange?.(nuevas.length);
                return nuevas;
            });
        } catch (error) {
            console.error('Error marcando notificación como leída:', error);
        }
    };

    // Marcar todas como leídas
    const marcarTodasComoLeidas = async () => {
        try {
            await marcarTodasLeidas();
            setNotificaciones([]);
            onUnreadCountChange?.(0);
        } catch (error) {
            console.error('Error marcando todas como leídas:', error);
        }
    };

    // Cargar notificaciones cuando se abre el panel
    useEffect(() => {
        if (isOpen) {
            cargarNotificaciones();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className="notifications-panel absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-orange-200 dark:border-orange-700 z-50 max-h-96 overflow-hidden"
        >
            {/* Header del panel */}
            <div className="flex items-center justify-between p-4 border-b border-orange-200 dark:border-orange-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    🔔 Notificaciones
                </h3>
                <div className="flex items-center space-x-2">
                    {notificaciones.length > 0 && (
                        <button
                            onClick={marcarTodasComoLeidas}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            Marcar todas como leídas
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Contenido del panel */}
            <div className="max-h-80 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando...</span>
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-600 dark:text-red-400">
                        {error}
                    </div>
                ) : notificaciones.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-4xl mb-4">🔔</div>
                        <p className="text-gray-500 dark:text-gray-400">
                            No tienes notificaciones nuevas
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notificaciones.map((notificacion) => (
                            <div
                                key={notificacion.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
                                onClick={() => marcarLeida(notificacion.id)}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="text-2xl flex-shrink-0">
                                        {getNotificationIcon(notificacion.tipo)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {notificacion.titulo}
                                            </h4>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                                {formatNotificationDate(notificacion.fecha_creacion)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                            {notificacion.mensaje}
                                        </p>
                                        {notificacion.datos_extra && notificacion.datos_extra.aviso_id && (
                                            <Link
                                                to={`/comunicaciones/${notificacion.datos_extra.aviso_id}`}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-1 inline-block"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Ver aviso →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer del panel */}
            {notificaciones.length > 0 && (
                <div className="border-t border-orange-200 dark:border-orange-700 p-3">
                    <Link
                        to="/notificaciones"
                        onClick={onClose}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                        Ver todas las notificaciones →
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationsPanel;