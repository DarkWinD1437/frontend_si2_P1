import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(usuario, password);
            // La redirección ahora se maneja automáticamente en App.jsx
        } catch (error) {
            setError('Usuario o contraseña inválidos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-2xl overflow-hidden lg:max-w-xl">
                <div className="p-8">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                            Smart Cond
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Ingresa a tu cuenta
                        </p>
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="usuario" className="sr-only">Usuario</label>
                                <input
                                    id="usuario"
                                    name="usuario"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Usuario"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Contraseña</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                    loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;