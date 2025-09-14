import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const ResidentDashboard = () => {
    const { user } = useAuth();
    const [myReservations, setMyReservations] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);

    useEffect(() => {
        // Simular datos del residente
        setMyReservations([
            {
                id: 1,
                facility: 'Salón Social',
                date: '2024-03-15',
                time: '18:00 - 22:00',
                status: 'confirmed'
            },
            {
                id: 2,
                facility: 'Cancha de Tenis',
                date: '2024-03-20',
                time: '10:00 - 12:00',
                status: 'pending'
            }
        ]);

        setNotifications([
            {
                id: 1,
                type: 'info',
                title: 'Mantenimiento Programado',
                message: 'El ascensor principal estará en mantenimiento el sábado de 9AM a 12PM',
                date: '2024-03-10'
            },
            {
                id: 2,
                type: 'warning',
                title: 'Pago Pendiente',
                message: 'Tienes una cuota de administración pendiente',
                date: '2024-03-08'
            }
        ]);

        setPendingPayments([
            {
                id: 1,
                concept: 'Administración - Marzo 2024',
                amount: 150000,
                dueDate: '2024-03-15'
            },
            {
                id: 2,
                concept: 'Reserva Salón Social',
                amount: 50000,
                dueDate: '2024-03-14'
            }
        ]);
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'info':
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Layout 
            title="Mi Portal"
            description="Tu espacio personal en el condominio"
        >
            <div className="space-y-8">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow p-6 text-white">
                    <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <h1 className="text-2xl font-semibold">
                                ¡Bienvenido, {user?.first_name || user?.username}!
                            </h1>
                            <p className="mt-2 text-blue-100">
                                Tu portal personal del condominio. Aquí puedes ver tus reservas, notificaciones y más.
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                            <div className="inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 transition-colors">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Residente
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8h6m-6 4h6m2-14v18a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mis Reservas</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{myReservations.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pagos Pendientes</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pendingPayments.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Notificaciones</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{notifications.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* My Reservations */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Mis Reservas
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Tus próximas reservas de instalaciones
                            </p>
                        </div>
                        <div className="p-6">
                            {myReservations.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No tienes reservas actualmente
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {myReservations.map((reservation) => (
                                        <div key={reservation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {reservation.facility}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {reservation.date} • {reservation.time}
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(reservation.status)}`}>
                                                    {reservation.status === 'confirmed' ? 'Confirmado' : 
                                                     reservation.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-6">
                                <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                    Ver Todas las Reservas
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Notificaciones
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Avisos importantes del condominio
                            </p>
                        </div>
                        <div className="p-6">
                            {notifications.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No hay notificaciones nuevas
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {notifications.map((notification) => (
                                        <div key={notification.id} className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {notification.date}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pending Payments */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Pagos Pendientes
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Cuotas y servicios por pagar
                        </p>
                    </div>
                    <div className="p-6">
                        {pendingPayments.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                ¡Excelente! No tienes pagos pendientes
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {pendingPayments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {payment.concept}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Vence: {payment.dueDate}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                            <button className="mt-1 px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                                                Pagar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8h6m-6 4h6m2-14v18a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Nueva Reserva</span>
                    </button>

                    <button className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Realizar Pago</span>
                    </button>

                    <button className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Reportar Problema</span>
                    </button>

                    <button className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Contacto</span>
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default ResidentDashboard;