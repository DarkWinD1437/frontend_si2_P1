import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { useState, useEffect } from 'react';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
    const location = useLocation();
    const { user } = useAuth();
    const { startPageLoading, stopPageLoading } = useLoading();
    const [isHovering, setIsHovering] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and window resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Show expanded sidebar on hover when collapsed
    const shouldShowExpanded = isCollapsed ? isHovering : true;

    // Handle navigation with loading animation
    const handleNavigation = (itemName) => {
        startPageLoading(`Cargando ${itemName}...`);
        // Close sidebar on mobile
        if (isMobile && onClose) {
            onClose();
        }
        // Stop loading after a short delay to show the animation
        setTimeout(() => {
            stopPageLoading();
        }, 800);
    };

    const navigationItems = [
        {
            name: 'Panel Administrativo',
            path: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            roles: ['admin'],
            isAdminOnly: true
        },
        // Gestión de Usuarios y Perfiles
        {
            name: 'Gestionar Perfiles',
            path: '/manage-profiles',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            roles: ['admin'],
            isAdminOnly: true
        },
        {
            name: 'Registrar Usuario',
            path: '/register',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
            roles: ['admin'],
            isAdminOnly: true
        },
        // Gestión Financiera
        {
            name: 'Gestión Financiera',
            path: '/finances',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            roles: ['admin'],
            isAdminOnly: true
        },
        {
            name: 'Estado de Cuenta',
            path: '/estado-cuenta',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            roles: ['admin'],
            isAdminOnly: true
        },
        // Seguridad y Control
        {
            name: 'Control de Acceso',
            path: '/access-control',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            roles: ['admin'],
            isAdminOnly: true
        },
        // Gestión de Instalaciones
        {
            name: 'Gestión de Áreas Comunes',
            path: '/areas',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            roles: ['admin'],
            isAdminOnly: true
        },
        {
            name: 'Reservas - Administración',
            path: '/reservations',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            roles: ['admin'],
            isAdminOnly: true
        },
        {
            name: 'Mantenimiento',
            path: '/maintenance',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            roles: ['admin'],
            isAdminOnly: true
        },
        // Comunicación y Gestión
        {
            name: 'Avisos y Comunicados',
            path: '/comunicaciones',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            ),
            roles: ['admin'],
            isAdminOnly: true
        },
        // Analítica y Configuración
        {
            name: 'Analytics y Reportes',
            path: '/analytics',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
            ),
            roles: ['admin'],
            isAdminOnly: true
        }
    ];

    // Solo admins pueden usar la aplicación web
    const filteredItems = navigationItems.filter(item => 
        (user?.role === 'admin' || user?.role === 'Administrador') && item.roles.includes('admin')
    );

    // Todos los elementos son administrativos ahora
    const adminItems = filteredItems;

    return (
        <>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(249, 115, 22, 0.15);
                    border-radius: 2px;
                    transition: all 0.3s ease;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(249, 115, 22, 0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(249, 115, 22, 0.4);
                }
            `}</style>
            {isOpen && !isCollapsed && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div 
                className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-amber-800 via-orange-800 to-red-900 dark:from-amber-900 dark:via-orange-900 dark:to-red-950 text-white transform transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${
                    // Mobile behavior
                    isMobile 
                        ? `w-80 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
                        // Desktop behavior
                        : `${isCollapsed ? (shouldShowExpanded ? 'w-80' : 'w-16') : 'w-80'} translate-x-0`
                } lg:static lg:inset-0 shadow-2xl backdrop-blur-sm`}
                style={{ height: '100vh' }}
                onMouseEnter={() => isCollapsed && setIsHovering(true)}
                onMouseLeave={() => isCollapsed && setIsHovering(false)}
            >
                
                <div className={`flex items-center justify-between p-6 border-b border-orange-600 dark:border-orange-800 transition-all duration-300 ${
                    isCollapsed && !shouldShowExpanded ? 'px-0 py-4 justify-center' : 'px-6'
                }`}>
                    <div className={`flex items-center transition-all duration-300 ${
                        isCollapsed && !shouldShowExpanded ? 'justify-center w-full' : 'space-x-3'
                    }`}>
                        <div className={`bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-lg ring-2 ring-orange-400/30 ${
                            isCollapsed && !shouldShowExpanded ? 'mx-auto' : ''
                        }`}>
                            <svg className="w-8 h-8 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <div className={`transition-all duration-300 ${
                            isCollapsed && !shouldShowExpanded ? 'opacity-0 w-0' : 'opacity-100'
                        }`}>
                            <h1 className="text-lg font-bold drop-shadow-sm">Smart Condominium</h1>
                            <p className="text-xs text-orange-200">Sistema de Gestión</p>
                        </div>
                    </div>
                    
                    {/* Mobile close button */}
                    {isMobile && (
                        <button
                            onClick={onClose}
                            className="text-orange-200 hover:text-white p-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {user && (
                    <div className={`p-4 border-b border-orange-600 dark:border-orange-800 transition-all duration-300 ${
                        isCollapsed && !shouldShowExpanded ? 'px-2' : 'px-4'
                    }`}>
                        <div className={`flex items-center space-x-3 ${
                            isCollapsed && !shouldShowExpanded ? 'justify-center' : ''
                        }`}>
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-orange-400/30">
                                <span className="text-sm font-bold text-white drop-shadow-sm">
                                    {user.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className={`flex-1 min-w-0 transition-all duration-300 ${
                                isCollapsed && !shouldShowExpanded ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                            }`}>
                                <p className="text-sm font-medium text-white truncate">
                                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                                </p>
                                <p className="text-xs text-orange-200 capitalize">
                                    {(user.role === 'admin' || user.role === 'Administrador') ? 'Administrador' : 
                                     (user.role === 'resident' || user.role === 'Residente') ? 'Residente' : 
                                     (user.role === 'security' || user.role === 'Seguridad') ? 'Seguridad' : user.role}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <nav className={`flex-1 py-6 overflow-y-auto overflow-x-hidden transition-all duration-300 custom-scrollbar ${
                    isCollapsed && !shouldShowExpanded ? 'px-2' : 'px-4'
                }`} style={{ 
                    maxHeight: 'calc(100vh - 280px)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(249, 115, 22, 0.2) transparent'
                }}>
                    
                    {/* Admin Only Section */}
                    {(user?.role === 'admin' || user?.role === 'Administrador') && adminItems.length > 0 && (
                        <>
                            <div className={`mb-4 transition-all duration-300 ${
                                isCollapsed && !shouldShowExpanded ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
                            }`}>
                                <h3 className="text-xs font-semibold text-orange-300 uppercase tracking-wider px-3 mb-2">
                                    Administración
                                </h3>
                            </div>
                            <div className="space-y-1">
                                {adminItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.path}
                                            onClick={() => handleNavigation(item.name)}
                                            className={`flex items-center text-sm font-medium rounded-lg transition-all duration-200 group relative ${
                                                isActive
                                                    ? 'bg-orange-700 dark:bg-orange-800 text-white shadow-lg ring-2 ring-orange-400/30'
                                                    : 'text-orange-100 hover:bg-orange-700 dark:hover:bg-orange-800 hover:text-white'
                                            } ${
                                                isCollapsed && !shouldShowExpanded 
                                                    ? 'p-3 justify-center w-full' 
                                                    : 'px-3 py-3'
                                            }`}
                                        >
                                            <span className="flex-shrink-0">{item.icon}</span>
                                            <span className={`flex-1 transition-all duration-300 ${
                                                isCollapsed && !shouldShowExpanded 
                                                    ? 'opacity-0 w-0 ml-0 overflow-hidden' 
                                                    : 'opacity-100 ml-3'
                                            }`}>
                                                {item.name}
                                            </span>
                                            {isActive && shouldShowExpanded && (
                                                <div className="ml-auto w-2 h-2 bg-orange-300 rounded-full animate-pulse flex-shrink-0"></div>
                                            )}
                                            
                                            {/* Tooltip for collapsed state */}
                                            {isCollapsed && !shouldShowExpanded && (
                                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                                    {item.name}
                                                    <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </nav>

                <div className={`p-4 border-t border-orange-600 dark:border-orange-800 transition-all duration-300 ${
                    isCollapsed && !shouldShowExpanded ? 'px-2 opacity-0 h-0 overflow-hidden' : 'px-4 opacity-100'
                }`}>
                    <div className="text-xs text-orange-300 text-center space-y-1">
                        <p className="font-medium">Smart Condominium v1.0</p>
                        <p>© 2025 - Sistema Integral de Gestión</p>
                        <div className="flex items-center justify-center mt-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-green-300">Sistema Activo</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;