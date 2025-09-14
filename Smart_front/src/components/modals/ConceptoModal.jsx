import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import financesService from '../../services/financesService';

const ConceptoModal = ({ 
    isOpen, 
    onClose, 
    conceptoForm, 
    setConceptoForm, 
    handleSubmit, 
    loading, 
    editingConcepto 
}) => {
    const { isDark } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } rounded-lg border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`text-lg font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                        {editingConcepto ? 'Editar Concepto' : 'Nuevo Concepto Financiero'}
                    </h3>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Nombre *
                            </label>
                            <input
                                type="text"
                                value={conceptoForm.nombre}
                                onChange={(e) => setConceptoForm({...conceptoForm, nombre: e.target.value})}
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
                                Tipo *
                            </label>
                            <select
                                value={conceptoForm.tipo}
                                onChange={(e) => setConceptoForm({...conceptoForm, tipo: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    isDark 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                required
                            >
                                <option value="">Seleccionar tipo</option>
                                {Object.entries(financesService.TIPOS_CONCEPTO).map(([key, value]) => (
                                    <option key={key} value={value}>
                                        {financesService.getTipoConceptoDisplay(value)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Descripción
                        </label>
                        <textarea
                            value={conceptoForm.descripcion}
                            onChange={(e) => setConceptoForm({...conceptoForm, descripcion: e.target.value})}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                isDark 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Monto (Bs.) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={conceptoForm.monto}
                                onChange={(e) => setConceptoForm({...conceptoForm, monto: e.target.value})}
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
                                Fecha Inicio *
                            </label>
                            <input
                                type="date"
                                value={conceptoForm.fecha_vigencia_desde}
                                onChange={(e) => setConceptoForm({...conceptoForm, fecha_vigencia_desde: e.target.value})}
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
                                Fecha Fin <span className="text-sm text-gray-500">(Opcional - dejar vacío para vigencia indefinida)</span>
                            </label>
                            <input
                                type="date"
                                value={conceptoForm.fecha_vigencia_hasta}
                                onChange={(e) => setConceptoForm({...conceptoForm, fecha_vigencia_hasta: e.target.value})}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    isDark 
                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                        : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                placeholder="Opcional - Sin fecha de fin"
                            />
                            <p className={`text-xs mt-1 ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Si no se especifica fecha de fin, el concepto tendrá vigencia indefinida
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={conceptoForm.es_recurrente}
                                onChange={(e) => setConceptoForm({...conceptoForm, es_recurrente: e.target.checked})}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className={`ml-2 text-sm ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Es recurrente (se aplica automáticamente)
                            </span>
                        </label>
                        
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={conceptoForm.aplica_a_todos}
                                onChange={(e) => setConceptoForm({...conceptoForm, aplica_a_todos: e.target.checked})}
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className={`ml-2 text-sm ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Aplica a todos los residentes
                            </span>
                        </label>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
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
                            {loading ? 'Guardando...' : (editingConcepto ? 'Actualizar' : 'Crear')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConceptoModal;