import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import Layout from '../components/Layout';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        role: 'Residente',
        document_type: 'CI',
        document_number: '',
        unit_number: '',
        is_active: true
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Función para actualizar estilos de selects en modo oscuro
    const updateSelectStyles = () => {
        const isDark = document.documentElement.classList.contains('dark');
        const selects = document.querySelectorAll('#document_type, #role, #is_active');
        
        selects.forEach(select => {
            if (isDark) {
                select.style.color = '#f3f4f6'; // gray-100
                select.style.backgroundColor = '#374151'; // gray-700
            } else {
                select.style.color = '#111827'; // gray-900
                select.style.backgroundColor = 'white';
            }
        });
    };

    // Actualizar estilos cuando cambia el modo
    useEffect(() => {
        updateSelectStyles();
        
        // Observar cambios en la clase 'dark' del html
        const observer = new MutationObserver(updateSelectStyles);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        return () => observer.disconnect();
    }, []);

    // Verificar que solo los administradores puedan acceder (acepta ambos formatos)
    if (user?.role !== 'Administrador' && user?.role !== 'admin') {
        return (
            <Layout title="Acceso Denegado">
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4">
                            <svg className="mx-auto h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5a4 4 0 100-8 4 4 0 000 8zm-7 4a8 8 0 1114 0" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
                        <p className="text-gray-600">Solo los administradores pueden registrar nuevos usuarios.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido';
        } else if (formData.username.length < 3) {
            newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Formato de email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep1()) return;

        setLoading(true);
        setErrors({});

        try {
            // Mapear el rol del formulario al formato que espera el backend
            const roleMapping = {
                'Residente': 'resident',
                'Seguridad': 'security', 
                'Administrador': 'admin'
            };

            const registrationData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                password_confirm: formData.confirmPassword, // ¡Corrected field name!
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                address: formData.address,
                role: roleMapping[formData.role] || formData.role.toLowerCase(),
                document_type: formData.document_type,
                document_number: formData.document_number,
                unit_number: formData.unit_number || null, // Solo para residentes
                is_active: formData.is_active
            };
            
            console.log('=== REGISTER DEBUG ===');
            console.log('Form data being sent:', registrationData);
            console.log('Original role:', formData.role, '-> Mapped role:', registrationData.role);
            
            await userService.register(registrationData);
            
            console.log('Registration successful!');
            navigate('/manage-profiles', { 
                state: { message: 'Usuario registrado exitosamente.' }
            });
        } catch (error) {
            console.error('Registration failed:', error);
            const errorData = error.response?.data || {};
            const backendErrors = errorData.errors || errorData;
            const newErrors = {};

            // Procesar errores del backend
            if (backendErrors.username) {
                newErrors.username = Array.isArray(backendErrors.username) ? backendErrors.username[0] : backendErrors.username;
            }
            if (backendErrors.email) {
                newErrors.email = Array.isArray(backendErrors.email) ? backendErrors.email[0] : backendErrors.email;
            }
            if (backendErrors.password) {
                newErrors.password = Array.isArray(backendErrors.password) ? backendErrors.password[0] : backendErrors.password;
            }
            if (backendErrors.password_confirm) {
                newErrors.confirmPassword = Array.isArray(backendErrors.password_confirm) ? backendErrors.password_confirm[0] : backendErrors.password_confirm;
            }
            if (backendErrors.document_number) {
                newErrors.document_number = Array.isArray(backendErrors.document_number) ? backendErrors.document_number[0] : backendErrors.document_number;
            }
            if (backendErrors.phone) {
                newErrors.phone = Array.isArray(backendErrors.phone) ? backendErrors.phone[0] : backendErrors.phone;
            }
            if (backendErrors.role) {
                newErrors.role = Array.isArray(backendErrors.role) ? backendErrors.role[0] : backendErrors.role;
            }
            
            // Mensajes generales
            if (errorData.detail) {
                newErrors.general = errorData.detail;
            }
            if (errorData.message) {
                newErrors.general = errorData.message;
            }
            if (backendErrors.non_field_errors) {
                newErrors.general = Array.isArray(backendErrors.non_field_errors) ? backendErrors.non_field_errors[0] : backendErrors.non_field_errors;
            }

            console.log('Registration errors:', newErrors);
            setErrors(newErrors);
            if (Object.keys(newErrors).some(key => ['username', 'email', 'password'].includes(key))) {
                setStep(1);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout 
            title="Registrar Usuario"
            description="Crear una nueva cuenta de usuario en el sistema"
        >
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-8 text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-white bg-opacity-20 p-3 rounded-full">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Registrar Nuevo Usuario</h1>
                        <p className="text-indigo-100">Panel Administrativo - Crear cuenta de usuario</p>
                    </div>

                    <div className="px-8 py-8">
                        {/* Progress Steps */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="flex items-center space-x-4">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                                    <span className="text-sm font-medium">1</span>
                                </div>
                                <div className={`h-1 w-16 ${step === 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    <span className="text-sm font-medium">2</span>
                                </div>
                            </div>
                        </div>

                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {errors.general}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {step === 1 ? (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Información de Acceso</h3>
                                        <p className="text-gray-600 dark:text-gray-400">Paso 1 de 2</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nombre de Usuario *
                                            </label>
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                required
                                                value={formData.username}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${
                                                    errors.username ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
                                                placeholder="usuario123"
                                            />
                                            {errors.username && (
                                                <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${
                                                    errors.email ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
                                                placeholder="usuario@ejemplo.com"
                                            />
                                            {errors.email && (
                                                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Contraseña *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 pr-12 ${
                                                        errors.password ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
                                                    placeholder="Mínimo 8 caracteres"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Confirmar Contraseña *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    required
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 pr-12 ${
                                                        errors.confirmPassword ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
                                                    placeholder="Repite tu contraseña"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-600 dark:hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Información Personal y del Condominio</h3>
                                        <p className="text-gray-600 dark:text-gray-400">Paso 2 de 2 (Requerido para uso completo del sistema)</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nombre *
                                            </label>
                                            <input
                                                id="firstName"
                                                name="firstName"
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                placeholder="Nombre del usuario"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Apellido *
                                            </label>
                                            <input
                                                id="lastName"
                                                name="lastName"
                                                type="text"
                                                required
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                placeholder="Apellido del usuario"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="document_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tipo de Documento *
                                            </label>
                                            <select
                                                id="document_type"
                                                name="document_type"
                                                required
                                                value={formData.document_type}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                            >
                                                <option value="CI">Cédula de Identidad</option>
                                                <option value="PASSPORT">Pasaporte</option>
                                                <option value="RUC">RUC</option>
                                                <option value="NIT">NIT</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="document_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Número de Documento *
                                            </label>
                                            <input
                                                id="document_number"
                                                name="document_number"
                                                type="text"
                                                required
                                                value={formData.document_number}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                placeholder="Número del documento"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Teléfono *
                                            </label>
                                            <input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                placeholder="+591 12345678"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Rol del Usuario *
                                            </label>
                                            <select
                                                id="role"
                                                name="role"
                                                required
                                                value={formData.role}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                            >
                                                <option value="Residente">Residente</option>
                                                <option value="Seguridad">Personal de Seguridad</option>
                                                <option value="Administrador">Administrador</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="unit_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Número de Unidad
                                                <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">(Solo para residentes)</span>
                                            </label>
                                            <input
                                                id="unit_number"
                                                name="unit_number"
                                                type="text"
                                                value={formData.unit_number}
                                                onChange={handleChange}
                                                disabled={formData.role !== 'Residente'}
                                                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                                                    formData.role !== 'Residente' ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400' : ''
                                                }`}
                                                placeholder="Ej: A-101, B-205, etc."
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Estado de la Cuenta
                                            </label>
                                            <select
                                                id="is_active"
                                                name="is_active"
                                                value={formData.is_active}
                                                onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.value === 'true'}))}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                            >
                                                <option value={true}>Activa</option>
                                                <option value={false}>Inactiva</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Dirección Completa *
                                        </label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            rows={3}
                                            required
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                            placeholder="Dirección completa del usuario"
                                        />
                                    </div>

                                    <div className="flex space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition duration-200"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`flex-1 flex justify-center items-center font-medium py-3 px-4 rounded-lg transition duration-200 ${
                                                loading 
                                                    ? 'bg-gray-400 dark:bg-gray-500 text-white cursor-not-allowed' 
                                                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white'
                                            }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Creando cuenta...
                                                </>
                                            ) : (
                                                'Crear Cuenta'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="mt-8 text-center">
                            <Link 
                                to="/manage-profiles" 
                                className="inline-flex items-center text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Volver al listado de usuarios
                            </Link>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </Layout>
    );
};

export default Register;
