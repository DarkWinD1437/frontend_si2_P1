import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Layout from '../../components/Layout';
import {
    generarReporteFinanciero,
    generarReporteSeguridad,
    generarReporteUsoAreas,
    generarPrediccionMorosidad,
    getReportesFinancieros,
    getReportesSeguridad,
    getReportesUsoAreas,
    getPrediccionesMorosidad,
    getResidentes,
    TIPOS_REPORTE_FINANCIERO,
    TIPOS_REPORTE_SEGURIDAD,
    AREAS_COMUNES,
    METRICAS_USO_AREAS,
    MODELOS_IA,
    PERIODOS_REPORTE,
    FORMATOS_REPORTE,
    formatMoney,
    formatPercentage,
    formatDate,
    formatDateTime,
    getTipoReporteBadgeColor,
    getRiesgoBadgeColor,
    getConfianzaBadgeColor,
    getTipoReporteFinancieroDisplay,
    getTipoReporteSeguridadDisplay,
    getAreaComunDisplay,
    getMetricaDisplay,
    getModeloIADisplay,
    getNivelConfianzaDisplay,
    getRiesgoDisplay,
    validateReporteFinancieroData,
    validateReporteSeguridadData,
    validateReporteUsoAreasData,
    validatePrediccionMorosidadData
} from '../../services/analyticsService';

