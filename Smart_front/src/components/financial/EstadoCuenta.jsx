import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import Layout from '../Layout';
import financesService from '../../services/financesService';
import userService from '../../services/userService';

// Componentes SVG para los iconos
const CurrencyDollarIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
);

const ExclamationTriangleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
);

const ClockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ChartBarIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const DocumentTextIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const UserGroupIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const EstadoCuenta = () => {
    const { user } = useContext(AuthContext);
    const { startPageLoading, stopPageLoading } = useLoading();
    
    // Ref para trackear si ya inicializamos
    const inicializadoRef = useRef(false);
    // Ref para acceder al estado actual sin dependencias
    const estadoCuentaRef = useRef(null);
    // Ref para trackear qué residente estamos cargando para evitar duplicados
    const cargandoResidenteRef = useRef(null);
    
    const [estadoCuenta, setEstadoCuenta] = useState(null);
    const [tieneEstadoCuenta, setTieneEstadoCuenta] = useState(false); // ¡ESTE ESTADO FALTABA!
    const [residentes, setResidentes] = useState([]);
    const [residentesFiltrados, setResidentesFiltrados] = useState([]);
    const [residenteSeleccionado, setResidenteSeleccionado] = useState(() => {
        // Recuperar desde sessionStorage si existe
        return sessionStorage.getItem('estadoCuenta_residenteSeleccionado') || '';
    });
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState('resumen');
    const [isLoading, setIsLoading] = useState(false);
    const [showResidentList, setShowResidentList] = useState(() => {
        // Recuperar desde sessionStorage si existe
        const saved = sessionStorage.getItem('estadoCuenta_showResidentList');
        return saved ? JSON.parse(saved) : true;
    });

    // Estados para modal de pago
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedCargo, setSelectedCargo] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('tarjeta');
    const [processingPayment, setProcessingPayment] = useState(false);

    // Estados para comprobante de pago (simplificado para backend)
    const [generatingComprobante, setGeneratingComprobante] = useState(false);

    // Solo administradores pueden acceder
    const isAdmin = user?.role === 'admin' || user?.role === 'Administrador';

    // Debug: Log de estados importantes
    console.log('🎯 EstadoCuenta render:', {
        showResidentList,
        tieneEstadoCuenta,
        residenteSeleccionado,
        isAdmin,
        totalResidentes: residentes.length,
        renderizando: showResidentList || !tieneEstadoCuenta ? 'LISTA' : 'ESTADO_CUENTA'
    });

    const loadResidentes = useCallback(async () => {
        try {
            console.log('Cargando residentes...');
            const response = await userService.getUsers();
            console.log('Respuesta de getUsers:', response);
            
            if (response.success) {
                console.log('Datos recibidos:', response.data);
                const residentes = response.data.filter(u => {
                    console.log('Usuario:', u, 'Role:', u.role, 'Is active:', u.is_active);
                    // Verificar tanto el valor real como el display del role
                    const isResident = u.role === 'resident' || u.role === 'Residente';
                    return isResident && u.is_active;
                });
                console.log('Residentes filtrados:', residentes);
                setResidentes(residentes);
                setResidentesFiltrados(residentes);
            } else {
                console.error('Error en la respuesta:', response.error);
                setError('Error al cargar la lista de residentes: ' + response.error);
            }
        } catch (error) {
            console.error('Error al cargar residentes:', error);
            setError('Error al cargar la lista de residentes');
        }
    }, []);

    // UseEffect principal - ejecutar solo una vez al montar
    useEffect(() => {
        // Usar localStorage para persistir a través de re-mounts
        const alreadyInitialized = localStorage.getItem('estadoCuenta_initialized');
        const now = Date.now();
        
        // Si ya se inicializó en los últimos 10 segundos, saltar (aumentado para dar más tiempo)
        if (alreadyInitialized && (now - parseInt(alreadyInitialized)) < 10000) {
            console.log('⏭️ Ya inicializado recientemente, saltando useEffect');
            return;
        }
        
        console.log('📋 UseEffect INICIAL - ejecutado');
        localStorage.setItem('estadoCuenta_initialized', now.toString());
        
        // Solo administradores pueden usar esta vista
        if (!isAdmin) {
            setError('Solo los administradores pueden acceder a esta funcionalidad');
            return;
        }

        if (!user?.id) {
            console.log('Saltando - usuario no definido');
            return;
        }

        // Verificar sessionStorage
        const savedResidenteId = sessionStorage.getItem('estadoCuenta_residenteSeleccionado');
        const savedShowList = sessionStorage.getItem('estadoCuenta_showResidentList');
        
        console.log('📁 SessionStorage al iniciar:', { savedResidenteId, savedShowList });

        if (savedResidenteId && savedResidenteId !== '') {
            // Restaurar estado desde sessionStorage
            console.log('🔄 Restaurando desde sessionStorage:', savedResidenteId);
            setResidenteSeleccionado(savedResidenteId);
            
            // Verificar si ya tenemos datos de estado de cuenta guardados
            const estadoCuentaKey = `estadoCuenta_data_${savedResidenteId}`;
            const datosGuardados = sessionStorage.getItem(estadoCuentaKey);
            
            if (datosGuardados && savedShowList === 'false') {
                try {
                    const datos = JSON.parse(datosGuardados);
                    console.log('✅ Restaurando datos de estado de cuenta desde sessionStorage');
                    setEstadoCuenta(datos);
                    setTieneEstadoCuenta(true);
                    setShowResidentList(false);
                    // También cargar residentes para completar el estado
                    console.log('🔄 Cargando residentes para completar estado...');
                    loadResidentes();
                    return; // No necesitamos hacer nueva llamada a la API
                } catch (e) {
                    console.log('❌ Error al parsear datos guardados, recargando desde API...');
                }
            }
            
            if (savedShowList === 'false') {
                setShowResidentList(false);
                // Cargar residentes primero, luego el estado de cuenta
                console.log('🔄 Cargando residentes desde sessionStorage...');
                loadResidentes();
                // Cargar estado de cuenta inmediatamente (sin setTimeout para evitar cancelación por unmount)
                console.log('🔄 Cargando estado de cuenta inmediatamente...');
                loadEstadoCuenta(parseInt(savedResidenteId));
            } else {
                setShowResidentList(true);
                console.log('🔄 Cargando residentes - showList true...');
                loadResidentes();
            }
        } else {
            // Estado inicial - cargar residentes
            console.log('📋 Estado inicial - cargando residentes');
            setShowResidentList(true);
            loadResidentes();
        }
        
        // Cleanup function para limpiar cuando el componente se desmonte
        return () => {
            console.log('🧹 Limpiando componente EstadoCuenta');
            // Limpiar el flag después de un delay para permitir re-mount rápido
            setTimeout(() => {
                localStorage.removeItem('estadoCuenta_initialized');
            }, 1000);
        };
    }, []); // Sin dependencias - ejecutar REALMENTE solo una vez

    // Debug useEffect para tieneEstadoCuenta
    useEffect(() => {
        console.log('🐛 tieneEstadoCuenta cambió a:', tieneEstadoCuenta);
    }, [tieneEstadoCuenta]);

    // Debug useEffect para residentes
    useEffect(() => {
        console.log('🐛 residentes cambió:', { total: residentes.length, residentes });
    }, [residentes]);

    // Definir loadEstadoCuenta antes de usarla en useEffects
    const loadEstadoCuenta = useCallback(async (residenteId = null) => {
        // Verificaciones múltiples para evitar llamadas duplicadas
        if (isLoading) {
            console.log('⏳ Ya está cargando, saltando llamada...');
            return;
        }
        
        if (!residenteId) {
            console.log('❌ Sin residenteId, saltando llamada...');
            return;
        }
        
        // Verificar si ya estamos cargando este residente específico
        if (cargandoResidenteRef.current === residenteId) {
            console.log('⏳ Ya estamos cargando este residente, saltando...');
            return;
        }
        
        // Verificar si ya tenemos los datos para este residente
        if (estadoCuentaRef.current && estadoCuentaRef.current.residente_info?.id === residenteId) {
            console.log('✅ Ya tenemos datos para este residente, saltando llamada...');
            return;
        }
        
        try {
            cargandoResidenteRef.current = residenteId; // Marcar como cargando
            setIsLoading(true);
            startPageLoading('Cargando estado de cuenta...');
            setError('');
            
            console.log('🔄 Cargando estado de cuenta para residenteId:', residenteId);
            const response = await financesService.getEstadoCuenta(residenteId);
            console.log('✅ Respuesta recibida:', response);
            
            // Verificar si el componente sigue montado antes de actualizar estado
            if (cargandoResidenteRef.current !== residenteId) {
                console.log('⚠️ Componente desmontado o cambio de residente, ignorando respuesta');
                return;
            }
            
            if (response.success) {
                console.log('🔄 Actualizando estados...');
                setEstadoCuenta(response.data);
                estadoCuentaRef.current = response.data; // Mantener ref sincronizado
                console.log('🔄 Actualizando tieneEstadoCuenta a true...');
                setTieneEstadoCuenta(true); // ¡ESTO FALTABA! Marcar que tenemos datos
                setShowResidentList(false);
                
                // Guardar en sessionStorage para persistir entre re-mounts
                const estadoCuentaKey = `estadoCuenta_data_${residenteId}`;
                sessionStorage.setItem(estadoCuentaKey, JSON.stringify(response.data));
                console.log('💾 Datos guardados en sessionStorage');
                
                console.log('✅ Estado actualizado correctamente');
            } else {
                setError(response.error || 'Error al cargar el estado de cuenta');
                setTieneEstadoCuenta(false); // No hay datos válidos
                setEstadoCuenta(null); // Limpiar datos previos
                console.log('❌ Error en respuesta:', response.error);
            }
        } catch (error) {
            console.error('❌ Error al cargar estado de cuenta:', error);
            setError('Error al cargar el estado de cuenta');
            setTieneEstadoCuenta(false); // No hay datos válidos
            setEstadoCuenta(null); // Limpiar datos previos
        } finally {
            console.log('🧹 Limpiando cargandoResidenteRef:', { antes: cargandoResidenteRef.current, residenteId });
            cargandoResidenteRef.current = null; // Limpiar flag de carga
            setIsLoading(false);
            stopPageLoading();
        }
    }, [isLoading, startPageLoading, stopPageLoading]); // Removido estadoCuenta para evitar bucle infinito

    const handleResidenteChange = (residenteId) => {
        const id = residenteId === '' ? null : residenteId;
        setResidenteSeleccionado(residenteId);
        if (id) {
            loadEstadoCuenta(id);
            setShowResidentList(false);
        } else {
            setEstadoCuenta(null);
            setTieneEstadoCuenta(false); // Sin residente seleccionado, no hay estado de cuenta
            setShowResidentList(true);
        }
    };

    const handleBusqueda = (valor) => {
        setBusqueda(valor);
        if (valor.trim() === '') {
            setResidentesFiltrados(residentes);
        } else {
            const filtrados = residentes.filter(residente => 
                residente.first_name.toLowerCase().includes(valor.toLowerCase()) ||
                residente.last_name.toLowerCase().includes(valor.toLowerCase()) ||
                residente.username.toLowerCase().includes(valor.toLowerCase()) ||
                residente.email.toLowerCase().includes(valor.toLowerCase())
            );
            setResidentesFiltrados(filtrados);
        }
    };

    // Funciones para manejo de pagos
    const handlePagarCargo = (cargo) => {
        console.log('💳 Iniciar pago para cargo:', cargo);
        setSelectedCargo(cargo);
        setShowPaymentModal(true);
        setPaymentMethod('tarjeta');
    };

    const handleCancelarCargo = async (cargo) => {
        if (window.confirm(`¿Está seguro que desea cancelar el cargo "${cargo.concepto_nombre}" por ${formatMoney(cargo.monto)}?`)) {
            try {
                setIsLoading(true);
                startPageLoading('Cancelando cargo...');
                
                console.log('❌ Cancelar cargo:', cargo);
                await financesService.deleteCargo(cargo.id);
                
                // Mostrar mensaje de éxito
                alert(`Cargo "${cargo.concepto_nombre}" cancelado exitosamente`);
                
                // Recargar datos del estado de cuenta
                if (residenteSeleccionado) {
                    loadEstadoCuenta(parseInt(residenteSeleccionado));
                }
                
            } catch (error) {
                console.error('❌ Error al cancelar cargo:', error);
                setError('Error al cancelar el cargo: ' + error.message);
                alert('Error al cancelar el cargo. Intente nuevamente.');
            } finally {
                setIsLoading(false);
                stopPageLoading();
            }
        }
    };

    const handleConfirmPayment = async () => {
        if (!selectedCargo) return;
        
        setProcessingPayment(true);
        try {
            console.log('🔄 Procesando pago:', { 
                cargo: selectedCargo,
                method: paymentMethod
            });
            
            // Generar referencia de pago basada en el método
            const referenciaPago = `${paymentMethod.toUpperCase()}-${Date.now()}-${selectedCargo.id}`;
            const observaciones = `Pago procesado por ${paymentMethod} desde portal web`;
            
            // Llamada al backend para procesar pago
            const pagoResult = await financesService.pagarCargo(selectedCargo.id, referenciaPago, observaciones);
            
            // Mostrar mensaje de éxito
            const successMessage = `¡Pago procesado exitosamente!\nCargo: ${selectedCargo.concepto_nombre}\nMonto: ${formatMoney(selectedCargo.monto)}\nMétodo: ${paymentMethod}\nReferencia: ${referenciaPago}`;
            
            // Cerrar modal de pago
            setShowPaymentModal(false);
            setSelectedCargo(null);
            
            // Recargar datos del estado de cuenta
            if (residenteSeleccionado) {
                await loadEstadoCuenta(parseInt(residenteSeleccionado));
            }
            
            setSuccessMessage(successMessage);
            
            // Preguntar si desea descargar el comprobante PDF
            setTimeout(async () => {
                const descargarComprobante = window.confirm(
                    "¡Pago procesado exitosamente! ¿Desea descargar el comprobante de pago en PDF?"
                );
                
                if (descargarComprobante) {
                    try {
                        await handleGenerarComprobante({ id: selectedCargo.id });
                    } catch (error) {
                        console.error('Error al generar comprobante automático:', error);
                    }
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Error al procesar pago:', error);
            setError('Error al procesar el pago: ' + error.message);
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleCancelPayment = () => {
        setShowPaymentModal(false);
        setSelectedCargo(null);
        setPaymentMethod('tarjeta');
    };

    // Funciones para manejo de comprobantes
    const handleGenerarComprobante = async (cargo) => {
        try {
            setGeneratingComprobante(true);
            console.log('📄 Generando comprobante desde backend para cargo:', cargo.id);
            
            // Llamar al backend para generar y descargar el PDF
            const resultado = await financesService.generarComprobantePDF(cargo.id);
            
            if (resultado.success) {
                setSuccessMessage(`Comprobante ${resultado.numeroComprobante} descargado exitosamente`);
                
                // Opcional: Limpiar mensaje después de unos segundos
                setTimeout(() => {
                    setSuccessMessage('');
                }, 5000);
                
                console.log('✅ Comprobante generado exitosamente:', resultado);
            }
            
        } catch (error) {
            console.error('❌ Error al generar comprobante:', error);
            
            let errorMessage = 'Error al generar el comprobante';
            
            if (error.message.includes('Solo se pueden generar comprobantes de cargos pagados')) {
                errorMessage = 'Solo se pueden generar comprobantes de cargos pagados';
            } else if (error.message.includes('No tiene permisos')) {
                errorMessage = 'No tiene permisos para generar este comprobante';
            } else if (error.message.includes('404')) {
                errorMessage = 'Cargo no encontrado';
            }
            
            setError(errorMessage);
            
            // Limpiar error después de unos segundos
            setTimeout(() => {
                setError('');
            }, 5000);
        } finally {
            setGeneratingComprobante(false);
        }
    };

    // Función para limpiar mensajes después de un tiempo
    const clearMessagesAfterDelay = useCallback(() => {
        setTimeout(() => {
            setSuccessMessage('');
            setError('');
        }, 5000);
    }, []);

    const seleccionarResidente = useCallback(async (residente) => {
        console.log('=== SELECCIONANDO RESIDENTE ===');
        console.log('Residente:', residente);
        
        const residenteId = residente.id.toString();
        
        // Verificar si ya tenemos este residente seleccionado
        if (residenteSeleccionado === residenteId && estadoCuentaRef.current) {
            console.log('✅ Ya tenemos este residente y sus datos, saltando');
            return;
        }
        
        // 1. Actualizar estados en lote para reducir renders
        setResidenteSeleccionado(residenteId);
        setShowResidentList(false);
        setEstadoCuenta(null);
        estadoCuentaRef.current = null; // Mantener ref sincronizado
        
        // 2. Guardar en sessionStorage
        sessionStorage.setItem('estadoCuenta_residenteSeleccionado', residenteId);
        sessionStorage.setItem('estadoCuenta_showResidentList', 'false');
        
        console.log('💾 Estados guardados - residente:', residenteId);
        
        // 3. Cargar estado de cuenta
        console.log('🔄 Cargando estado de cuenta...');
        await loadEstadoCuenta(residente.id);
        
        console.log('=== FIN SELECCIÓN ===');
    }, [residenteSeleccionado, loadEstadoCuenta]); // Removido estadoCuenta para evitar bucle

    const volverALista = () => {
        console.log('🔄 Volviendo a la lista - estado antes:', {
            residentes: residentes.length,
            showResidentList,
            residenteSeleccionado
        });
        
        setResidenteSeleccionado('');
        setEstadoCuenta(null);
        setTieneEstadoCuenta(false); // ¡ESTO TAMBIÉN FALTABA!
        estadoCuentaRef.current = null; // Mantener ref sincronizado
        setShowResidentList(true);
        setBusqueda('');
        setResidentesFiltrados(residentes);
        
        // Limpiar sessionStorage
        sessionStorage.removeItem('estadoCuenta_residenteSeleccionado');
        sessionStorage.setItem('estadoCuenta_showResidentList', 'true');
        
        // Limpiar datos de estado de cuenta guardados
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
            if (key.startsWith('estadoCuenta_data_')) {
                sessionStorage.removeItem(key);
            }
        });
        console.log('🗑️ Datos de estado de cuenta limpiados');
        
        // Reset del ref para permitir nueva inicialización si es necesaria
        inicializadoRef.current = false;
        // Limpiar también el flag de localStorage
        localStorage.removeItem('estadoCuenta_initialized');
        
        console.log('✅ Estados establecidos para mostrar lista');
        
        // Si no hay residentes cargados, cargarlos
        if (residentes.length === 0) {
            console.log('🔄 No hay residentes, cargando...');
            loadResidentes();
        }
        
        console.log('🔄 Volviendo a la lista - sessionStorage limpiado');
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CO');
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            'pendiente': 'bg-yellow-100 text-yellow-800',
            'pagado': 'bg-green-100 text-green-800',
            'vencido': 'bg-red-100 text-red-800',
            'cancelado': 'bg-gray-100 text-gray-800'
        };
        return badges[estado] || 'bg-gray-100 text-gray-800';
    };

    const getSeveridadBadge = (severidad) => {
        const badges = {
            'baja': 'bg-blue-100 text-blue-800',
            'media': 'bg-yellow-100 text-yellow-800',
            'alta': 'bg-red-100 text-red-800'
        };
        return badges[severidad] || 'bg-gray-100 text-gray-800';
    };

    const getTipoIcon = (tipo) => {
        const icons = {
            'vencido': ExclamationTriangleIcon,
            'vencimiento_proximo': ClockIcon
        };
        return icons[tipo] || DocumentTextIcon;
    };

    // Verificación de permisos y vista inicial
    if (!isAdmin) {
        return (
            <Layout>
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Estado de Cuenta - Administrativo</h1>
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        Solo los administradores pueden acceder a esta funcionalidad
                    </div>
                </div>
            </Layout>
        );
    }

    // Vista principal sin estado de cuenta seleccionado
    if (showResidentList || !residenteSeleccionado || !tieneEstadoCuenta) {
        console.log('🎯 Renderizando LISTA porque:', {
            showResidentList,
            tieneEstadoCuenta,
            tieneResidenteSeleccionado: !!residenteSeleccionado,
            residenteSeleccionado,
            razon: !residenteSeleccionado ? 'No hay residente seleccionado' : 
                   !tieneEstadoCuenta ? 'No hay datos de estado de cuenta' :
                   showResidentList ? 'showResidentList es true' : 'Otra razón'
        });
        return (
            <Layout>
                <div className="p-6">
                    {/* Header Administrativo */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Consulta de Estado de Cuenta</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Vista administrativa para consultar el estado financiero de los residentes
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mensaje de error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Mensaje de éxito */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                            {successMessage}
                        </div>
                    )}

                    {/* Buscador */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Lista de Residentes</h2>
                            <div className="relative max-w-md w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-600 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={busqueda}
                                    onChange={(e) => handleBusqueda(e.target.value)}
                                    placeholder="Buscar por nombre, usuario o email..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-500 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Residentes */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Residente
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Teléfono
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {residentesFiltrados.length > 0 ? (
                                        residentesFiltrados.map((residente) => (
                                            <tr key={residente.id} className="hover:bg-blue-50 dark:hover:bg-gray-700">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                                                                    {residente.first_name && residente.last_name
                                                                        ? `${residente.first_name[0].toUpperCase()}${residente.last_name[0].toUpperCase()}`
                                                                        : residente.first_name 
                                                                            ? `${residente.first_name[0].toUpperCase()}${residente.username[0].toUpperCase()}`
                                                                            : `${residente.username[0].toUpperCase()}${residente.username[1]?.toUpperCase() || ''}`
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {residente.first_name && residente.last_name 
                                                                    ? `${residente.first_name} ${residente.last_name}`
                                                                    : residente.first_name 
                                                                        ? residente.first_name
                                                                        : residente.username || 'Usuario sin nombre'
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                ID: {residente.id} • @{residente.username}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {residente.username}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {residente.email}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {residente.phone || 'No registrado'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => seleccionarResidente(residente)}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                                                        Ver Estado de Cuenta
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-400">
                                                {busqueda ? 'No se encontraron residentes que coincidan con la búsqueda' : 'No hay residentes registrados'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        
                        {/* Footer de la tabla */}
                        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
                            <div className="text-sm text-gray-800 dark:text-gray-300">
                                Mostrando {residentesFiltrados.length} de {residentes.length} residentes
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={volverALista}
                            className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Volver
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Estado de Cuenta - {estadoCuenta?.residente_info?.nombre_completo || 'Sin datos'}
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Usuario: {estadoCuenta?.residente_info?.username || 'N/A'} - Consulta: {formatDate(estadoCuenta?.fecha_consulta)}
                            </p>
                        </div>
                    </div>
                    
                    {/* Información del residente seleccionado - sin selector */}
                    <div className="mt-4 sm:mt-0">
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Residente seleccionado:</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {estadoCuenta?.residente_info?.nombre_completo || 'Cargando...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alertas */}
            {estadoCuenta?.alertas?.length > 0 && (
                <div className="space-y-3">
                    {estadoCuenta?.alertas?.map((alerta, index) => {
                        const IconComponent = getTipoIcon(alerta.tipo);
                        return (
                            <div key={index} className={`p-4 rounded-lg border-l-4 ${alerta.severidad === 'alta' ? 'bg-red-50 border-red-400' : alerta.severidad === 'media' ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-400'}`}>
                                <div className="flex">
                                    <IconComponent className="h-5 w-5 text-current" />
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium">{alerta.titulo}</h3>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeveridadBadge(alerta.severidad)}`}>
                                                {alerta.severidad.charAt(0).toUpperCase() + alerta.severidad.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{alerta.mensaje}</p>
                                        {alerta.accion && (
                                            <p className="text-sm font-medium text-blue-600 mt-2">{alerta.accion}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Vencido</p>
                            <p className="text-2xl font-bold text-red-600">
                                {formatMoney(estadoCuenta?.resumen_general?.total_vencido)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Pendiente</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {formatMoney(estadoCuenta?.resumen_general?.total_pendiente)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Al Día</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatMoney(estadoCuenta?.resumen_general?.total_al_dia)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Pagado (6 meses)</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatMoney(estadoCuenta?.resumen_general?.total_pagado_6_meses)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navegación por Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        {[
                            { id: 'resumen', name: 'Resumen', icon: ChartBarIcon },
                            { id: 'pendientes', name: 'Pendientes', icon: ClockIcon },
                            { id: 'vencidos', name: 'Vencidos', icon: ExclamationTriangleIcon },
                            { id: 'historial', name: 'Historial', icon: DocumentTextIcon }
                        ].map((tab) => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <IconComponent className="h-4 w-4" />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Tab: Resumen */}
                    {activeTab === 'resumen' && (
                        <div className="space-y-6">
                            {/* Próximo Vencimiento y Último Pago */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Próximo Vencimiento */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Próximo Vencimiento</h3>
                                    {estadoCuenta?.proximo_vencimiento?.cargo ? (
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {estadoCuenta?.proximo_vencimiento?.cargo?.concepto_nombre}
                                            </p>
                                            <p className="text-2xl font-bold text-yellow-600">
                                                {formatMoney(estadoCuenta?.proximo_vencimiento?.cargo?.monto)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Vence: {formatDate(estadoCuenta?.proximo_vencimiento?.fecha)} 
                                                ({estadoCuenta?.proximo_vencimiento?.dias_restantes} días)
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No hay próximos vencimientos</p>
                                    )}
                                </div>

                                {/* Último Pago */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Último Pago</h3>
                                    {estadoCuenta?.ultimo_pago?.cargo ? (
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {estadoCuenta?.ultimo_pago?.cargo?.concepto_nombre}
                                            </p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatMoney(estadoCuenta?.ultimo_pago?.cargo?.monto)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Hace {estadoCuenta?.ultimo_pago?.hace_dias} días
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No hay pagos registrados</p>
                                    )}
                                </div>
                            </div>

                            {/* Desglose por Tipo */}
                            {estadoCuenta?.desglose_por_tipo?.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Desglose por Tipo</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="space-y-3">
                                            {estadoCuenta?.desglose_por_tipo?.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.concepto__nombre}</p>
                                                        <p className="text-sm text-gray-500">{item.cantidad} cargo(s)</p>
                                                    </div>
                                                    <p className="font-bold text-gray-900">{formatMoney(item.total)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Pendientes */}
                    {activeTab === 'pendientes' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Cargos Pendientes ({estadoCuenta?.cargos_pendientes?.length || 0})
                            </h3>
                            {estadoCuenta?.cargos_pendientes?.length > 0 ? (
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Concepto</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Vencimiento</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {estadoCuenta.cargos_pendientes.map((cargo) => (
                                            <tr key={cargo.id}>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{cargo.concepto_nombre}</p>
                                                        <p className="text-sm text-gray-500">{cargo.concepto_tipo}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formatMoney(cargo.monto)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(cargo.fecha_vencimiento)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(cargo.estado)}`}>
                                                        {cargo.estado_display}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handlePagarCargo(cargo)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                                        >
                                                            💳 Pagar
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelarCargo(cargo)}
                                                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700 transition-colors duration-200"
                                                        >
                                                            ❌ Cancelar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500">No tiene cargos pendientes</p>
                            )}
                        </div>
                    )}

                    {/* Tab: Vencidos */}
                    {activeTab === 'vencidos' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Cargos Vencidos ({estadoCuenta.cargos_vencidos?.length || 0})
                            </h3>
                            {estadoCuenta.cargos_vencidos?.length > 0 ? (
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Concepto</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Vencimiento</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {estadoCuenta.cargos_vencidos.map((cargo) => (
                                            <tr key={cargo.id}>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{cargo.concepto_nombre}</p>
                                                        <p className="text-sm text-gray-500">{cargo.concepto_tipo}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                                    {formatMoney(cargo.monto)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(cargo.fecha_vencimiento)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(cargo.estado)}`}>
                                                        {cargo.estado_display}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500">No tiene cargos vencidos</p>
                            )}
                        </div>
                    )}

                    {/* Tab: Historial */}
                    {activeTab === 'historial' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Historial de Pagos ({estadoCuenta.historial_pagos?.length || 0})
                            </h3>
                            {estadoCuenta.historial_pagos?.length > 0 ? (
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Concepto</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Fecha Aplicación</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Comprobante</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {estadoCuenta.historial_pagos.map((cargo) => (
                                            <tr key={cargo.id}>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{cargo.concepto_nombre}</p>
                                                        <p className="text-sm text-gray-500">{cargo.concepto_tipo}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                    {formatMoney(cargo.monto)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(cargo.fecha_aplicacion)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(cargo.estado)}`}>
                                                        {cargo.estado_display}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleGenerarComprobante(cargo)}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                                    >
                                                        📄 Comprobante
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500">No hay historial de pagos disponible</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            </div>

            {/* Modal de Pago */}
            {showPaymentModal && selectedCargo && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                        <div className="mt-3">
                            {/* Header del Modal */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    💳 Pagar Cuota
                                </h3>
                                <button
                                    onClick={handleCancelPayment}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Detalles del Cargo */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Detalles del Cargo:</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Concepto:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{selectedCargo.concepto_nombre}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                                        <span className="text-gray-900 dark:text-white">{selectedCargo.concepto_tipo}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                                        <span className="font-bold text-green-600">{formatMoney(selectedCargo.monto)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Vencimiento:</span>
                                        <span className="text-gray-900 dark:text-white">{formatDate(selectedCargo.fecha_vencimiento)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Método de Pago */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Método de Pago:
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="tarjeta">💳 Tarjeta de Crédito/Débito</option>
                                    <option value="transferencia">🏦 Transferencia Bancaria</option>
                                    <option value="efectivo">💰 Efectivo</option>
                                    <option value="cheque">📝 Cheque</option>
                                </select>
                            </div>

                            {/* Información del Método Seleccionado */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    {paymentMethod === 'tarjeta' && (
                                        <>
                                            <div className="font-medium mb-1">💳 Pago con Tarjeta</div>
                                            <div>Se procesará el pago a través de nuestro gateway seguro.</div>
                                        </>
                                    )}
                                    {paymentMethod === 'transferencia' && (
                                        <>
                                            <div className="font-medium mb-1">🏦 Transferencia Bancaria</div>
                                            <div>Se generará un comprobante con los datos bancarios.</div>
                                        </>
                                    )}
                                    {paymentMethod === 'efectivo' && (
                                        <>
                                            <div className="font-medium mb-1">💰 Pago en Efectivo</div>
                                            <div>Registrar pago recibido en la administración.</div>
                                        </>
                                    )}
                                    {paymentMethod === 'cheque' && (
                                        <>
                                            <div className="font-medium mb-1">📝 Pago con Cheque</div>
                                            <div>Registrar cheque recibido pendiente de compensación.</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancelPayment}
                                    disabled={processingPayment}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={processingPayment}
                                    className="flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processingPayment ? (
                                        <>
                                            <span className="animate-spin inline-block mr-2">⏳</span>
                                            Procesando...
                                        </>
                                    ) : (
                                        `💳 Confirmar Pago`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default EstadoCuenta;