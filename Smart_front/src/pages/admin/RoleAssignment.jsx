import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import Layout from '../../components/Layout';
import { SkeletonLoader, LoadingButton } from '../../components/common';

const RoleAssignment = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignLoading, setAssignLoading] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    
    const roles = [
        // Backend puede devolver tanto valores en inglés como en español
        { value: 'admin', label: 'Administrador', color: 'bg-red-100 text-red-800', icon: '👑' },
        { value: 'Administrador', label: 'Administrador', color: 'bg-red-100 text-red-800', icon: '👑' },
        { value: 'security', label: 'Seguridad', color: 'bg-yellow-100 text-yellow-800', icon: '🛡️' },
        { value: 'Seguridad', label: 'Seguridad', color: 'bg-yellow-100 text-yellow-800', icon: '🛡️' },
        { value: 'resident', label: 'Residente', color: 'bg-green-100 text-green-800', icon: '🏠' },
        { value: 'Residente', label: 'Residente', color: 'bg-green-100 text-green-800', icon: '🏠' }
    ];

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'Administrador') {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getAllUsers();
            console.log('Respuesta de getAllUsers en RoleAssignment:', response);
            
            if (response.success && Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                console.error('Respuesta no válida:', response);
                setUsers([]);
                setMessage({ 
                    type: 'error', 
                    text: 'Error: formato de respuesta no válido' 
                });
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            setUsers([]);
            setMessage({ 
                type: 'error', 
                text: 'Error al cargar la lista de usuarios' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setAssignLoading(prev => ({ ...prev, [userId]: true }));
        setMessage({ type: '', text: '' });

        try {
            await userService.assignRole(userId, newRole);
            
            // Update the user in the local state
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, role: newRole } : u
            ));

            setMessage({ 
                type: 'success', 
                text: `Rol actualizado correctamente` 
            });

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.detail || 'Error al asignar el rol' 
            });
        } finally {
            setAssignLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const getRoleInfo = (role) => {
        // Buscar por rol en español que viene del backend
        return roles.find(r => r.value === role) || roles.find(r => r.value === 'Residente'); // Default to Residente
    };

    const filteredUsers = Array.isArray(users) ? users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (u.first_name && u.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (u.last_name && u.last_name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        
        return matchesSearch && matchesRole;
    }) : [];

    if (user?.role !== 'admin' && user?.role !== 'Administrador') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4">
                        <svg className="mx-auto h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5a4 4 0 100-8 4 4 0 000 8zm-7 4a8 8 0 1114 0" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
                    <p className="text-gray-600">Solo los administradores pueden acceder a esta página.</p>
                </div>
            </div>
        );
    }

    return (
        <Layout 
            title="Asignación de Roles"
            description="Gestiona los roles y permisos de los usuarios del sistema"
        >
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="px-6 py-8 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-3 rounded-full mr-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2h1.5M9 7a2 2 0 00-2 2m0 0a2 2 0 00-2 2m2-2h-1.5m3 4v.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    Asignar Roles
                                </h1>
                                <p className="text-gray-600 mt-2">Gestiona los roles de usuarios del sistema</p>
                            </div>
                            <div className="text-sm bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg">
                                <strong>Total usuarios:</strong> {users.length}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="px-6 py-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar por usuario, email, nombre..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                </div>
                            </div>
                            <div>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                                >
                                    <option value="all" className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 py-2">Todos los roles</option>
                                    <option value="admin" className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 py-2">Administrador</option>
                                    <option value="security" className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 py-2">Seguridad</option>
                                    <option value="resident" className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 py-2">Residente</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.type === 'success' 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    }`}>
                        <div className="flex items-center">
                            {message.type === 'success' ? (
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                            {message.text}
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <SkeletonLoader type="table" />
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron usuarios</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No hay usuarios que coincidan con los filtros seleccionados.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Rol Actual
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Asignar Rol
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredUsers.map((userItem) => {
                                        const currentRoleInfo = getRoleInfo(userItem.role);
                                        return (
                                            <tr key={userItem.id} className="group hover:bg-blue-50 hover:shadow-sm dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {userItem.profile_picture ? (
                                                                <img
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                    src={userItem.profile_picture}
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center">
                                                                    <span className="text-sm font-medium text-white">
                                                                        {(userItem.first_name?.[0] || userItem.username[0]).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                                                {userItem.first_name && userItem.last_name
                                                                    ? `${userItem.first_name} ${userItem.last_name}`
                                                                    : userItem.username
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">@{userItem.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">{userItem.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentRoleInfo.color}`}>
                                                        <span className="mr-1">{currentRoleInfo.icon}</span>
                                                        {currentRoleInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={userItem.role}
                                                        onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                                                        disabled={assignLoading[userItem.id] || userItem.id === user.id}
                                                        className="text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                                                    >
                                                        <option value="resident" className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 py-2">Residente</option>
                                                        <option value="security" className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 py-2">Seguridad</option>
                                                        <option value="admin" className="bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 py-2">Administrador</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {assignLoading[userItem.id] && (
                                                        <LoadingButton 
                                                            loading={true}
                                                            loadingText="Actualizando..."
                                                            size="xs"
                                                            variant="ghost"
                                                            disabled
                                                        />
                                                    )}
                                                    {userItem.id === user.id && (
                                                        <span className="text-xs text-gray-400">
                                                            No puedes cambiar tu propio rol
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Role Information */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                👑
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Administrador</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {filteredUsers.filter(u => u.role === 'admin' || u.role === 'Administrador').length} usuarios
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Acceso completo al sistema, puede gestionar usuarios y roles.
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                🛡️
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seguridad</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {filteredUsers.filter(u => u.role === 'security' || u.role === 'Seguridad').length} usuarios
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Acceso a funciones de seguridad y monitoreo.
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                🏠
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Residente</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {filteredUsers.filter(u => u.role === 'resident' || u.role === 'Residente').length} usuarios
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Acceso básico como residente del condominio.
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RoleAssignment;