const AnalyticsModule = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [reportes, setReportes] = useState({
        financieros: [],
        seguridad: [],
        usoAreas: [],
        morosidad: []
    });

    // Estados para formularios
    const [formData, setFormData] = useState({
        financiero: {
            titulo: '',
            descripcion: '',
            tipo: '',
            periodo: 'mensual',
            formato: 'json',
            fecha_inicio: '',
            fecha_fin: '',
            filtros_aplicados: {}
        },
        seguridad: {
            titulo: '',
            descripcion: '',
            tipo: '',
            periodo: 'mes',
            fecha_inicio: '',
            fecha_fin: '',
            filtros_aplicados: {}
        },
        usoAreas: {
            titulo: '',
            descripcion: '',
            area: '',
            periodo: 'mes',
            metrica_principal: '',
            fecha_inicio: '',
            fecha_fin: '',
            filtros_aplicados: {}
        },
        morosidad: {
            titulo: '',
            descripcion: '',
            modelo_usado: 'grok-4-fast-free',
            periodo_predicho: '',
            datos_entrada: {},
            parametros_modelo: {},
            tipo_prediccion: 'general', // 'general' o 'individual'
            residente_id: null
        }
    });

    // Estados para resultados
    const [resultados, setResultados] = useState({
        financiero: null,
        seguridad: null,
        usoAreas: null,
        morosidad: null
    });

    // Estados para errores
    const [errores, setErrores] = useState({
        financiero: {},
        seguridad: {},
        usoAreas: {},
        morosidad: {}
    });

    // Estado para lista de residentes
    const [residentes, setResidentes] = useState([]);
    const [cargandoResidentes, setCargandoResidentes] = useState(false);

    // Cargar reportes existentes al montar el componente
    useEffect(() => {
        cargarReportesExistentes();
        cargarResidentes();
    }, []);

    const cargarResidentes = async () => {
        try {
            setCargandoResidentes(true);
            const response = await getResidentes();
            // Transformar los datos para el formato esperado
            const residentesFormateados = response.results ? response.results.map(residente => ({
                id: residente.id,
                nombre: `${residente.first_name} ${residente.last_name}`,
                email: residente.email
            })) : [];
            setResidentes(residentesFormateados);
        } catch (error) {
            console.error('Error cargando residentes:', error);
            // Fallback a datos mock si la API no está disponible
            const residentesMock = [
                { id: 1, nombre: 'Juan Pérez', email: 'juan.perez@email.com' },
                { id: 2, nombre: 'María García', email: 'maria.garcia@email.com' },
                { id: 3, nombre: 'Carlos López', email: 'carlos.lopez@email.com' },
                { id: 4, nombre: 'Ana Rodríguez', email: 'ana.rodriguez@email.com' },
                { id: 5, nombre: 'Pedro Martínez', email: 'pedro.martinez@email.com' }
            ];
            setResidentes(residentesMock);
        } finally {
            setCargandoResidentes(false);
        }
    };

    const cargarReportesExistentes = async () => {
        try {
            const [financieros, seguridad, usoAreas, morosidad] = await Promise.all([
                getReportesFinancieros(),
                getReportesSeguridad(),
                getReportesUsoAreas(),
                getPrediccionesMorosidad()
            ]);

            setReportes({
                financieros: financieros.results || financieros,
                seguridad: seguridad.results || seguridad,
                usoAreas: usoAreas.results || usoAreas,
                morosidad: morosidad.results || morosidad
            });
        } catch (error) {
            console.error('Error cargando reportes existentes:', error);
        }
    };

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));

        // Limpiar error del campo si existe
        if (errores[section][field]) {
            setErrores(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: undefined
                }
            }));
        }
    };

    const handleSubmit = async (section) => {
        setLoading(true);
        setErrores(prev => ({ ...prev, [section]: {} }));

        try {
            let validation;
            let result;

            switch (section) {
                case 'financiero':
                    validation = validateReporteFinancieroData(formData.financiero);
                    if (!validation.isValid) {
                        setErrores(prev => ({ ...prev, financiero: validation.errors }));
                        return;
                    }
                    result = await generarReporteFinanciero(formData.financiero);
                    break;

                case 'seguridad':
                    validation = validateReporteSeguridadData(formData.seguridad);
                    if (!validation.isValid) {
                        setErrores(prev => ({ ...prev, seguridad: validation.errors }));
                        return;
                    }
                    result = await generarReporteSeguridad(formData.seguridad);
                    break;

                case 'usoAreas':
                    validation = validateReporteUsoAreasData(formData.usoAreas);
                    if (!validation.isValid) {
                        setErrores(prev => ({ ...prev, usoAreas: validation.errors }));
                        return;
                    }
                    result = await generarReporteUsoAreas(formData.usoAreas);
                    break;

                case 'morosidad':
                    validation = validatePrediccionMorosidadData(formData.morosidad);
                    if (!validation.isValid) {
                        setErrores(prev => ({ ...prev, morosidad: validation.errors }));
                        return;
                    }
                    // Preparar datos para la predicción
                    const datosPrediccion = {
                        ...formData.morosidad,
                        residente_id: formData.morosidad.tipo_prediccion === 'individual' ? formData.morosidad.residente_id : null
                    };
                    result = await generarPrediccionMorosidad(datosPrediccion);
                    break;

                default:
                    throw new Error('Sección no válida');
            }

            setResultados(prev => ({ ...prev, [section]: result }));

            // Recargar lista de reportes
            await cargarReportesExistentes();

            // Mostrar mensaje de éxito
            alert(`${section.charAt(0).toUpperCase() + section.slice(1)} generado exitosamente`);

        } catch (error) {
            console.error(`Error generando ${section}:`, error);
            alert(`Error generando ${section}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Reportes Financieros</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportes.financieros.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Reportes Seguridad</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportes.seguridad.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Reportes Uso Áreas</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportes.usoAreas.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Predicciones IA</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportes.morosidad.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reportes Recientes</h3>
                <div className="space-y-4">
                    {[...reportes.financieros.slice(0, 3), ...reportes.seguridad.slice(0, 3), ...reportes.usoAreas.slice(0, 3), ...reportes.morosidad.slice(0, 3)]
                        .sort((a, b) => new Date(b.fecha_generacion || b.fecha_prediccion) - new Date(a.fecha_generacion || a.fecha_prediccion))
                        .slice(0, 5)
                        .map((reporte, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{reporte.titulo}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {formatDateTime(reporte.fecha_generacion || reporte.fecha_prediccion)}
                                </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getTipoReporteBadgeColor(
                                reporte.tipo || reporte.area || 'financiero',
                                reporte.fecha_prediccion ? 'morosidad' : 'financiero'
                            )}`}>
                                {reporte.tipo ? getTipoReporteFinancieroDisplay(reporte.tipo) :
                                 reporte.area ? getAreaComunDisplay(reporte.area) :
                                 'Predicción IA'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFormSection = (title, section, fields, submitButtonText) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(section); }} className="space-y-4">
                {fields}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium"
                    >
                        {loading ? 'Generando...' : submitButtonText}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderResultSection = (title, section, result) => {
        if (!result) return null;

        // Función especial para mostrar resultados de morosidad como texto natural
        const renderMorosidadResult = (morosidadResult) => {
            try {
                // Extraer la respuesta de la IA
                let aiResponse = '';

                // Intentar extraer insights_ia de diferentes niveles
                if (morosidadResult.resultados && morosidadResult.resultados.insights_ia) {
                    aiResponse = morosidadResult.resultados.insights_ia;
                } else if (morosidadResult.insights_ia) {
                    aiResponse = morosidadResult.insights_ia;
                } else if (morosidadResult.resultados && morosidadResult.resultados.response) {
                    aiResponse = morosidadResult.resultados.response;
                } else if (typeof morosidadResult.resultados === 'string') {
                    aiResponse = morosidadResult.resultados;
                } else {
                    aiResponse = 'No se pudo extraer la respuesta de la IA. Mostrando datos técnicos:\n\n' + JSON.stringify(morosidadResult, null, 2);
                }

                // Extraer estadísticas de diferentes niveles
                const estadisticas = morosidadResult.resultados?.estadisticas_generales || {};
                const totalResidentes = morosidadResult.total_residentes_analizados || estadisticas.total_residentes || 0;
                const riesgoBajo = morosidadResult.residentes_riesgo_bajo || estadisticas.riesgo_bajo || 0;
                const riesgoMedio = morosidadResult.residentes_riesgo_medio || estadisticas.riesgo_medio || 0;
                const riesgoAlto = morosidadResult.residentes_riesgo_alto || estadisticas.riesgo_alto || 0;
                const precision = morosidadResult.precision_modelo || estadisticas.precision_modelo || 0;
                const nivelConfianza = morosidadResult.nivel_confianza || 'medio';

                return (
                    <div className="space-y-4">
                        {/* Respuesta principal de la IA */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                        Análisis de IA - {morosidadResult.fuente === 'grok_ai' ? 'Grok 4 Fast Free' : 'Sistema de Fallback'}
                                    </h4>
                                    <div className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed whitespace-pre-wrap">
                                        {aiResponse}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas resumidas */}
                        {totalResidentes > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {riesgoBajo}
                                    </div>
                                    <div className="text-xs text-green-700 dark:text-green-300">Riesgo Bajo</div>
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {riesgoMedio}
                                    </div>
                                    <div className="text-xs text-yellow-700 dark:text-yellow-300">Riesgo Medio</div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {riesgoAlto}
                                    </div>
                                    <div className="text-xs text-red-700 dark:text-red-300">Riesgo Alto</div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {totalResidentes}
                                    </div>
                                    <div className="text-xs text-blue-700 dark:text-blue-300">Total Analizados</div>
                                </div>
                            </div>
                        )}

                        {/* Información adicional */}
                        {precision > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">Precisión del modelo:</span> {typeof precision === 'string' ? precision : precision.toFixed(1) + '%'}
                                    {nivelConfianza && (
                                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                            nivelConfianza === 'alto' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            nivelConfianza === 'medio' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            Confianza {nivelConfianza}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Detalles técnicos (colapsable) */}
                        <details className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                                Ver detalles técnicos completos
                            </summary>
                            <div className="mt-3">
                                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                                    {JSON.stringify(morosidadResult, null, 2)}
                                </pre>
                            </div>
                        </details>
                    </div>
                );
            } catch (error) {
                console.error('Error procesando resultado de morosidad:', error);
                return (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                            Error al procesar los resultados. Mostrando datos técnicos:
                        </div>
                        <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                            {JSON.stringify(morosidadResult, null, 2)}
                        </pre>
                    </div>
                );
            }
        };

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
                {section === 'morosidad' ? renderMorosidadResult(result) : (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        );
    };

    const renderReportesFinancieros = () => (
        <div className="space-y-6">
            {renderFormSection(
                'Generar Reporte Financiero',
                'financiero',
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Título *
                            </label>
                            <input
                                type="text"
                                value={formData.financiero.titulo}
                                onChange={(e) => handleInputChange('financiero', 'titulo', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.financiero.titulo ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Ej: Reporte Financiero Mensual"
                            />
                            {errores.financiero.titulo && <p className="text-red-500 text-sm mt-1">{errores.financiero.titulo}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tipo de Reporte *
                            </label>
                            <select
                                value={formData.financiero.tipo}
                                onChange={(e) => handleInputChange('financiero', 'tipo', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.financiero.tipo ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Seleccionar tipo</option>
                                {Object.entries(TIPOS_REPORTE_FINANCIERO).map(([key, value]) => (
                                    <option key={key} value={value}>{getTipoReporteFinancieroDisplay(value)}</option>
                                ))}
                            </select>
                            {errores.financiero.tipo && <p className="text-red-500 text-sm mt-1">{errores.financiero.tipo}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecha Inicio *
                            </label>
                            <input
                                type="date"
                                value={formData.financiero.fecha_inicio}
                                onChange={(e) => handleInputChange('financiero', 'fecha_inicio', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.financiero.fecha_inicio ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errores.financiero.fecha_inicio && <p className="text-red-500 text-sm mt-1">{errores.financiero.fecha_inicio}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecha Fin *
                            </label>
                            <input
                                type="date"
                                value={formData.financiero.fecha_fin}
                                onChange={(e) => handleInputChange('financiero', 'fecha_fin', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.financiero.fecha_fin ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errores.financiero.fecha_fin && <p className="text-red-500 text-sm mt-1">{errores.financiero.fecha_fin}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={formData.financiero.descripcion}
                            onChange={(e) => handleInputChange('financiero', 'descripcion', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Descripción opcional del reporte"
                        />
                    </div>
                </>,
                'Generar Reporte Financiero'
            )}

            {renderResultSection('Resultado del Reporte Financiero', 'financiero', resultados.financiero)}
        </div>
    );

    const renderReportesSeguridad = () => (
        <div className="space-y-6">
            {renderFormSection(
                'Generar Reporte de Seguridad',
                'seguridad',
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Título *
                            </label>
                            <input
                                type="text"
                                value={formData.seguridad.titulo}
                                onChange={(e) => handleInputChange('seguridad', 'titulo', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.seguridad.titulo ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Ej: Reporte de Seguridad Mensual"
                            />
                            {errores.seguridad.titulo && <p className="text-red-500 text-sm mt-1">{errores.seguridad.titulo}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tipo de Reporte *
                            </label>
                            <select
                                value={formData.seguridad.tipo}
                                onChange={(e) => handleInputChange('seguridad', 'tipo', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.seguridad.tipo ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Seleccionar tipo</option>
                                {Object.entries(TIPOS_REPORTE_SEGURIDAD).map(([key, value]) => (
                                    <option key={key} value={value}>{getTipoReporteSeguridadDisplay(value)}</option>
                                ))}
                            </select>
                            {errores.seguridad.tipo && <p className="text-red-500 text-sm mt-1">{errores.seguridad.tipo}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecha y Hora Inicio *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.seguridad.fecha_inicio}
                                onChange={(e) => handleInputChange('seguridad', 'fecha_inicio', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.seguridad.fecha_inicio ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errores.seguridad.fecha_inicio && <p className="text-red-500 text-sm mt-1">{errores.seguridad.fecha_inicio}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecha y Hora Fin *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.seguridad.fecha_fin}
                                onChange={(e) => handleInputChange('seguridad', 'fecha_fin', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.seguridad.fecha_fin ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errores.seguridad.fecha_fin && <p className="text-red-500 text-sm mt-1">{errores.seguridad.fecha_fin}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={formData.seguridad.descripcion}
                            onChange={(e) => handleInputChange('seguridad', 'descripcion', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Descripción opcional del reporte"
                        />
                    </div>
                </>,
                'Generar Reporte de Seguridad'
            )}

            {renderResultSection('Resultado del Reporte de Seguridad', 'seguridad', resultados.seguridad)}
        </div>
    );

    const renderReportesUsoAreas = () => (
        <div className="space-y-6">
            {renderFormSection(
                'Generar Reporte de Uso de Áreas Comunes',
                'usoAreas',
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Título *
                            </label>
                            <input
                                type="text"
                                value={formData.usoAreas.titulo}
                                onChange={(e) => handleInputChange('usoAreas', 'titulo', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.usoAreas.titulo ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Ej: Reporte de Uso del Gimnasio"
                            />
                            {errores.usoAreas.titulo && <p className="text-red-500 text-sm mt-1">{errores.usoAreas.titulo}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Área Común *
                            </label>
                            <select
                                value={formData.usoAreas.area}
                                onChange={(e) => handleInputChange('usoAreas', 'area', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.usoAreas.area ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Seleccionar área</option>
                                {Object.entries(AREAS_COMUNES).map(([key, value]) => (
                                    <option key={key} value={value}>{getAreaComunDisplay(value)}</option>
                                ))}
                            </select>
                            {errores.usoAreas.area && <p className="text-red-500 text-sm mt-1">{errores.usoAreas.area}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Métrica Principal *
                            </label>
                            <select
                                value={formData.usoAreas.metrica_principal}
                                onChange={(e) => handleInputChange('usoAreas', 'metrica_principal', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.usoAreas.metrica_principal ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Seleccionar métrica</option>
                                {Object.entries(METRICAS_USO_AREAS).map(([key, value]) => (
                                    <option key={key} value={value}>{getMetricaDisplay(value)}</option>
                                ))}
                            </select>
                            {errores.usoAreas.metrica_principal && <p className="text-red-500 text-sm mt-1">{errores.usoAreas.metrica_principal}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Período *
                            </label>
                            <select
                                value={formData.usoAreas.periodo}
                                onChange={(e) => handleInputChange('usoAreas', 'periodo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                {Object.entries(PERIODOS_REPORTE).map(([key, value]) => (
                                    <option key={key} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecha Inicio *
                            </label>
                            <input
                                type="date"
                                value={formData.usoAreas.fecha_inicio}
                                onChange={(e) => handleInputChange('usoAreas', 'fecha_inicio', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.usoAreas.fecha_inicio ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errores.usoAreas.fecha_inicio && <p className="text-red-500 text-sm mt-1">{errores.usoAreas.fecha_inicio}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecha Fin *
                            </label>
                            <input
                                type="date"
                                value={formData.usoAreas.fecha_fin}
                                onChange={(e) => handleInputChange('usoAreas', 'fecha_fin', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.usoAreas.fecha_fin ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errores.usoAreas.fecha_fin && <p className="text-red-500 text-sm mt-1">{errores.usoAreas.fecha_fin}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={formData.usoAreas.descripcion}
                            onChange={(e) => handleInputChange('usoAreas', 'descripcion', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Descripción opcional del reporte"
                        />
                    </div>
                </>,
                'Generar Reporte de Uso de Áreas'
            )}

            {renderResultSection('Resultado del Reporte de Uso de Áreas', 'usoAreas', resultados.usoAreas)}
        </div>
    );

    const renderPrediccionesMorosidad = () => (
        <div className="space-y-6">
            {renderFormSection(
                'Generar Predicción de Morosidad con IA',
                'morosidad',
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Título *
                            </label>
                            <input
                                type="text"
                                value={formData.morosidad.titulo}
                                onChange={(e) => handleInputChange('morosidad', 'titulo', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.morosidad.titulo ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Ej: Predicción de Morosidad Mensual"
                            />
                            {errores.morosidad.titulo && <p className="text-red-500 text-sm mt-1">{errores.morosidad.titulo}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tipo de Predicción *
                            </label>
                            <select
                                value={formData.morosidad.tipo_prediccion}
                                onChange={(e) => handleInputChange('morosidad', 'tipo_prediccion', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="general">General (Todos los residentes)</option>
                                <option value="individual">Individual (Residente específico)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tipo de Predicción *
                            </label>
                            <select
                                value={formData.morosidad.tipo_prediccion}
                                onChange={(e) => handleInputChange('morosidad', 'tipo_prediccion', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="general">General (Todos los residentes)</option>
                                <option value="individual">Individual (Residente específico)</option>
                            </select>
                        </div>

                        {formData.morosidad.tipo_prediccion === 'individual' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Residente *
                                </label>
                                <select
                                    value={formData.morosidad.residente_id || ''}
                                    onChange={(e) => handleInputChange('morosidad', 'residente_id', e.target.value ? parseInt(e.target.value) : null)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.morosidad.residente_id ? 'border-red-500' : 'border-gray-300'}`}
                                    disabled={cargandoResidentes}
                                >
                                    <option value="">Seleccionar residente</option>
                                    {residentes.map((residente) => (
                                        <option key={residente.id} value={residente.id}>
                                            {residente.nombre} ({residente.email})
                                        </option>
                                    ))}
                                </select>
                                {errores.morosidad.residente_id && <p className="text-red-500 text-sm mt-1">{errores.morosidad.residente_id}</p>}
                                {cargandoResidentes && <p className="text-gray-500 text-sm mt-1">Cargando residentes...</p>}
                            </div>
                        )}

                        <div className={formData.morosidad.tipo_prediccion === 'individual' ? 'md:col-span-2' : ''}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Período Predicho *
                            </label>
                            <input
                                type="text"
                                value={formData.morosidad.periodo_predicho}
                                onChange={(e) => handleInputChange('morosidad', 'periodo_predicho', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errores.morosidad.periodo_predicho ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Ej: Próximos 3 meses"
                            />
                            {errores.morosidad.periodo_predicho && <p className="text-red-500 text-sm mt-1">{errores.morosidad.periodo_predicho}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={formData.morosidad.descripcion}
                            onChange={(e) => handleInputChange('morosidad', 'descripcion', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Descripción opcional de la predicción"
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    {formData.morosidad.tipo_prediccion === 'individual'
                                        ? 'Predicción Individual'
                                        : 'Predicción General'
                                    }
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    {formData.morosidad.tipo_prediccion === 'individual'
                                        ? 'La IA analizará los datos específicos del residente seleccionado para generar una predicción personalizada de riesgo de morosidad.'
                                        : 'La IA analizará automáticamente los datos de todos los residentes, historial de pagos, y otros factores para generar predicciones de morosidad usando Grok 4 Fast Free.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </>,
                'Generar Predicción con IA'
            )}

            {renderResultSection('Resultado de la Predicción de Morosidad', 'morosidad', resultados.morosidad)}
        </div>
    );

    if (user?.role !== 'admin') {
        return (
            <Layout title="Analytics y Reportes" description="Acceso denegado">
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Acceso Denegado</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Esta sección está destinada únicamente para administradores del condominio.
                    </p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            title="Analytics y Reportes"
            description="Panel completo de analytics y generación de reportes"
        >
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Analytics y Reportes
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Genera reportes financieros, de seguridad, uso de áreas y predicciones de morosidad con IA
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-6">
                    <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                            { id: 'financieros', label: 'Reportes Financieros', icon: '💰' },
                            { id: 'seguridad', label: 'Reportes Seguridad', icon: '🔒' },
                            { id: 'areas', label: 'Uso de Áreas', icon: '🏊' },
                            { id: 'morosidad', label: 'Predicciones IA', icon: '🤖' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'financieros' && renderReportesFinancieros()}
                {activeTab === 'seguridad' && renderReportesSeguridad()}
                {activeTab === 'areas' && renderReportesUsoAreas()}
                {activeTab === 'morosidad' && renderPrediccionesMorosidad()}
            </div>
        </Layout>
    );
};

export default AnalyticsModule;