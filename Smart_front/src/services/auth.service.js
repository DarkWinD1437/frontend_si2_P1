import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const login = async (username, password) => {
    try {
        console.log('Intentando login...');
        
        // USAR TokenAuthentication (auth-token/) - ES LO QUE FUNCIONA
        const response = await api.post('auth-token/', {
            username: username,
            password: password
        });
        
        console.log('Token obtenido:', response.data);
        
        if (response.data.token) {
            const userData = {
                token: response.data.token,
                username: username,
            };
            
            // Configurar el token en los headers ANTES de hacer la petición al perfil
            api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
            sessionStorage.setItem('token', response.data.token);
            
            // OBTENER DATOS DEL USUARIO DEL ENDPOINT /api/me/
            try {
                const profileResponse = await api.get('me/');
                const completeUserData = {
                    ...userData,
                    ...profileResponse.data
                };
                sessionStorage.setItem('user', JSON.stringify(completeUserData));
                console.log('Usuario completo:', completeUserData);
                return completeUserData;
            } catch (profileError) {
                console.warn('Error obteniendo perfil. Usando datos básicos.', profileError);
                // Si falla, asignar rol basado en username temporalmente
                const userWithRole = {
                    ...userData,
                    role: username === 'admin' ? 'admin' : 'resident'
                };
                sessionStorage.setItem('user', JSON.stringify(userWithRole));
                return userWithRole;
            }
        }
        
        throw new Error('No se recibió token en la respuesta');

    } catch (error) {
        console.error('Error en login:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        
        throw error;
    }
};

const loginFacial = async (imagenBase64, ubicacion = 'Login facial') => {
    try {
        console.log('Intentando login facial...');

        const response = await api.post('security/login-facial/', {
            imagen_base64: imagenBase64,
            ubicacion: ubicacion
        });

        console.log('Respuesta login facial:', response.data);

        if (response.data.login_exitoso && response.data.token) {
            const userData = {
                token: response.data.token,
                ...response.data.usuario
            };

            // Configurar el token en los headers
            api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(userData));

            console.log('Login facial exitoso:', userData);
            return userData;
        }

        throw new Error(response.data.mensaje || 'Login facial fallido');

    } catch (error) {
        console.error('Error en login facial:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];

        throw error;
    }
};

const logout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
};

const getCurrentUser = () => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }
    return null;
};

// Configurar interceptor para requests
api.interceptors.request.use(
    (config) => {
        const user = getCurrentUser();
        if (user?.token) {
            config.headers.Authorization = `Token ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const authService = {
    login,
    loginFacial,
    logout,
    getCurrentUser,
    isAdmin: () => {
        const user = getCurrentUser();
        return user?.role === 'admin';
    },
    isResident: () => {
        const user = getCurrentUser();
        return user?.role === 'resident';
    }
};

export default authService;