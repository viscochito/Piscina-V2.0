import React, { useState, useEffect } from 'react';
import { NumberSelector } from '@/components/ui/NumberSelector';
import { MaterialCard } from '@/components/form/MaterialCard';
import { Button } from '@/components/ui/Button';
import type { Dimensiones, MaterialItem } from '@/models/types';

interface Paso3DimensionesYMaterialesProps {
  dimensiones: Dimensiones;
  materiales: MaterialItem[];
  superficieACotizar: number;
  onNext: (dimensiones: Dimensiones, materiales: MaterialItem[]) => void;
  onUpdateMateriales: (materiales: MaterialItem[]) => void;
}

// Materiales predefinidos
const materialesBase: MaterialItem[] = [
  {
    id: 'ceramico-economica',
    nombre: 'Cerámico - Calidad Económica',
    tipo: 'm2',
    precioPorM2: 35,
    calidad: 'economica',
    activo: false,
  },
  {
    id: 'ceramico-estandar',
    nombre: 'Cerámico - Calidad Estándar',
    tipo: 'm2',
    precioPorM2: 50,
    calidad: 'estandar',
    activo: false,
  },
  {
    id: 'ceramico-premium',
    nombre: 'Cerámico - Calidad Premium',
    tipo: 'm2',
    precioPorM2: 75,
    calidad: 'premium',
    activo: false,
  },
  {
    id: 'bomba',
    nombre: 'Bomba de agua',
    tipo: 'unidad',
    precioPorUnidad: 15000,
    cantidad: 1,
    activo: false,
  },
  {
    id: 'filtro',
    nombre: 'Filtro',
    tipo: 'unidad',
    precioPorUnidad: 12000,
    cantidad: 1,
    activo: false,
  },
  {
    id: 'iluminacion',
    nombre: 'Iluminación LED',
    tipo: 'unidad',
    precioPorUnidad: 8000,
    cantidad: 1,
    activo: false,
  },
  {
    id: 'calefaccion',
    nombre: 'Sistema de calefacción',
    tipo: 'unidad',
    precioPorUnidad: 25000,
    cantidad: 1,
    activo: false,
  },
  {
    id: 'escalera',
    nombre: 'Escalera',
    tipo: 'unidad',
    precioPorUnidad: 5000,
    cantidad: 1,
    activo: false,
  },
  {
    id: 'cubierta',
    nombre: 'Cubierta de seguridad',
    tipo: 'unidad',
    precioPorUnidad: 30000,
    cantidad: 1,
    activo: false,
  },
];

