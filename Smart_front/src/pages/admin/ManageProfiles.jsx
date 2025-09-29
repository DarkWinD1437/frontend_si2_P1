import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import Layout from '../../components/Layout';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import LoadingButton from '../../components/common/LoadingButton';
import PulseLoader from '../../components/common/PulseLoader';

const ManageProfiles = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('active');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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

    const fetchUsers = async (forceRefresh = false) => {
        setLoading(true);
        try {
            const response = await userService.getAllUsers(forceRefresh);
            
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

    const handleEditUser = (userToEdit) => {
        setSelectedUser({
            ...userToEdit,
            first_name: userToEdit.first_name || '',
            last_name: userToEdit.last_name || '',
            phone: userToEdit.phone || '',
            address: userToEdit.address || '',
            document_type: userToEdit.document_type || 'CI',
            document_number: userToEdit.document_number || '',
            unit_number: userToEdit.unit_number || '',
            role: userToEdit.role || 'Residente',
            password: '',
            confirmPassword: ''
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        
        try {
            // Mapear el rol del formulario al formato que espera el backend
            const roleMapping = {
                'Residente': 'resident',
                'Seguridad': 'security', 
                'Administrador': 'admin'
            };

            const updateData = {
                first_name: selectedUser.first_name,
                last_name: selectedUser.last_name,
                email: selectedUser.email,
                username: selectedUser.username,
                phone: selectedUser.phone,
                address: selectedUser.address,
                role: roleMapping[selectedUser.role] || selectedUser.role.toLowerCase(),
                document_type: selectedUser.document_type,
                document_number: selectedUser.document_number,
                unit_number: selectedUser.unit_number,
                is_active: selectedUser.is_active
            };

            // Filter out undefined values to avoid sending null to backend
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            // If password is provided, include it
            if (selectedUser.password) {
                if (selectedUser.password !== selectedUser.confirmPassword) {
                    setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
                    return;
                }
                updateData.password = selectedUser.password;
            }

            console.log('Updating user:', selectedUser.id, 'with data:', updateData);
            const result = await userService.updateUser(selectedUser.id, updateData);
            console.log('Update successful:', result);
            
            // Update local state with original role value for UI
            const localUpdateData = { ...updateData, role: selectedUser.role };
            setUsers(prev => prev.map(u => 
                u.id === selectedUser.id ? { ...u, ...localUpdateData } : u
            ));

            setMessage({ type: 'success', text: 'Usuario actualizado correctamente' });
            setIsEditModalOpen(false);
            setSelectedUser(null);

            // Refrescar la lista de usuarios
            await fetchUsers(true);

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
        } catch (error) {
            console.error('Error updating user:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error details:', JSON.stringify(error.response?.data, null, 2));
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || error.response?.data?.detail || 
                      (error.response?.data && typeof error.response.data === 'object' ? 
                       JSON.stringify(error.response.data) : 'Error al actualizar el usuario')
            });
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        const action = currentStatus ? 'desactivar' : 'activar';
        const confirmMessage = currentStatus 
            ? '¿Estás seguro de que deseas desactivar este usuario? No podrá iniciar sesión hasta que lo reactives.'
            : '¿Estás seguro de que deseas activar este usuario? Podrá iniciar sesión nuevamente.';
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            await userService.updateUser(userId, { is_active: !currentStatus });
            
            setMessage({ 
                type: 'success', 
                text: `Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente` 
            });

            // Refrescar la lista de usuarios
            await fetchUsers(true);

            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
        } catch (error) {
            console.error('Error changing user status:', error);
            setMessage({ 
                type: 'error', 
                text: 'Error al cambiar el estado del usuario' 
            });
        }
    };

    const handleDeleteUser = async (userId, username) => {
        const confirmMessage = `¿Estás seguro de que deseas desactivar al usuario "${username}"?\n\nEsta acción:\n• Desactivará la cuenta del usuario\n• El usuario no podrá iniciar sesión\n• Los datos se conservarán en el sistema\n• El usuario desaparecerá de la lista de usuarios activos\n\n¿Deseas continuar?`;
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            await userService.updateUser(userId, { is_active: false });
            
            setMessage({ 
                type: 'success', 
                text: `Usuario "${username}" desactivado correctamente. Ya no podrá acceder al sistema.` 
            });

            // Refrescar la lista de usuarios
            await fetchUsers(true);

            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
        } catch (error) {
            console.error('Error deleting user:', error);
            setMessage({ 
                type: 'error', 
                text: 'Error al desactivar el usuario' 
            });
        }
    };

    const getRoleInfo = (user) => {
        // Obtener el rol directamente del campo role
        let role = user?.role || 'Residente';
        
        // Buscar la configuración del rol - buscar tanto valor exacto como fallback
        let roleInfo = roles.find(r => r.value === role);
        
        // Si no se encuentra, intentar mapeos comunes
        if (!roleInfo) {
            if (role === 'admin' || role === 'Administrador') {
                roleInfo = roles.find(r => r.value === 'Administrador') || roles.find(r => r.value === 'admin');
            } else if (role === 'security' || role === 'Seguridad') {
                roleInfo = roles.find(r => r.value === 'Seguridad') || roles.find(r => r.value === 'security');
            } else if (role === 'resident' || role === 'Residente') {
                roleInfo = roles.find(r => r.value === 'Residente') || roles.find(r => r.value === 'resident');
            }
        }
        
        // Fallback final - residente por defecto
        if (!roleInfo) {
            roleInfo = { value: 'Residente', label: 'Residente', color: 'bg-green-100 text-green-800', icon: '🏠' };
        }
        
        return roleInfo;
    };

    const filteredUsers = Array.isArray(users) ? users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (u.first_name && u.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (u.last_name && u.last_name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Obtener el rol del usuario de la misma manera que getRoleInfo
        const userRole = u?.role || 'Residente';
        
        const matchesRole = roleFilter === 'all' || userRole === roleFilter;
        
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && u.is_active) || 
                            (statusFilter === 'inactive' && !u.is_active);
        
        return matchesSearch && matchesRole && matchesStatus;
    }) : [];

    if (user?.role !== 'admin') {
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
            title="Gestionar Perfiles"
            description="Administra la información de los usuarios del sistema"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full mr-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    Gestionar Perfiles
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">Administra la información personal de todos los usuarios</p>
                            </div>
                            <div className="text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg flex items-center justify-between">
                                <span><strong>Mostrando:</strong> {filteredUsers.length} de {users.length} usuarios</span>
                                <button
                                    onClick={() => fetchUsers(true)}
                                    disabled={loading}
                                    className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refrescar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="px-6 py-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar por usuario, email, nombre..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm cursor-pointer"
                                    style={{
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
                                    }}
                                >
                                    <option value="all" style={{
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
                                    }}>Todos los roles</option>
                                    <option value="Administrador" style={{
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
                                    }}>Administrador</option>
                                    <option value="Seguridad" style={{
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
                                    }}>Seguridad</option>
                                    <option value="Residente" style={{
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
                                    }}>Residente</option>
                                </select>
                            </div>
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm cursor-pointer"
                                    style={{
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
                                    }}
                                >
                                    <option value="active" style={{
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
                                    }}>Usuarios Activos</option>
                                    <option value="inactive" style={{
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
                                    }}>Usuarios Inactivos</option>
                                    <option value="all" style={{
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                        color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827'
                                    }}>Todos los Estados</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.type === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
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
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
                            <p className="mt-1 text-sm text-gray-500">No hay usuarios que coincidan con los filtros seleccionados.</p>
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
                                            Información Personal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Rol
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
                                    {filteredUsers.map((userItem) => {
                                        const roleInfo = getRoleInfo(userItem);
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
                                                                @{userItem.username}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">{userItem.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                                        {userItem.first_name || userItem.last_name 
                                                            ? `${userItem.first_name || ''} ${userItem.last_name || ''}`.trim()
                                                            : 'Sin información'
                                                        }
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                        Registro: {new Date(userItem.date_joined).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {roleInfo && (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
                                                            <span className="mr-1">{roleInfo.icon}</span>
                                                            {roleInfo.label}
                                                        </span>
                                                    )}
                                                    {!roleInfo && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            <span className="mr-1">❓</span>
                                                            {userItem.role || 'Sin rol'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleToggleUserStatus(userItem.id, userItem.is_active)}
                                                        disabled={userItem.id === user.id}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                            userItem.is_active 
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        } ${userItem.id === user.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                    >
                                                        {userItem.is_active ? 'Activo' : 'Inactivo'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => handleEditUser(userItem)}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                                        >
                                                            Editar
                                                        </button>
                                                        {userItem.id !== user.id && userItem.is_active && (
                                                            <button
                                                                onClick={() => handleDeleteUser(userItem.id, userItem.username)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                            >
                                                                Desactivar
                                                            </button>
                                                        )}
                                                        {userItem.id === user.id && (
                                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                (Tu perfil)
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Edit User Modal */}
                {isEditModalOpen && selectedUser && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Editar Usuario: {selectedUser.username}
                                    </h3>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateUser} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre de Usuario
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedUser.username}
                                                onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={selectedUser.email}
                                                onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedUser.first_name || ''}
                                                onChange={(e) => setSelectedUser({...selectedUser, first_name: e.target.value})}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Apellido
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedUser.last_name || ''}
                                                onChange={(e) => setSelectedUser({...selectedUser, last_name: e.target.value})}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono
                                            </label>
                                            <input
                                                type="tel"
                                                value={selectedUser.phone || ''}
                                                onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="+591 12345678"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Rol del Usuario
                                            </label>
                                            <select
                                                value={selectedUser.role || 'Residente'}
                                                onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="Residente">Residente</option>
                                                <option value="Seguridad">Personal de Seguridad</option>
                                                <option value="Administrador">Administrador</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo de Documento
                                            </label>
                                            <select
                                                value={selectedUser.document_type || 'CI'}
                                                onChange={(e) => setSelectedUser({...selectedUser, document_type: e.target.value})}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="CI">Cédula de Identidad</option>
                                                <option value="PASSPORT">Pasaporte</option>
                                                <option value="RUC">RUC</option>
                                                <option value="NIT">NIT</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Número de Documento
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedUser.document_number || ''}
                                                onChange={(e) => setSelectedUser({...selectedUser, document_number: e.target.value})}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Número del documento"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Número de Unidad
                                                <span className="text-gray-500 text-xs ml-1">(Solo residentes)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedUser.unit_number || ''}
                                                onChange={(e) => setSelectedUser({...selectedUser, unit_number: e.target.value})}
                                                disabled={selectedUser.role !== 'Residente'}
                                                className={`block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                                                    selectedUser.role !== 'Residente' ? 'bg-gray-100 text-gray-500' : ''
                                                }`}
                                                placeholder="Ej: A-101, B-205"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nueva Contraseña (opcional)
                                            </label>
                                            <input
                                                type="password"
                                                value={selectedUser.password || ''}
                                                onChange={(e) => setSelectedUser({...selectedUser, password: e.target.value})}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Dejar vacío para no cambiar"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Confirmar Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                value={selectedUser.confirmPassword || ''}
                                                onChange={(e) => setSelectedUser({...selectedUser, confirmPassword: e.target.value})}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Confirmar nueva contraseña"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dirección Completa
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={selectedUser.address || ''}
                                            onChange={(e) => setSelectedUser({...selectedUser, address: e.target.value})}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Dirección completa del usuario"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedUser.is_active}
                                                onChange={(e) => setSelectedUser({...selectedUser, is_active: e.target.checked})}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 block text-sm text-gray-900">
                                                Usuario activo
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-6">
                                            Si está desactivado, el usuario no podrá iniciar sesión en el sistema
                                        </p>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Cancelar
                                        </button>
                                        <LoadingButton
                                            type="submit"
                                            loading={updateLoading}
                                            loadingText="Actualizando..."
                                            className="px-4 py-2"
                                        >
                                            Actualizar Usuario
                                        </LoadingButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ManageProfiles;