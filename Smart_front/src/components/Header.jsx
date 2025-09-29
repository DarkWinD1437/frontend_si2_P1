import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './common/ThemeToggle';
import NotificationsPanel from './NotificationsPanel';
import { getNotificacionesNoLeidas } from '../services/notificationsService';

const Header = ({ onMenuClick, user, isCollapsed, onToggleCollapse }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { logout } = useAuth();
    const { isDark } = useTheme();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Click outside para cerrar panel de notificaciones
    useEffect(() => {
        const handleClickOutsideNotifications = (event) => {
            if (!event.target.closest('.notifications-panel') && !event.target.closest('.notifications-button')) {
                setNotificationsOpen(false);
            }
        };

        if (notificationsOpen) {
            document.addEventListener('mousedown', handleClickOutsideNotifications);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideNotifications);
        };
    }, [notificationsOpen]);

    // Cargar contador de notificaciones no leídas
    useEffect(() => {
        const cargarContadorNotificaciones = async () => {
            if (user) {
                try {
                    console.log('🔔 Header: Llamando getNotificacionesNoLeidas...');
                    const response = await getNotificacionesNoLeidas();
                    console.log('🔔 Header: Respuesta de getNotificacionesNoLeidas:', response);
                    console.log('🔔 Header: Tipo de response:', typeof response, Array.isArray(response) ? 'es array' : 'no es array');
                    console.log('🔔 Header: Contador actualizado, notificaciones no leídas:', response.length || 0);
                    setUnreadCount(response.length || 0);
                    console.log('🔔 Header: unreadCount establecido a:', response.length || 0);
                } catch (error) {
                    console.error('Error cargando contador de notificaciones:', error);
                    console.error('Error details:', error);
                    setUnreadCount(0);
                }
            }
        };

        cargarContadorNotificaciones();

        // Actualizar cada 30 segundos
        const interval = setInterval(cargarContadorNotificaciones, 30000);

        // Escuchar evento de notificación enviada
        const handleNotificacionEnviada = () => {
            console.log('🔔 Header: Evento notificacion-enviada recibido - actualizando contador');
            cargarContadorNotificaciones();
        };

        // Escuchar evento de notificación recibida (push)
        const handleNotificacionRecibida = (event) => {
            console.log('🔔 Header: Evento notificacion-recibida recibido:', event.detail);
            console.log('Actualizando contador de notificaciones...');
            cargarContadorNotificaciones();
        };

        console.log('Header: Configurando event listeners para notificaciones');
        window.addEventListener('notificacion-enviada', handleNotificacionEnviada);
        window.addEventListener('notificacion-recibida', handleNotificacionRecibida);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notificacion-enviada', handleNotificacionEnviada);
            window.removeEventListener('notificacion-recibida', handleNotificacionRecibida);
        };
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'admin': return 'Administrador';
            case 'security': return 'Seguridad';
            case 'resident': return 'Residente';
            default: return 'Usuario';
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
            case 'security': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
            case 'resident': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
        }
    };

    return (
        <header className='bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-sm border-b border-orange-200 dark:border-orange-800 z-10 backdrop-blur-sm'>
            <div className='flex items-center justify-between px-6 py-4'>
                {/* Left side */}
                <div className='flex items-center space-x-4'>
                    <button
                        onClick={onMenuClick}
                        className='lg:hidden text-amber-600 dark:text-amber-400 hover:text-orange-700 dark:hover:text-orange-300 focus:outline-none focus:text-orange-700 dark:focus:text-orange-300 transition-colors'
                    >
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                        </svg>
                    </button>

                    {/* Desktop collapse toggle */}
                    <button
                        onClick={onToggleCollapse}
                        className='hidden lg:block text-amber-600 dark:text-amber-400 hover:text-orange-700 dark:hover:text-orange-300 focus:outline-none focus:text-orange-700 dark:focus:text-orange-300 transition-colors p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30'
                        title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                    >
                        <svg className={`w-5 h-5 transform transition-transform duration-300 ${
                            isCollapsed ? 'rotate-180' : ''
                        }`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 19l-7-7 7-7m8 14l-7-7 7-7' />
                        </svg>
                    </button>

                    <div className='hidden lg:flex items-center space-x-2'>
                        <svg className='w-5 h-5 text-amber-600 dark:text-amber-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' />
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z' />
                        </svg>
                        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>Smart Condominium</h2>
                    </div>
                </div>

                {/* Right side */}
                <div className='flex items-center space-x-4'>
                    {/* Theme toggle */}
                    <ThemeToggle />

                    {/* Role changer (solo para admin en demo) */}
                    {user?.role === 'admin' && (
                        <>
                        <button
                            onClick={() => {
                                const currentUser = JSON.parse(localStorage.getItem('user'));
                                const newRole = currentUser.role === 'admin' ? 'resident' : 'admin';
                                currentUser.role = newRole;
                                localStorage.setItem('user', JSON.stringify(currentUser));
                                window.location.reload();
                            }}
                            className='px-3 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-800/40 rounded-full transition-colors'
                            title='Cambiar rol (demo)'
                        >
                            {user?.role === 'admin' ? '👑→🏠' : '🏠→👑'}
                        </button>

                        {/* Test notification button */}
                        <button
                            onClick={async () => {
                                console.log('🧪 Enviando notificación de prueba...');
                                try {
                                    const response = await fetch('http://localhost:8000/api/notifications/test/', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Token ${sessionStorage.getItem('token')}`
                                        },
                                        body: JSON.stringify({
                                            titulo: '🧪 Notificación de Prueba',
                                            mensaje: 'Esta es una notificación de prueba para verificar el badge del header',
                                            tipo: 'prueba'
                                        })
                                    });

                                    if (response.ok) {
                                        console.log('✅ Notificación de prueba enviada');
                                        alert('Notificación de prueba enviada. Revisa la consola y el badge.');
                                    } else {
                                        console.error('❌ Error enviando notificación de prueba');
                                        alert('Error enviando notificación de prueba');
                                    }
                                } catch (error) {
                                    console.error('❌ Error:', error);
                                    alert('Error de conexión');
                                }
                            }}
                            className='px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40 rounded-full transition-colors'
                            title='Enviar notificación de prueba'
                        >
                            🧪 Test
                        </button>
                        </>
                    )}

                    {/* Notifications */}
                    <div className='relative'>
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className='notifications-button relative p-2 text-amber-600 dark:text-amber-400 hover:text-orange-700 dark:hover:text-orange-300 focus:outline-none focus:text-orange-700 dark:focus:text-orange-300 transition-colors'
                            title='Notificaciones'
                        >
                            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                            </svg>
                            {unreadCount > 0 && (
                                <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800'></span>
                            )}
                        </button>

                        {/* Notifications Panel */}
                        {notificationsOpen && (
                            <NotificationsPanel
                                isOpen={notificationsOpen}
                                onClose={() => setNotificationsOpen(false)}
                                onUnreadCountChange={setUnreadCount}
                            />
                        )}
                    </div>

                    {/* User dropdown */}
                    <div className='relative' ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className='flex items-center space-x-3 p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 focus:outline-none focus:bg-orange-100 dark:focus:bg-orange-900/30 transition-colors'
                        >
                            {user?.profile_picture ? (
                                <img
                                    src={user.profile_picture}
                                    alt='Foto de perfil'
                                    className='h-8 w-8 rounded-full object-cover border-2 border-orange-200 dark:border-orange-700'
                                />
                            ) : (
                                <div className='h-8 w-8 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center border-2 border-orange-200 dark:border-orange-700'>
                                    <span className='text-sm font-medium text-white'>
                                        {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className='hidden sm:block text-left'>
                                <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                                    {user?.first_name && user?.last_name
                                        ? `${user.first_name} ${user.last_name}`
                                        : user?.username || 'Usuario'
                                    }
                                </p>
                                <p className='text-xs text-gray-600 dark:text-gray-400'>
                                    {getRoleDisplayName(user?.role)}
                                </p>
                            </div>
                            <svg className='w-4 h-4 text-amber-600 dark:text-amber-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                            </svg>
                        </button>

                        {/* Dropdown menu */}
                        {dropdownOpen && (
                            <div className='absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-orange-200 dark:border-orange-700 py-2 z-50 backdrop-blur-sm'>
                                {/* User info */}
                                <div className='px-4 py-3 border-b border-orange-200 dark:border-orange-700'>
                                    <div className='flex items-center space-x-3'>
                                        {user?.profile_picture ? (
                                            <img
                                                src={user.profile_picture}
                                                alt='Foto de perfil'
                                                className='h-12 w-12 rounded-full object-cover border-2 border-orange-200 dark:border-orange-700'
                                            />
                                        ) : (
                                            <div className='h-12 w-12 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center border-2 border-orange-200 dark:border-orange-700'>
                                                <span className='text-lg font-medium text-white'>
                                                    {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div className='flex-1'>
                                            <p className='font-medium text-gray-900 dark:text-gray-100'>
                                            {user?.first_name && user?.last_name
                                                    ? `${user.first_name} ${user.last_name}`
                                                    : user?.username || 'Usuario'
                                                }
                                            </p>
                                            <p className='text-sm text-gray-600 dark:text-gray-400'>{user?.email}</p>
                                            <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
                                                {getRoleDisplayName(user?.role)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu items */}
                                <div className='py-2'>
                                    <Link
                                        to='/profile'
                                        onClick={() => setDropdownOpen(false)}
                                        className='flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors'
                                    >
                                        <svg className='w-4 h-4 mr-3 text-amber-600 dark:text-amber-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                        </svg>
                                        Mi Perfil
                                    </Link>

                                    <Link
                                        to='/dashboard'
                                        onClick={() => setDropdownOpen(false)}
                                        className='flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors'
                                    >
                                        <svg className='w-4 h-4 mr-3 text-amber-600 dark:text-amber-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' />
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z' />
                                        </svg>
                                        Dashboard
                                    </Link>

                                    {user?.role === 'admin' && (
                                        <>
                                            <Link
                                                to='/roles'
                                                onClick={() => setDropdownOpen(false)}
                                                className='flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors'
                                            >
                                                <svg className='w-4 h-4 mr-3 text-amber-600 dark:text-amber-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2h1.5M9 7a2 2 0 00-2 2m0 0a2 2 0 00-2 2m2-2h-1.5m3 4v.01' />
                                                </svg>
                                                Gestionar Roles
                                            </Link>

                                            <Link
                                                to='/register'
                                                onClick={() => setDropdownOpen(false)}
                                                className='flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors'
                                            >
                                                <svg className='w-4 h-4 mr-3 text-amber-600 dark:text-amber-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' />
                                                </svg>
                                                Registrar Usuario
                                            </Link>
                                        </>
                                    )}
                                </div>

                                {/* Logout */}
                                <div className='border-t border-orange-200 dark:border-orange-700 py-2'>
                                    <button
                                        onClick={handleLogout}
                                        className='flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors'
                                    >
                                        <svg className='w-4 h-4 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                                        </svg>
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
