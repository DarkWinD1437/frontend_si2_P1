import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import authService from '../services/auth.service';
import AIService from '../services/aiService';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginMode, setLoginMode] = useState('credentials'); // 'credentials' or 'facial'
    
    // Estados para login facial
    const [isStreaming, setIsStreaming] = useState(false);
    const [facialLoading, setFacialLoading] = useState(false);
    const [camarasDisponibles, setCamarasDisponibles] = useState([]);
    const [camaraSeleccionada, setCamaraSeleccionada] = useState('');
    
    const { login, loginFacial } = useAuth();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Limpiar cámara al desmontar
    useEffect(() => {
        return () => {
            detenerCamaraFacial();
        };
    }, []);

    // Setear cámara por defecto cuando se cargan las cámaras
    useEffect(() => {
        if (camarasDisponibles.length > 0 && !camaraSeleccionada) {
            setCamaraSeleccionada(camarasDisponibles[0].deviceId);
            console.log('Cámara seleccionada por defecto:', camarasDisponibles[0].label || camarasDisponibles[0].deviceId);
        }
    }, [camarasDisponibles, camaraSeleccionada]);

    // Función de diagnóstico para la consola
    useEffect(() => {
        window.diagnosticarCamaraLogin = async () => {
            console.log('=== DIAGNÓSTICO DE CÁMARA (LOGIN) ===');

            // Verificar APIs
            console.log('1. Verificación de APIs:');
            console.log('- navigator.mediaDevices:', !!navigator.mediaDevices);
            console.log('- getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
            console.log('- enumerateDevices:', !!navigator.mediaDevices?.enumerateDevices);
            console.log('- permissions:', !!navigator.permissions?.query);

            // Verificar HTTPS/Localhost
            console.log('2. Verificación de protocolo:');
            console.log('- Protocolo:', window.location.protocol);
            console.log('- Hostname:', window.location.hostname);
            console.log('- Es HTTPS/Localhost:', window.location.protocol === 'https:' || window.location.hostname === 'localhost');

            // Verificar permisos
            try {
                console.log('3. Verificación de permisos:');
                const permissionStatus = await navigator.permissions.query({ name: 'camera' });
                console.log('- Estado de permisos:', permissionStatus.state);
            } catch (error) {
                console.log('- Error verificando permisos:', error.message);
            }

            // Listar dispositivos
            try {
                console.log('4. Dispositivos disponibles:');
                const devices = await navigator.mediaDevices.enumerateDevices();
                const cameras = devices.filter(device => device.kind === 'videoinput');
                console.log('- Cámaras encontradas:', cameras.length);
                cameras.forEach((cam, index) => {
                    console.log(`  ${index + 1}. ${cam.label || 'Sin nombre'} (ID: ${cam.deviceId.slice(0, 8)}...)`);
                });
            } catch (error) {
                console.log('- Error listando dispositivos:', error.message);
            }

            // Verificar estado del componente
            console.log('5. Estado del componente:');
            console.log('- isStreaming:', isStreaming);
            console.log('- camarasDisponibles:', camarasDisponibles.length);
            console.log('- camaraSeleccionada:', camaraSeleccionada);
            console.log('- videoRef.current:', !!videoRef.current);
            console.log('- streamRef.current:', !!streamRef.current);

            console.log('=== FIN DIAGNÓSTICO ===');
            console.log('Para más ayuda, ejecuta: diagnosticarCamaraLogin()');
        };

        // Limpiar función al desmontar
        return () => {
            delete window.diagnosticarCamaraLogin;
        };
    }, [isStreaming, camarasDisponibles, camaraSeleccionada]);

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

    // Funciones para login facial
    const cargarCamaras = async () => {
        try {
            console.log('Verificando permisos de cámara...');

            // Verificar si tenemos permisos
            const permissionStatus = await navigator.permissions.query({ name: 'camera' });
            console.log('Estado de permisos de cámara:', permissionStatus.state);

            if (permissionStatus.state === 'denied') {
                setError('Los permisos de cámara están denegados. Por favor, habilita el acceso a la cámara en la configuración del navegador.');
                return;
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log('Dispositivos encontrados:', devices);

            const camaras = devices.filter(device => device.kind === 'videoinput').sort((a, b) => a.deviceId.localeCompare(b.deviceId));
            console.log('Cámaras disponibles:', camaras);

            setCamarasDisponibles(camaras);

            // Si no hay cámara seleccionada y hay cámaras disponibles, seleccionar la primera
            if (camaras.length > 0 && !camaraSeleccionada) {
                setCamaraSeleccionada(camaras[0].deviceId);
                console.log('Cámara seleccionada por defecto:', camaras[0].label || camaras[0].deviceId);
            }
        } catch (error) {
            console.error('Error cargando cámaras:', error);
            setError('Error al acceder a las cámaras. Verifica que tu navegador soporte acceso a cámara.');
        }
    };

    const iniciarCamaraFacial = async () => {
        try {
            setFacialLoading(true);
            setError('');

            // Detener stream anterior si existe
            if (streamRef.current) {
                detenerCamaraFacial();
            }

            console.log('Solicitando acceso a cámara:', camaraSeleccionada);

            const constraints = {
                video: {
                    deviceId: camaraSeleccionada ? { exact: camaraSeleccionada } : undefined,
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                    frameRate: { ideal: 30, min: 15 },
                    facingMode: 'user' // Preferir cámara frontal
                }
            };

            console.log('Constraints:', constraints);

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Stream obtenido:', stream);

            streamRef.current = stream;

            // Primero activar streaming para mostrar el video element
            setIsStreaming(true);

            // Pequeña pausa para asegurar que el DOM se actualice
            await new Promise(resolve => setTimeout(resolve, 100));

            if (videoRef.current) {
                console.log('Asignando stream al video element');
                videoRef.current.srcObject = stream;

                // Esperar a que el video esté listo
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Timeout esperando video metadata'));
                    }, 5000);

                    videoRef.current.onloadedmetadata = () => {
                        clearTimeout(timeout);
                        console.log('Video metadata loaded, playing...');
                        videoRef.current.play().then(() => {
                            console.log('Video playing successfully');
                            resolve();
                        }).catch(reject);
                    };

                    videoRef.current.onerror = (e) => {
                        clearTimeout(timeout);
                        console.error('Video error:', e);
                        reject(new Error('Error loading video'));
                    };
                });
            } else {
                throw new Error('Video element not available');
            }

            // Actualizar labels de cámaras después de conceder permisos
            setTimeout(() => cargarCamaras(), 500);

        } catch (error) {
            console.error('Error iniciando cámara:', error);
            // Si hay error, desactivar streaming
            setIsStreaming(false);
            let errorMessage = 'Error al acceder a la cámara. ';

            if (error.name === 'NotAllowedError') {
                errorMessage += 'Debes permitir el acceso a la cámara.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No se encontró ninguna cámara.';
            } else if (error.name === 'NotReadableError') {
                errorMessage += 'La cámara está siendo usada por otra aplicación.';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage += 'La cámara seleccionada no está disponible.';
            } else {
                errorMessage += error.message || 'Verifica los permisos.';
            }

            setError(errorMessage);
        } finally {
            setFacialLoading(false);
        }
    };

    const detenerCamaraFacial = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsStreaming(false);
    };

    const handleLoginFacial = async () => {
        console.log('=== INICIANDO handleLoginFacial ===');
        console.log('isStreaming:', isStreaming);
        console.log('videoRef.current:', !!videoRef.current);
        console.log('canvasRef.current:', !!canvasRef.current);
        console.log('facialLoading:', facialLoading);

        if (!isStreaming || !videoRef.current || !canvasRef.current) {
            console.log('handleLoginFacial: Condiciones no cumplidas - isStreaming:', isStreaming, 'videoRef:', !!videoRef.current, 'canvasRef:', !!canvasRef.current);
            setError('La cámara no está lista. Por favor, inicia la cámara primero.');
            return;
        }

        console.log('handleLoginFacial: Iniciando proceso de login facial');
        setFacialLoading(true);
        setError('');

        try {
            // Capturar imagen con mejor calidad
            let imagenBase64 = captureImageFromVideo(videoRef.current, canvasRef.current);
            console.log('handleLoginFacial: Imagen capturada, tamaño:', imagenBase64.length);
            
            // Preprocesar imagen para mejorar calidad
            console.log('handleLoginFacial: Preprocesando imagen...');
            imagenBase64 = await AIService.preprocessImage(imagenBase64);
            console.log('handleLoginFacial: Imagen preprocesada, tamaño:', imagenBase64.length);

            // Intentar login facial usando el contexto
            console.log('handleLoginFacial: Llamando a loginFacial del contexto');
            const result = await loginFacial(imagenBase64);
            console.log('handleLoginFacial: Resultado de loginFacial:', result);
            
            if (result.success) {
                console.log('handleLoginFacial: Login exitoso, navegando a dashboard');
                
                // Detener cámara
                detenerCamaraFacial();
                
                // Navegar al dashboard
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 100);
            } else {
                console.log('handleLoginFacial: Login fallido, error:', result.error);
                setError(result.error || 'Error en reconocimiento facial. Intenta nuevamente.');
            }

        } catch (error) {
            console.error('handleLoginFacial: Error en login facial:', error);
            console.error('Error details:', error.response?.data || error.message);
            setError(error.response?.data?.mensaje || error.response?.data?.error || 'Error en reconocimiento facial. Intenta nuevamente.');
        } finally {
            setFacialLoading(false);
            console.log('=== FINALIZANDO handleLoginFacial ===');
        }
    };

    // Función auxiliar para capturar imagen
    const captureImageFromVideo = (videoElement, canvasElement) => {
        const context = canvasElement.getContext('2d');
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0);
        return canvasElement.toDataURL('image/jpeg', 0.8).split(',')[1];
    };

    // Cambiar modo de login
    const cambiarModoLogin = (modo) => {
        setLoginMode(modo);
        setError('');
        if (modo === 'facial') {
            cargarCamaras();
        } else {
            detenerCamaraFacial();
        }
    };

    const cambiarCamara = async (deviceId) => {
        if (deviceId !== camaraSeleccionada) {
            console.log('Cambiando a cámara:', deviceId);
            const wasStreaming = isStreaming;

            // Mostrar indicador de carga
            setFacialLoading(true);

            try {
                // Detener la cámara actual
                detenerCamaraFacial();

                // Cambiar la selección
                setCamaraSeleccionada(deviceId);

                // Si estaba streaming, reiniciar con la nueva cámara
                if (wasStreaming) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    await iniciarCamaraFacial();
                }
            } catch (error) {
                console.error('Error cambiando cámara:', error);
                setError('Error al cambiar de cámara. Intenta nuevamente.');
            } finally {
                setFacialLoading(false);
            }
        }
    };

    // Estilos inline para anular completamente cualquier tema
    const containerStyle = {
        minHeight: '100vh',
        height: '100vh',
        background: 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 50%, #fecaca 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    };

    const cardStyle = {
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #fed7aa',
        width: '100%',
        maxWidth: '28rem',
        height: 'auto',
        maxHeight: 'calc(100vh - 2rem)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    };

    const scrollableContentStyle = {
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        scrollbarWidth: 'thin',
        scrollbarColor: '#fed7aa transparent'
    };

    const headerStyle = {
        background: 'linear-gradient(135deg, #d97706, #ea580c, #dc2626)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        flexShrink: 0
    };

    const inputStyle = {
        width: '100%',
        paddingLeft: '2.75rem',
        paddingRight: '1rem',
        paddingTop: '0.75rem',
        paddingBottom: '0.75rem',
        fontSize: '1rem',
        border: '2px solid #fed7aa',
        borderRadius: '0.5rem',
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
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
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
                {/* Header - Fixed */}
                <div style={headerStyle}>
                    <div style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                        padding: '0.5rem', 
                        borderRadius: '0.5rem',
                        display: 'inline-block',
                        marginBottom: '0.75rem'
                    }}>
                        <svg style={{ width: '1.75rem', height: '1.75rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: '0 0 0.25rem 0' }}>
                        Smart Condominium
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.75rem', margin: 0, fontWeight: '500' }}>
                        Sistema de Gestión Inteligente
                    </p>
                </div>

                {/* Scrollable Content */}
                <div style={scrollableContentStyle}>
                    <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.25rem 0' }}>
                            Bienvenido
                        </h2>
                        <p style={{ color: '#4b5563', fontSize: '0.875rem', margin: 0 }}>
                            Inicia sesión en tu cuenta
                        </p>
                    </div>

                    {/* Selector de modo de login */}
                    <div style={{ 
                        display: 'flex', 
                        backgroundColor: '#fef7ed', 
                        borderRadius: '0.5rem', 
                        padding: '0.25rem', 
                        marginBottom: '1.5rem',
                        border: '2px solid #fed7aa'
                    }}>
                        <button
                            onClick={() => cambiarModoLogin('credentials')}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                backgroundColor: loginMode === 'credentials' ? '#f97316' : 'transparent',
                                color: loginMode === 'credentials' ? 'white' : '#f97316',
                                border: 'none',
                                fontWeight: '500',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <User size={16} />
                            Credenciales
                        </button>
                        <button
                            onClick={() => cambiarModoLogin('facial')}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                backgroundColor: loginMode === 'facial' ? '#f97316' : 'transparent',
                                color: loginMode === 'facial' ? 'white' : '#f97316',
                                border: 'none',
                                fontWeight: '500',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Camera size={16} />
                            Rostro
                        </button>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: '#fef2f2',
                            borderLeft: '4px solid #f87171',
                            color: '#dc2626',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            fontSize: '0.875rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span style={{ fontWeight: '500' }}>{error}</span>
                            </div>
                        </div>
                    )}

                    {loginMode === 'credentials' ? (
                        /* Formulario de credenciales */
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    fontSize: '0.875rem', 
                                    fontWeight: '600', 
                                    color: '#374151', 
                                    marginBottom: '0.5rem' 
                                }}>
                                    Usuario
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ 
                                        position: 'absolute', 
                                        left: '0.75rem',
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
                                    fontSize: '0.875rem', 
                                    fontWeight: '600', 
                                    color: '#374151', 
                                    marginBottom: '0.5rem' 
                                }}>
                                    Contraseña
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ 
                                        position: 'absolute', 
                                        left: '0.75rem',
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
                                            paddingLeft: '2.75rem',
                                            paddingRight: '3rem',
                                            paddingTop: '0.75rem',
                                            paddingBottom: '0.75rem',
                                            fontSize: '1rem',
                                            border: '2px solid #fed7aa',
                                            borderRadius: '0.5rem',
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
                                            right: '0.75rem',
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
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        style={{ height: '1rem', width: '1rem', color: '#f97316', marginRight: '0.5rem' }}
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
                                        e.target.style.transform = 'scale(1.02)';
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
                                            marginRight: '0.5rem', 
                                            height: '1rem', 
                                            width: '1rem', 
                                            color: 'white' 
                                        }} fill="none" viewBox="0 0 24 24">
                                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path style={{ opacity: 0.75 }} fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Iniciando sesión...</span>
                                    </div>
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Interfaz de login facial */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <p style={{ color: '#4b5563', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                                    Colócate frente a la cámara y presiona "Verificar Rostro" para iniciar sesión
                                </p>
                            </div>

                            {/* Selector de cámara */}
                            {camarasDisponibles.length > 0 && (
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        fontSize: '0.875rem', 
                                        fontWeight: '600', 
                                        color: '#374151', 
                                        marginBottom: '0.5rem' 
                                    }}>
                                        Seleccionar Cámara{facialLoading ? ' (Cambiando...)' : ''}
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <select
                                            value={camaraSeleccionada}
                                            onChange={(e) => cambiarCamara(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                fontSize: '1rem',
                                                border: '2px solid #fed7aa',
                                                borderRadius: '0.5rem',
                                                backgroundColor: '#fef7ed',
                                                color: '#1f2937',
                                                fontWeight: '500',
                                                outline: 'none',
                                                opacity: facialLoading ? 0.7 : 1
                                            }}
                                            disabled={facialLoading}
                                        >
                                            {camarasDisponibles.map((camara, index) => {
                                                // Intentar determinar si es frontal o trasera basado en el label
                                                let tipoCamara = '';
                                                const label = camara.label || `Cámara ${index + 1}`;
                                                if (label.toLowerCase().includes('front') || label.toLowerCase().includes('user') || label.toLowerCase().includes('facial')) {
                                                    tipoCamara = ' (Frontal)';
                                                } else if (label.toLowerCase().includes('back') || label.toLowerCase().includes('rear') || label.toLowerCase().includes('environment')) {
                                                    tipoCamara = ' (Trasera)';
                                                } else if (index === 0) {
                                                    tipoCamara = ' (Principal)';
                                                }

                                                return (
                                                    <option key={camara.deviceId} value={camara.deviceId}>
                                                        {label}{tipoCamara}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <button
                                            onClick={cargarCamaras}
                                            disabled={facialLoading}
                                            style={{
                                                padding: '0.75rem',
                                                backgroundColor: '#6b7280',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                cursor: facialLoading ? 'not-allowed' : 'pointer',
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                opacity: facialLoading ? 0.5 : 1
                                            }}
                                            title="Refrescar lista de cámaras"
                                        >
                                            ↻
                                        </button>
                                    </div>
                                    <p style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#6b7280', 
                                        margin: '0' 
                                    }}>
                                        {camarasDisponibles.length} cámara{camarasDisponibles.length !== 1 ? 's' : ''} disponible{camarasDisponibles.length !== 1 ? 's' : ''} • Cambia de cámara en cualquier momento
                                    </p>
                                </div>
                            )}

                            {camarasDisponibles.length === 0 && !facialLoading && (
                                <div style={{
                                    backgroundColor: '#fef3c7',
                                    border: '1px solid #f59e0b',
                                    borderRadius: '0.5rem',
                                    padding: '1rem',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ 
                                        fontSize: '0.875rem', 
                                        color: '#92400e', 
                                        margin: '0 0 0.5rem 0',
                                        fontWeight: '500'
                                    }}>
                                        No se encontraron cámaras disponibles
                                    </p>
                                    <button
                                        onClick={cargarCamaras}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#f59e0b',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.375rem',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Buscar Cámaras
                                    </button>
                                </div>
                            )}

                            {/* Controles de cámara */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {!isStreaming ? (
                                    <button
                                        onClick={iniciarCamaraFacial}
                                        disabled={facialLoading || camarasDisponibles.length === 0}
                                        style={{
                                            flex: 1,
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            fontSize: '0.875rem',
                                            cursor: facialLoading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {facialLoading ? (
                                            <svg style={{ animation: 'spin 1s linear infinite', height: '1rem', width: '1rem' }} fill="none" viewBox="0 0 24 24">
                                                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path style={{ opacity: 0.75 }} fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <Camera size={16} />
                                        )}
                                        {facialLoading ? 'Cargando...' : 'Iniciar Cámara'}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={detenerCamaraFacial}
                                            style={{
                                                flex: 1,
                                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '0.5rem',
                                                border: 'none',
                                                fontSize: '0.875rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <svg style={{ height: '1rem', width: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6m-6 4h6m2-5l-2-2m0 0l-2 2m2-2v12" />
                                            </svg>
                                            Detener
                                        </button>
                                        <button
                                            onClick={handleLoginFacial}
                                            disabled={facialLoading}
                                            style={{
                                                flex: 1,
                                                background: 'linear-gradient(135deg, #d97706, #ea580c, #dc2626)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '0.5rem',
                                                border: 'none',
                                                fontSize: '0.875rem',
                                                cursor: facialLoading ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            {facialLoading ? (
                                                <svg style={{ animation: 'spin 1s linear infinite', height: '1rem', width: '1rem' }} fill="none" viewBox="0 0 24 24">
                                                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path style={{ opacity: 0.75 }} fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <User size={16} />
                                            )}
                                            {facialLoading ? 'Verificando...' : 'Verificar Rostro'}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Vista previa de la cámara */}
                            <div style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '0.5rem',
                                border: '2px solid #fed7aa',
                                padding: '1rem',
                                textAlign: 'center',
                                display: isStreaming ? 'block' : 'none'
                            }}>
                                <h3 style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: 'bold', 
                                    color: '#1f2937', 
                                    margin: '0 0 1rem 0' 
                                }}>
                                    Vista Previa
                                </h3>
                                <div style={{ 
                                    position: 'relative', 
                                    maxWidth: '300px', 
                                    margin: '0 auto',
                                    borderRadius: '0.5rem',
                                    overflow: 'hidden',
                                    backgroundColor: '#f3f4f6',
                                    border: '2px solid #e5e7eb'
                                }}>
                                    <video
                                        ref={videoRef}
                                        style={{
                                            width: '100%',
                                            height: '225px',
                                            objectFit: 'cover',
                                            backgroundColor: '#f3f4f6',
                                            display: isStreaming ? 'block' : 'none'
                                        }}
                                        autoPlay
                                        muted
                                        playsInline
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        left: '0.5rem',
                                        backgroundColor: 'rgba(34, 197, 94, 0.9)',
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}>
                                        ● EN VIVO
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '0.5rem',
                                        left: '0.5rem',
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem'
                                    }}>
                                        Cámara Activa
                                    </div>
                                </div>
                                <p style={{ 
                                    fontSize: '0.75rem', 
                                    color: '#6b7280', 
                                    margin: '0.5rem 0 0 0' 
                                }}>
                                    Asegúrate de que tu rostro sea visible y bien iluminado
                                </p>
                            </div>

                            {/* Botón para volver a credenciales */}
                            <button
                                onClick={() => cambiarModoLogin('credentials')}
                                style={{
                                    fontSize: '0.875rem',
                                    color: '#f97316',
                                    fontWeight: '600',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    margin: '0 auto'
                                }}
                            >
                                <ArrowLeft size={16} />
                                Volver a login con credenciales
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{ 
                        marginTop: '1rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #fed7aa', 
                        textAlign: 'center' 
                    }}>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                            © 2025 Smart Condominium - Sistema de Gestión By DarkWinD
                        </p>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                /* Scrollbar personalizada */
                ::-webkit-scrollbar {
                    width: 6px;
                }
                
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: #fed7aa;
                    border-radius: 3px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: #f97316;
                }
                
                /* Firefox scrollbar */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: #fed7aa transparent;
                }
            `}</style>
        </div>
    );
};

export default Login;