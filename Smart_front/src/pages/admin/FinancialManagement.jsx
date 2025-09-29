import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import financesService from '../../services/financesService';
import { userService } from '../../services/userService';
import ConceptoModal from '../../components/modals/ConceptoModal';

const FinancialManagement = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Estados para datos reales
    const [estadisticas, setEstadisticas] = useState(null);
    const [conceptos, setConceptos] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    
    // Estados para modales
    const [showConceptoModal, setShowConceptoModal] = useState(false);
    const [showCargoModal, setShowCargoModal] = useState(false);
    const [editingConcepto, setEditingConcepto] = useState(null);
    const [editingCargo, setEditingCargo] = useState(null);
    
    // Estados para formularios
    const [conceptoForm, setConceptoForm] = useState({
        nombre: '',
        descripcion: '',
        tipo: '',
        monto: '',
        estado: 'activo',
        fecha_vigencia_desde: '',
        fecha_vigencia_hasta: '',
        es_recurrente: false,
        aplica_a_todos: false
    });
    
    const [cargoForm, setCargoForm] = useState({
        concepto: '',
        residente: '',
        monto: '',
        fecha_vencimiento: '',
        observaciones: ''
    });
    
    // Cargar datos iniciales
    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'Administrador') {
            loadInitialData();
        }
    }, [user]);
    
    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [estadisticasData, conceptosData, cargosData, usuariosData] = await Promise.all([
                financesService.getEstadisticasFinancieras(),
                financesService.getConceptos(),
                financesService.getCargos(),
                userService.getAllUsers()
            ]);
            
            setEstadisticas(estadisticasData);
            setConceptos(conceptosData.results || conceptosData);
            setCargos(cargosData.results || cargosData);
            setUsuarios(usuariosData.data || []);
        } catch (error) {
            setError('Error cargando datos: ' + error.message);
            console.error('Error loading initial data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // Funciones para conceptos
    const handleCreateConcepto = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const validation = financesService.validateConceptoData(conceptoForm);
            if (!validation.isValid) {
                setError(Object.values(validation.errors).join(', '));
                return;
            }
            
            if (editingConcepto) {
                await financesService.updateConcepto(editingConcepto.id, conceptoForm);
                setSuccess('Concepto actualizado exitosamente');
            } else {
                await financesService.createConcepto(conceptoForm);
                setSuccess('Concepto creado exitosamente');
            }
            
            await loadInitialData();
            resetConceptoForm();
            setShowConceptoModal(false);
        } catch (error) {
            setError('Error guardando concepto: ' + error.message);
        } finally {
            setLoading(false);
        }
    };    const handleDeleteConcepto = async (id) => {
        if (!confirm('¿Está seguro de eliminar este concepto?')) return;
        
        setLoading(true);
        try {
            await financesService.deleteConcepto(id);
            setSuccess('Concepto eliminado exitosamente');
            await loadInitialData();
        } catch (error) {
            setError('Error eliminando concepto: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleToggleConceptoEstado = async (id) => {
        setLoading(true);
        try {
            await financesService.toggleConceptoEstado(id);
            setSuccess('Estado del concepto actualizado');
            await loadInitialData();
        } catch (error) {
            setError('Error actualizando estado: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    // Funciones para cargos
    const handleCreateCargo = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const validation = financesService.validateCargoData(cargoForm);
            if (!validation.isValid) {
                setError(Object.values(validation.errors).join(', '));
                return;
            }
            
            if (editingCargo) {
                await financesService.updateCargo(editingCargo.id, cargoForm);
                setSuccess('Cargo actualizado exitosamente');
            } else {
                await financesService.createCargo(cargoForm);
                setSuccess('Cargo aplicado exitosamente');
            }
            
            await loadInitialData();
            resetCargoForm();
            setShowCargoModal(false);
        } catch (error) {
            setError('Error guardando cargo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handlePagarCargo = async (id) => {
        const referencia = prompt('Ingrese la referencia del pago:');
        if (!referencia) return;
        
        setLoading(true);
        try {
            await financesService.pagarCargo(id, referencia, 'Pago procesado por administrador');
            setSuccess('Pago procesado exitosamente');
            await loadInitialData();
        } catch (error) {
            setError('Error procesando pago: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteCargo = async (id) => {
        if (!confirm('¿Está seguro de eliminar este cargo? Esta acción no se puede deshacer.')) return;
        
        setLoading(true);
        try {
            await financesService.deleteCargo(id);
            setSuccess('Cargo eliminado exitosamente');
            await loadInitialData();
        } catch (error) {
            setError('Error eliminando cargo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    // Funciones para formularios
    const resetConceptoForm = () => {
        setConceptoForm({
            nombre: '',
            descripcion: '',
            tipo: '',
            monto: '',
            estado: 'activo',
            fecha_vigencia_desde: '',
            fecha_vigencia_hasta: '',
            es_recurrente: false,
            aplica_a_todos: false
        });
        setEditingConcepto(null);
    };

    const handleCloseConceptoModal = () => {
        setShowConceptoModal(false);
        resetConceptoForm();
    };

    // Helper function para mostrar nombres de usuario
    const getUserDisplayName = (userInfo, cargo = null) => {
        // Si tenemos un cargo, usar los campos directos
        if (cargo) {
            if (cargo.residente_nombre && cargo.residente_nombre.trim()) {
                return cargo.residente_nombre;
            }
            if (cargo.residente_username) {
                return cargo.residente_username;
            }
        }
        
        // Lógica original para objetos userInfo
        if (!userInfo) return 'Usuario no encontrado';
        
        // Intentar diferentes formas de obtener el nombre
        if (userInfo.nombre_completo && userInfo.nombre_completo.trim()) {
            return userInfo.nombre_completo;
        }
        
        const firstName = userInfo.first_name || userInfo.firstName || '';
        const lastName = userInfo.last_name || userInfo.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        if (fullName) {
            return fullName;
        }
        
        return userInfo.username || userInfo.email || 'Usuario sin nombre';
    };
    
    const resetCargoForm = () => {
        setCargoForm({
            concepto: '',
            residente: '',
            monto: '',
            fecha_vencimiento: '',
            observaciones: ''
        });
        setEditingCargo(null);
    };
    
    const editConcepto = (concepto) => {
        setConceptoForm({
            nombre: concepto.nombre || '',
            descripcion: concepto.descripcion || '', // Asegurar que sea cadena vacía si es null/undefined
            tipo: concepto.tipo || '',
            monto: concepto.monto || '',
            estado: concepto.estado || 'activo',
            fecha_vigencia_desde: concepto.fecha_vigencia_desde || '',
            fecha_vigencia_hasta: concepto.fecha_vigencia_hasta || '',
            es_recurrente: concepto.es_recurrente || false,
            aplica_a_todos: concepto.aplica_a_todos || false
        });
        setEditingConcepto(concepto);
        setShowConceptoModal(true);
    };
    
    const editCargo = async (cargo) => {
        try {
            // Obtener los datos completos del cargo desde el backend
            const cargoCompleto = await financesService.getCargo(cargo.id);
            
            console.log('Cargo completo del backend:', cargoCompleto);
            
            // Mapear los datos correctamente para el formulario
            setCargoForm({
                concepto: cargoCompleto.concepto || '',
                residente: cargoCompleto.residente || '', 
                monto: cargoCompleto.monto || '',
                fecha_vencimiento: cargoCompleto.fecha_vencimiento || '',
                observaciones: cargoCompleto.observaciones || ''
            });
            setEditingCargo(cargoCompleto);
            setShowCargoModal(true);
        } catch (error) {
            console.error('Error obteniendo datos del cargo:', error);
            // Fallback usando los datos disponibles (aunque limitados)
            setCargoForm({
                concepto: '', // No tenemos el ID del concepto
                residente: '', // No tenemos el ID del residente
                monto: cargo.monto || '',
                fecha_vencimiento: cargo.fecha_vencimiento || '',
                observaciones: cargo.observaciones || ''
            });
            setEditingCargo(cargo);
            setShowCargoModal(true);
            setError('No se pudo cargar toda la información del cargo. Algunos campos pueden estar vacíos.');
        }
    };
    
    // Limpiar mensajes después de 5 segundos
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);
    
    const tabs = [
        { id: 'overview', name: 'Resumen', icon: '📊' },
        { id: 'conceptos', name: 'Configurar Cuotas/Multas', icon: '⚙️' },
        { id: 'cargos', name: 'Gestionar Cargos', icon: '�' },
        { id: 'payments', name: 'Pagos Pendientes', icon: '�' }
    ];

    const StatCard = ({ title, value, subtitle, color, icon }) => (
        <div className={`${
            isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
        } rounded-xl border shadow-sm hover:shadow-md transition-shadow p-6`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{title}</p>
                    <p className={`text-2xl font-bold ${color} mt-2`}>{value}</p>
                    <p className={`text-xs ${
                        isDark ? 'text-gray-500' : 'text-gray-500'
                    } mt-1`}>{subtitle}</p>
                </div>
                <div className={`text-3xl ${color} opacity-20`}>{icon}</div>
            </div>
        </div>
    );

    if (loading && !estadisticas && !conceptos.length) {
        return (
            <Layout title="Gestión Financiera" description="Cargando datos financieros...">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </Layout>
        );
    }

    return (
        <Layout 
            title="Gestión Financiera" 
            description="Control y administración financiera del condominio"
        >
            <div className="space-y-6">
                {/* Mensajes de error y éxito */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className={`${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } rounded-lg border shadow-sm`}>
                    <nav className="flex space-x-8 px-6 py-4 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                                    activeTab === tab.id
                                        ? isDark 
                                            ? 'bg-indigo-900 text-indigo-300 border-2 border-indigo-700'
                                            : 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                                        : isDark
                                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && estadisticas && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Conceptos Activos"
                                value={estadisticas.total_conceptos_activos}
                                subtitle="Configurados"
                                color="text-blue-600"
                                icon="⚙️"
                            />
                            <StatCard
                                title="Cargos Pendientes"
                                value={estadisticas.total_cargos_pendientes}
                                subtitle={`Monto: ${financesService.formatMoney(estadisticas.monto_total_pendiente)}`}
                                color="text-yellow-600"
                                icon="⏰"
                            />
                            <StatCard
                                title="Cargos Vencidos"
                                value={estadisticas.total_cargos_vencidos}
                                subtitle={`Monto: ${financesService.formatMoney(estadisticas.monto_total_vencido)}`}
                                color="text-red-600"
                                icon="⚠️"
                            />
                            <StatCard
                                title="Pagos del Mes"
                                value={financesService.formatMoney(estadisticas.total_pagos_mes_actual)}
                                subtitle="Septiembre 2025"
                                color="text-green-600"
                                icon="💰"
                            />
                        </div>

                        {/* Conceptos más aplicados */}
                        <div className={`${
                            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } rounded-lg border shadow-sm`}>
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className={`text-lg font-semibold ${
                                    isDark ? 'text-white' : 'text-gray-900'
                                }`}>Conceptos Más Aplicados</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {estadisticas.conceptos_mas_aplicados?.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <div>
                                                <p className={`font-medium ${
                                                    isDark ? 'text-white' : 'text-gray-900'
                                                }`}>{item.concepto__nombre}</p>
                                                <p className={`text-sm ${
                                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                                }`}>{financesService.getTipoConceptoDisplay(item.concepto__tipo)}</p>
                                            </div>
                                            <span className="font-semibold text-indigo-600">
                                                {item.cantidad} aplicaciones
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Configurar Cuotas/Multas */}
                {activeTab === 'conceptos' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className={`text-xl font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>Configuración de Cuotas y Multas</h2>
                            <button
                                onClick={() => {
                                    resetConceptoForm();
                                    setShowConceptoModal(true);
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                + Nuevo Concepto
                            </button>
                        </div>

                        <div className={`${
                            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } rounded-lg border shadow-sm overflow-hidden`}>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <tr>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Nombre</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Tipo</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Monto</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Estado</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Vigencia</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${
                                        isDark ? 'divide-gray-700' : 'divide-gray-200'
                                    }`}>
                                        {Array.isArray(conceptos) && conceptos.map((concepto) => (
                                            <tr key={concepto.id}>
                                                <td className={`px-6 py-4 whitespace-nowrap ${
                                                    isDark ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    <div>
                                                        <div className="text-sm font-medium">{concepto.nombre}</div>
                                                        {concepto.descripcion && (
                                                            <div className={`text-xs ${
                                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                                            }`}>
                                                                {concepto.descripcion.substring(0, 50)}
                                                                {concepto.descripcion.length > 50 ? '...' : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                    isDark ? 'text-gray-300' : 'text-gray-500'
                                                }`}>
                                                    {financesService.getTipoConceptoDisplay(concepto.tipo)}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                                    isDark ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {financesService.formatMoney(concepto.monto)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        financesService.getEstadoBadgeColor(concepto.estado, 'concepto')
                                                    }`}>
                                                        {concepto.estado_display || concepto.estado}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                    isDark ? 'text-gray-300' : 'text-gray-500'
                                                }`}>
                                                    <div>
                                                        <div>Desde: {concepto.fecha_vigencia_desde}</div>
                                                        {concepto.fecha_vigencia_hasta && (
                                                            <div>Hasta: {concepto.fecha_vigencia_hasta}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => editConcepto(concepto)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleConceptoEstado(concepto.id)}
                                                        className={`${
                                                            concepto.estado === 'activo' 
                                                                ? 'text-yellow-600 hover:text-yellow-900' 
                                                                : 'text-green-600 hover:text-green-900'
                                                        }`}
                                                    >
                                                        {concepto.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteConcepto(concepto.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gestionar Cargos */}
                {activeTab === 'cargos' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className={`text-xl font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>Aplicar Cargos a Residentes</h2>
                            <button
                                onClick={() => {
                                    resetCargoForm();
                                    setShowCargoModal(true);
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                + Aplicar Cargo
                            </button>
                        </div>

                        <div className={`${
                            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } rounded-lg border shadow-sm overflow-hidden`}>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <tr>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Residente</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Concepto</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Monto</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Estado</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Vencimiento</th>
                                            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${
                                        isDark ? 'divide-gray-700' : 'divide-gray-200'
                                    }`}>
                                        {Array.isArray(cargos) && cargos.map((cargo) => (
                                            <tr key={cargo.id}>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                    isDark ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {getUserDisplayName(cargo.residente_info, cargo)}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                    isDark ? 'text-gray-300' : 'text-gray-500'
                                                }`}>
                                                    {cargo.concepto_info?.nombre}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                                    isDark ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {financesService.formatMoney(cargo.monto)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        financesService.getEstadoBadgeColor(cargo.estado, 'cargo')
                                                    }`}>
                                                        {cargo.estado_display || cargo.estado}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                    isDark ? 'text-gray-300' : 'text-gray-500'
                                                }`}>
                                                    {cargo.fecha_vencimiento}
                                                    {cargo.esta_vencido && (
                                                        <div className="text-red-600 text-xs font-medium">
                                                            ¡VENCIDO!
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    {cargo.estado === 'pendiente' && (
                                                        <button
                                                            onClick={() => handlePagarCargo(cargo.id)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Marcar Pagado
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => editCargo(cargo)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCargo(cargo.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pagos Pendientes */}
                {activeTab === 'payments' && (
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } rounded-lg border shadow-sm`}>
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className={`text-lg font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>Pagos Pendientes y Vencidos</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <tr>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Residente</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Concepto</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Monto</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Vencimiento</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Estado</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className={`${isDark ? 'bg-gray-800' : 'bg-white'} divide-y ${
                                    isDark ? 'divide-gray-700' : 'divide-gray-200'
                                }`}>
                                    {Array.isArray(cargos) && cargos.filter(cargo => ['pendiente', 'vencido'].includes(cargo.estado))
                                           .map((cargo) => (
                                        <tr key={cargo.id}>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                isDark ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {getUserDisplayName(cargo.residente_info, cargo)}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                isDark ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                                {cargo.concepto_info?.nombre}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                                cargo.estado === 'vencido' ? 'text-red-600' : 
                                                isDark ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {financesService.formatMoney(cargo.monto)}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                cargo.esta_vencido ? 'text-red-600 font-medium' :
                                                isDark ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                                {cargo.fecha_vencimiento}
                                                {cargo.esta_vencido && (
                                                    <div className="text-xs">¡VENCIDO!</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    financesService.getEstadoBadgeColor(cargo.estado, 'cargo')
                                                }`}>
                                                    {cargo.estado_display || cargo.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handlePagarCargo(cargo.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Marcar Pagado
                                                </button>
                                                <button className="text-indigo-600 hover:text-indigo-900">
                                                    Recordar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            {/* Modales */}
            <ConceptoModal 
                isOpen={showConceptoModal}
                onClose={handleCloseConceptoModal}
                conceptoForm={conceptoForm}
                setConceptoForm={setConceptoForm}
                handleSubmit={handleCreateConcepto}
                loading={loading}
                editingConcepto={editingConcepto}
            />
            
            {/* Modal para aplicar cargos */}
            {showCargoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } rounded-lg border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className={`text-lg font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                                {editingCargo ? 'Editar Cargo' : 'Aplicar Nuevo Cargo'}
                            </h3>
                        </div>
                        
                        <form onSubmit={handleCreateCargo} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Concepto Financiero *
                                    </label>
                                    <select
                                        value={cargoForm.concepto}
                                        onChange={(e) => {
                                            const concepto = conceptos.find(c => c.id == e.target.value);
                                            setCargoForm({
                                                ...cargoForm, 
                                                concepto: e.target.value,
                                                monto: concepto?.monto || ''
                                            });
                                        }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-gray-300' 
                                                : 'bg-white border-gray-300 text-gray-500'
                                        }`}
                                        required
                                    >
                                        <option value="" className={isDark ? 'text-gray-300' : 'text-gray-500'}>Seleccionar concepto</option>
                                        {Array.isArray(conceptos) && conceptos.filter(c => c.estado === 'activo').map((concepto) => (
                                            <option key={concepto.id} value={concepto.id} className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                                                {concepto.nombre} - {financesService.formatMoney(concepto.monto)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Residente *
                                    </label>
                                    <select
                                        value={cargoForm.residente}
                                        onChange={(e) => setCargoForm({...cargoForm, residente: e.target.value})}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-gray-300' 
                                                : 'bg-white border-gray-300 text-gray-500'
                                        }`}
                                        required
                                    >
                                        <option value="" className={isDark ? 'text-gray-300' : 'text-gray-500'}>Seleccionar residente</option>
                                        {Array.isArray(usuarios) && usuarios.filter(u => u.role === 'resident' || u.role === 'Residente').map((usuario) => (
                                            <option key={usuario.id} value={usuario.id} className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                                                {usuario.first_name && usuario.last_name 
                                                    ? `${usuario.first_name} ${usuario.last_name}` 
                                                    : usuario.username
                                                } ({usuario.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Monto (Bs.) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={cargoForm.monto}
                                        onChange={(e) => setCargoForm({...cargoForm, monto: e.target.value})}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Fecha de Vencimiento *
                                    </label>
                                    <input
                                        type="date"
                                        value={cargoForm.fecha_vencimiento}
                                        onChange={(e) => setCargoForm({...cargoForm, fecha_vencimiento: e.target.value})}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            isDark 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Observaciones
                                </label>
                                <textarea
                                    value={cargoForm.observaciones}
                                    onChange={(e) => setCargoForm({...cargoForm, observaciones: e.target.value})}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                        isDark 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    placeholder="Detalles adicionales sobre el cargo..."
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCargoModal(false);
                                        resetCargoForm();
                                    }}
                                    className={`px-4 py-2 border rounded-lg font-medium ${
                                        isDark
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    } transition-colors`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Guardando...' : (editingCargo ? 'Actualizar' : 'Aplicar Cargo')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            </div>
        </Layout>
    );
};

export default FinancialManagement;