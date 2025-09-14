import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import Layout from '../components/Layout';

const UserProfile = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        profile_picture: null
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('profile');
    const [pictureFile, setPictureFile] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await userService.getProfile();
            setProfile(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al cargar el perfil' });
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const updatedProfile = await userService.updateProfile(profile);
            setProfile(updatedProfile);
            updateUser(updatedProfile);
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.detail || 'Error al actualizar el perfil' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }

        setPasswordLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await userService.changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            setMessage({ type: 'success', text: 'Contraseña cambiada correctamente' });
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.detail || 'Error al cambiar la contraseña' 
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPictureFile(file);
        }
    };

    const handlePictureUpload = async () => {
        if (!pictureFile) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('profile_picture', pictureFile);
            
            const updatedProfile = await userService.uploadProfilePicture(formData);
            setProfile(updatedProfile);
            updateUser(updatedProfile);
            setPictureFile(null);
            setMessage({ type: 'success', text: 'Foto de perfil actualizada' });
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: 'Error al subir la foto de perfil' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePictureDelete = async () => {
        setLoading(true);
        try {
            await userService.deleteProfilePicture();
            setProfile(prev => ({ ...prev, profile_picture: null }));
            updateUser({ ...user, profile_picture: null });
            setMessage({ type: 'success', text: 'Foto de perfil eliminada' });
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: 'Error al eliminar la foto de perfil' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout 
            title="Mi Perfil"
            description="Gestiona tu información personal y configuración de cuenta"
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="px-6 py-8 border-b border-gray-200">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                {profile.profile_picture ? (
                                    <img
                                        src={profile.profile_picture}
                                        alt="Foto de perfil"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center border-4 border-white shadow-lg">
                                        <span className="text-2xl font-bold text-white">
                                            {(profile.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => document.getElementById('pictureInput').click()}
                                    className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                                <input
                                    id="pictureInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePictureChange}
                                    className="hidden"
                                />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {profile.first_name && profile.last_name 
                                        ? `${profile.first_name} ${profile.last_name}`
                                        : user?.username || 'Usuario'
                                    }
                                </h1>
                                <p className="text-gray-600 text-lg">{user?.email}</p>
                                <div className="flex items-center mt-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user?.role === 'admin' 
                                            ? 'bg-red-100 text-red-800'
                                            : user?.role === 'security'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {user?.role === 'admin' ? 'Administrador' : 
                                         user?.role === 'security' ? 'Seguridad' : 'Residente'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Picture Upload Actions */}
                        {pictureFile && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-blue-800">
                                        Archivo seleccionado: {pictureFile.name}
                                    </span>
                                    <div className="space-x-2">
                                        <button
                                            onClick={handlePictureUpload}
                                            disabled={loading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Subiendo...' : 'Subir'}
                                        </button>
                                        <button
                                            onClick={() => setPictureFile(null)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {profile.profile_picture && (
                            <div className="mt-4">
                                <button
                                    onClick={handlePictureDelete}
                                    disabled={loading}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    Eliminar foto de perfil
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'profile'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Información Personal
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'password'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Cambiar Contraseña
                            </button>
                        </nav>
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

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                        {activeTab === 'profile' ? (
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={profile.first_name}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                            placeholder="Tu nombre"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Apellido
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={profile.last_name}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                            placeholder="Tu apellido"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                            placeholder="tu@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profile.phone}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                            placeholder="+591 12345678"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={profile.address}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                        placeholder="Tu dirección completa"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                            loading
                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white'
                                        }`}
                                    >
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contraseña Actual
                                    </label>
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={passwordData.current_password}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                        placeholder="Tu contraseña actual"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nueva Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="new_password"
                                        value={passwordData.new_password}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                        placeholder="Nueva contraseña"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmar Nueva Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={passwordData.confirm_password}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                        placeholder="Confirma tu nueva contraseña"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                            passwordLoading
                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                                        }`}
                                    >
                                        {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default UserProfile;
