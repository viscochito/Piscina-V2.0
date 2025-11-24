import React, { useState } from 'react';
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
    id: 'ceramico',
    nombre: 'Cerámicos',
    tipo: 'm2',
    precioPorM2: 50,
    calidad: 'estandar',
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

  // Función para limpiar y migrar materiales antiguos
  const limpiarMaterialesAntiguos = (materiales: MaterialItem[]): MaterialItem[] => {
    // Filtrar cerámicos antiguos (economica, estandar, premium, lujo individuales)
    const ceramicosAntiguos = ['ceramico-economica', 'ceramico-estandar', 'ceramico-premium', 'ceramico-lujo'];
    const materialesLimpios = materiales.filter(m => !ceramicosAntiguos.includes(m.id));
    
    // Verificar si ya existe el cerámico genérico
    const tieneCeramicoGenerico = materialesLimpios.some(m => m.id === 'ceramico');
    
    // Si no existe el cerámico genérico pero había cerámicos antiguos activos, crear uno
    if (!tieneCeramicoGenerico) {
      const ceramicosAntiguosActivos = materiales.filter(m => ceramicosAntiguos.includes(m.id) && m.activo);
      if (ceramicosAntiguosActivos.length > 0) {
        // Usar la calidad del primer cerámico activo encontrado
        const calidad = ceramicosAntiguosActivos[0]?.calidad || 'estandar';
        let precioPorM2 = 50;
        if (calidad === 'premium') precioPorM2 = 75;
        if (calidad === 'lujo') precioPorM2 = 120;
        
        materialesLimpios.push({
          id: 'ceramico',
          nombre: 'Cerámicos',
          tipo: 'm2',
          precioPorM2,
          calidad: calidad === 'economica' ? 'estandar' : calidad,
          activo: true,
        });
      }
    }
    
    return materialesLimpios;
  };

  // Limpiar materiales antiguos y combinar con base
  let materialesMostrar: MaterialItem[];
  if (materiales.length > 0) {
    const materialesLimpios = limpiarMaterialesAntiguos(materiales);
    // Combinar con materiales base, evitando duplicados
    const idsExistentes = new Set(materialesLimpios.map(m => m.id));
    const materialesBaseSinDuplicados = materialesBase.filter(m => !idsExistentes.has(m.id));
    materialesMostrar = [...materialesLimpios, ...materialesBaseSinDuplicados];
    
    // Si se limpiaron materiales, actualizar el estado
    if (materialesLimpios.length !== materiales.length) {
      onUpdateMateriales(materialesMostrar);
    }
  } else {
    materialesMostrar = materialesBase;
  }

  // Separar cerámicos del resto de materiales
  const ceramicos = materialesMostrar.filter(m => m.id === 'ceramico' || m.id.startsWith('ceramico-'));
  const otrosMateriales = materialesMostrar.filter(m => m.id !== 'ceramico' && !m.id.startsWith('ceramico-'));

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
    // Aplicar la calidad seleccionada al cerámico activo
    const nuevos = materialesMostrar.map((m) => {
      if ((m.id === 'ceramico' || m.id.startsWith('ceramico-')) && m.activo) {
        // Actualizar calidad y precio según la selección
        let precioPorM2 = 50; // Estándar por defecto
        if (calidad === 'premium') precioPorM2 = 75;
        if (calidad === 'lujo') precioPorM2 = 120;
        
        return { ...m, calidad, precioPorM2 };
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

        <NumberSelector
          label="Largo (m)"
          value={largo}
          onChange={setLargo}
          min={0}
          step={0.1}
          allowDecimals={true}
          error={errors.largo}
        />
        
        <NumberSelector
          label="Ancho (m)"
          value={ancho}
          onChange={setAncho}
          min={0}
          step={0.1}
          allowDecimals={true}
          error={errors.ancho}
        />
        
        <NumberSelector
          label="Profundidad promedio (m)"
          value={profundidadPromedio}
          onChange={setProfundidadPromedio}
          min={0}
          step={0.1}
          allowDecimals={true}
          error={errors.profundidadPromedio}
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

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Grupo de Cerámicos */}
          {ceramicos.length > 0 && (
            <div className="space-y-3">
              {ceramicos.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onToggle={handleToggle}
                  onUpdate={handleUpdate}
                  superficieACotizar={superficieACotizar}
                  onCalidadChange={material.id === 'ceramico' ? handleCalidadChange : undefined}
                />
              ))}
            </div>
          )}

          {/* Otros materiales */}
          {otrosMateriales.length > 0 && (
            <div className="space-y-3">
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

