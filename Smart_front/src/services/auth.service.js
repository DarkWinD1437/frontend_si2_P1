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
            
            localStorage.setItem('user', JSON.stringify(userData));
            api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
            
            // OBTENER DATOS DEL USUARIO DEL ENDPOINT /api/me/
            try {
                const profileResponse = await api.get('me/');
                const completeUserData = {
                    ...userData,
                    ...profileResponse.data
                };
                localStorage.setItem('user', JSON.stringify(completeUserData));
                console.log('Usuario completo:', completeUserData);
                return completeUserData;
            } catch (profileError) {
                console.warn('Error obteniendo perfil. Usando datos básicos.', profileError);
                // Si falla, asignar rol basado en username temporalmente
                const userWithRole = {
                    ...userData,
                    role: username === 'admin' ? 'admin' : 'resident'
                };
                localStorage.setItem('user', JSON.stringify(userWithRole));
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
        
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        
        throw error;
    }
};

const logout = () => {
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
};

const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        return null;
    }
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