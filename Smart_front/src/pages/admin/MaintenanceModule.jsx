import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MaintenanceModule = () => {
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requests');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const mockMaintenanceRequests = [
        {
            id: 1,
            title: 'Fuga de agua en apartamento 301',
            description: 'Reportada fuga en el baño principal',
            status: 'pending',
            priority: 'high',
            apartment: '301',
            createdAt: '2024-01-15',
            assignedTo: 'Juan Pérez'
        },
        {
            id: 2,
            title: 'Mantenimiento de ascensor',
            description: 'Revisión preventiva mensual',
            status: 'in-progress',
            priority: 'medium',
            apartment: 'Común',
            createdAt: '2024-01-14',
            assignedTo: 'Carlos López'
        },
        {
            id: 3,
            title: 'Pintura de fachada',
            description: 'Renovación de pintura exterior',
            status: 'completed',
            priority: 'low',
            apartment: 'Edificio',
            createdAt: '2024-01-10',
            assignedTo: 'Ana García'
        }
    ];

    const mockWorkers = [
        { id: 1, name: 'Juan Pérez', specialty: 'Plomería', status: 'available' },
        { id: 2, name: 'Carlos López', specialty: 'Electricidad', status: 'busy' },
        { id: 3, name: 'Ana García', specialty: 'Pintura', status: 'available' },
        { id: 4, name: 'Luis Martín', specialty: 'General', status: 'available' }
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setMaintenanceRequests(mockMaintenanceRequests);
            setWorkers(mockWorkers);
            setLoading(false);
        }, 1000);
    }, []);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
            case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
            case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
            default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900';
            case 'in-progress': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
            case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
            default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Layout 
            title="Gestión de Mantenimiento"
            description="Administra solicitudes de mantenimiento y asigna trabajadores"
        >
            <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Gestión de Mantenimiento
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Administra solicitudes de mantenimiento y asigna trabajadores
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'requests'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        Solicitudes
                    </button>
                    <button
                        onClick={() => setActiveTab('workers')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'workers'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        Trabajadores
                    </button>
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'schedule'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        Programación
                    </button>
                </nav>
            </div>

            {/* Maintenance Requests Tab */}
            {activeTab === 'requests' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Solicitudes de Mantenimiento
                        </h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Nueva Solicitud
                        </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {maintenanceRequests.map((request) => (
                            <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                        {request.title}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                        {request.priority === 'high' ? 'Alta' : request.priority === 'medium' ? 'Media' : 'Baja'}
                                    </span>
                                </div>
                                
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {request.description}
                                </p>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Apartamento:</span>
                                        <span className="text-gray-900 dark:text-white">{request.apartment}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Estado:</span>
                                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                                            {request.status === 'pending' ? 'Pendiente' : 
                                             request.status === 'in-progress' ? 'En Progreso' : 'Completado'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Asignado a:</span>
                                        <span className="text-gray-900 dark:text-white">{request.assignedTo}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                                        <span className="text-gray-900 dark:text-white">{request.createdAt}</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex space-x-2">
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                                        Editar
                                    </button>
                                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                                        Completar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Workers Tab */}
            {activeTab === 'workers' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Trabajadores de Mantenimiento
                        </h2>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                            Agregar Trabajador
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Especialidad
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {workers.map((worker) => (
                                    <tr key={worker.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {worker.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {worker.specialty}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                worker.status === 'available' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {worker.status === 'available' ? 'Disponible' : 'Ocupado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3">
                                                Editar
                                            </button>
                                            <button className="text-red-600 hover:text-red-900 dark:text-red-400">
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Programación de Mantenimiento
                    </h2>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                Calendario de Mantenimiento
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Vista de calendario para programar mantenimientos preventivos
                            </p>
                            <div className="mt-6">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                    Configurar Calendar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </Layout>
    );
};

export default MaintenanceModule;