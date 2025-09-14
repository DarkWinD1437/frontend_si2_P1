import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Evitar scroll en la página de login
    useEffect(() => {
        // Evitar scroll cuando el componente se monta
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // Restaurar scroll cuando el componente se desmonta
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userData = await login(formData.username, formData.password);
            console.log('Login exitoso, usuario:', userData);
            
            // Navegar al dashboard después del login exitoso
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 100);
            
        } catch (error) {
            console.error('Error en login:', error);
            setError(error.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    // Estilos inline para anular completamente cualquier tema
    const containerStyle = {
        height: '100vh', // Usar altura exacta de la ventana, no minHeight
        background: 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 50%, #fecaca 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem', // Reducir padding
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden' // Evitar scroll
    };

    const cardStyle = {
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #fed7aa',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '28rem',
        maxHeight: '98vh', // Usar casi toda la altura disponible
        overflowY: 'auto' // Solo scroll interno si es necesario
    };

    const headerStyle = {
        background: 'linear-gradient(135deg, #d97706, #ea580c, #dc2626)',
        padding: '1.5rem 1.5rem', // Reducir padding vertical
        textAlign: 'center',
        position: 'relative'
    };

    const inputStyle = {
        width: '100%',
        paddingLeft: '3rem',
        paddingRight: '3rem',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        fontSize: '1rem',
        border: '2px solid #fed7aa',
        borderRadius: '0.75rem',
        backgroundColor: '#fef7ed',
        color: '#1f2937',
        fontWeight: '500',
        transition: 'all 0.2s',
        outline: 'none'
    };

    const buttonStyle = {
        width: '100%',
        background: 'linear-gradient(135deg, #d97706, #ea580c, #dc2626)',
        color: 'white',
        fontWeight: 'bold',
        padding: '0.875rem 1.5rem', // Reducir padding vertical
        borderRadius: '0.75rem',
        border: 'none',
        fontSize: '1rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s',
        transform: loading ? 'scale(1)' : 'scale(1)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                        padding: '0.75rem', 
                        borderRadius: '0.75rem',
                        display: 'inline-block',
                        marginBottom: '1rem'
                    }}>
                        <svg style={{ width: '2rem', height: '2rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.5rem 0' }}>
                        Smart Condominium
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.875rem', margin: 0, fontWeight: '500' }}>
                        Sistema de Gestión Inteligente
                    </p>
                </div>

                <div style={{ padding: '1.5rem' }}> {/* Reducir padding */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}> {/* Reducir margin */}
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem 0' }}> {/* Reducir font-size */}
                            Bienvenido
                        </h2>
                        <p style={{ color: '#4b5563', fontSize: '0.875rem', margin: 0 }}> {/* Reducir font-size */}
                            Inicia sesión en tu cuenta
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: '#fef2f2',
                            borderLeft: '4px solid #f87171',
                            color: '#dc2626',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem', // Reducir margin
                            fontSize: '0.875rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.75rem', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span style={{ fontWeight: '500' }}>{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}> {/* Reducir gap */}
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '1rem', 
                                fontWeight: '600', 
                                color: '#374151', 
                                marginBottom: '0.75rem' 
                            }}>
                                Usuario
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ 
                                    position: 'absolute', 
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    pointerEvents: 'none',
                                    zIndex: 1
                                }}>
                                    <svg style={{ height: '1.25rem', width: '1.25rem', color: '#f97316' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    placeholder="Nombre de usuario"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '1rem', 
                                fontWeight: '600', 
                                color: '#374151', 
                                marginBottom: '0.75rem' 
                            }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ 
                                    position: 'absolute', 
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    pointerEvents: 'none',
                                    zIndex: 1
                                }}>
                                    <svg style={{ height: '1.25rem', width: '1.25rem', color: '#f97316' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        paddingLeft: '3rem',
                                        paddingRight: '3.5rem', // Más espacio para el botón
                                        paddingTop: '1rem',
                                        paddingBottom: '1rem',
                                        fontSize: '1rem',
                                        border: '2px solid #fed7aa',
                                        borderRadius: '0.75rem',
                                        backgroundColor: '#fef7ed',
                                        color: '#1f2937',
                                        fontWeight: '500',
                                        transition: 'all 0.2s',
                                        outline: 'none'
                                    }}
                                    placeholder="Tu contraseña"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ 
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        display: 'flex', 
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#f97316', 
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                        borderRadius: '0.25rem',
                                        transition: 'background-color 0.2s',
                                        zIndex: 2
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {showPassword ? (
                                        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    style={{ height: '1rem', width: '1rem', color: '#f97316', marginRight: '0.75rem' }}
                                />
                                <label htmlFor="remember" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                                    Recordarme
                                </label>
                            </div>
                            <button type="button" style={{ 
                                fontSize: '0.875rem', 
                                color: '#f97316', 
                                fontWeight: '600', 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer',
                                textAlign: 'right'
                            }}>
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={buttonStyle}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'scale(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg style={{ 
                                        animation: 'spin 1s linear infinite', 
                                        marginLeft: '-0.25rem', 
                                        marginRight: '0.75rem', 
                                        height: '1.25rem', 
                                        width: '1.25rem', 
                                        color: 'white' 
                                    }} fill="none" viewBox="0 0 24 24">
                                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path style={{ opacity: 0.75 }} fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>Iniciando sesión...</span>
                                </div>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div style={{ 
                        marginTop: '1rem', // Reducir margin
                        paddingTop: '1rem', // Reducir padding
                        borderTop: '1px solid #fed7aa', 
                        textAlign: 'center' 
                    }}>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                            © 2024 Smart Condominium - Sistema de Gestión
                        </p>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Login;