export const Paso3DimensionesYMateriales: React.FC<Paso3DimensionesYMaterialesProps> = ({
  dimensiones,
  materiales,
  superficieACotizar,
  onNext,
  onUpdateMateriales,
}) => {
  const [largo, setLargo] = useState(dimensiones.largo || 0);
  const [ancho, setAncho] = useState(dimensiones.ancho || 0);
  const [profundidadPromedio, setProfundidadPromedio] = useState(dimensiones.profundidadPromedio || 0);
  
  const [errors, setErrors] = useState<{
    largo?: string;
    ancho?: string;
    profundidadPromedio?: string;
  }>({});

  const materialesMostrar = materiales.length > 0 ? materiales : materialesBase;

  // Separar cerámicos del resto de materiales
  const ceramicos = materialesMostrar.filter(m => m.id.startsWith('ceramico-'));
  const otrosMateriales = materialesMostrar.filter(m => !m.id.startsWith('ceramico-'));
  
  // Verificar si hay cerámicos activos
  const ceramicosActivos = ceramicos.filter(m => m.activo);
  const hayCeramicosActivos = ceramicosActivos.length > 0;

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (largo < 1) {
      newErrors.largo = 'El largo debe ser mayor o igual a 1';
    }
    if (ancho < 1) {
      newErrors.ancho = 'El ancho debe ser mayor o igual a 1';
    }
    if (profundidadPromedio < 0.5) {
      newErrors.profundidadPromedio = 'La profundidad debe ser al menos 0.5m';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleToggle = (id: string) => {
    const nuevos = materialesMostrar.map((m) =>
      m.id === id ? { ...m, activo: !m.activo } : m
    );
    onUpdateMateriales(nuevos);
  };

  const handleUpdate = (id: string, updates: Partial<MaterialItem>) => {
    const nuevos = materialesMostrar.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    onUpdateMateriales(nuevos);
  };

  const handleCalidadChange = (calidad: 'estandar' | 'premium' | 'lujo') => {
    // Aplicar la calidad seleccionada a todos los cerámicos activos
    const nuevos = materialesMostrar.map((m) => {
      if (m.id.startsWith('ceramico-') && m.activo) {
        return { ...m, calidad };
      }
      return m;
    });
    onUpdateMateriales(nuevos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({ largo, ancho, profundidadPromedio }, materialesMostrar);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sección de Dimensiones */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-3">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Dimensiones de la Pileta</h2>
        </div>

        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg">
          <p className="text-xs md:text-sm text-gray-700 mb-2">
            <strong>Ejemplos de dimensiones:</strong>
          </p>
          <ul className="text-xs md:text-sm text-gray-600 space-y-1">
            <li>• Pileta pequeña: 4m x 2m x 1.2m</li>
            <li>• Pileta mediana: 8m x 4m x 1.5m</li>
            <li>• Pileta grande: 12m x 6m x 1.8m</li>
          </ul>
        </div>

        <NumberSelector
          label="Largo (metros)"
          value={largo}
          onChange={setLargo}
          min={0}
          step={0.1}
          allowDecimals={true}
          error={errors.largo}
        />
        
        <NumberSelector
          label="Ancho (metros)"
          value={ancho}
          onChange={setAncho}
          min={0}
          step={0.1}
          allowDecimals={true}
          error={errors.ancho}
        />
        
        <NumberSelector
          label="Profundidad promedio (metros)"
          value={profundidadPromedio}
          onChange={setProfundidadPromedio}
          min={0}
          step={0.1}
          allowDecimals={true}
          error={errors.profundidadPromedio}
          helperText="Profundidad promedio de la pileta"
        />
      </div>

      {/* Sección de Materiales */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-3">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Materiales y Equipamiento</h2>
        </div>

        <div className="mb-4 p-3 md:p-4 bg-blue-50 rounded-lg">
          <p className="text-xs md:text-sm text-blue-800">
            Selecciona los materiales y sistemas que incluirás en el presupuesto.
            Puedes activar/desactivar cada item.
          </p>
        </div>

        <div className="space-y-4 max-h-[50vh] md:max-h-[60vh] overflow-y-auto -mx-2 px-2">
          {/* Grupo de Cerámicos */}
          {ceramicos.length > 0 && (
            <div className="space-y-3">
              <div className="sticky top-0 bg-gray-50 py-2 px-3 rounded-lg border border-gray-200 z-10">
                <h3 className="text-sm md:text-base font-semibold text-gray-700">Revestimientos Cerámicos</h3>
              </div>
              
              {/* Selector de Calidad - Solo se muestra si hay cerámicos activos */}
              {hayCeramicosActivos && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm md:text-base font-semibold text-gray-800 mb-3">
                    Calidad de los cerámicos
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCalidadChange('estandar')}
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm transition-all
                        ${ceramicosActivos[0]?.calidad === 'estandar' 
                          ? 'bg-primary-600 text-white shadow-md' 
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-400'
                        }
                      `}
                    >
                      Estándar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCalidadChange('premium')}
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm transition-all
                        ${ceramicosActivos[0]?.calidad === 'premium' 
                          ? 'bg-primary-600 text-white shadow-md' 
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-400'
                        }
                      `}
                    >
                      Premium
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCalidadChange('lujo')}
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm transition-all
                        ${ceramicosActivos[0]?.calidad === 'lujo' 
                          ? 'bg-primary-600 text-white shadow-md' 
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-400'
                        }
                      `}
                    >
                      Lujo
                    </button>
                  </div>
                </div>
              )}
              
              {ceramicos.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onToggle={handleToggle}
                  onUpdate={handleUpdate}
                  superficieACotizar={superficieACotizar}
                />
              ))}
            </div>
          )}

          {/* Otros materiales */}
          {otrosMateriales.length > 0 && (
            <div className="space-y-3">
              {ceramicos.length > 0 && (
                <div className="sticky top-0 bg-gray-50 py-2 px-3 rounded-lg border border-gray-200 z-10">
                  <h3 className="text-sm md:text-base font-semibold text-gray-700">Equipamiento y Accesorios</h3>
                </div>
              )}
              {otrosMateriales.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onToggle={handleToggle}
                  onUpdate={handleUpdate}
                  superficieACotizar={superficieACotizar}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Button type="submit" fullWidth size="md">
        Continuar
      </Button>
    </form>
  );
};

