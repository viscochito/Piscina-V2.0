import React, { useMemo } from 'react';
import { MaterialCardCollapsable } from '@/components/form/MaterialCardCollapsable';
import { StickyFooter } from '@/components/ui/StickyFooter';
import { calcularCostoMateriales } from '@/utils/calculations';
import type { MaterialItem } from '@/models/types';

interface Paso4MaterialesProps {
  materiales: MaterialItem[];
  superficieACotizar: number;
  onUpdate: (materiales: MaterialItem[]) => void;
  onNext: () => void;
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

export const Paso4Materiales: React.FC<Paso4MaterialesProps> = ({
  materiales,
  superficieACotizar,
  onUpdate,
  onNext,
}) => {
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
      onUpdate(materialesMostrar);
    }
  } else {
    materialesMostrar = materialesBase;
  }

  // Separar cerámicos del resto de materiales
  const ceramicos = materialesMostrar.filter(m => m.id === 'ceramico' || m.id.startsWith('ceramico-'));
  const otrosMateriales = materialesMostrar.filter(m => m.id !== 'ceramico' && !m.id.startsWith('ceramico-'));

  const handleToggle = (id: string) => {
    const nuevos = materialesMostrar.map((m) =>
      m.id === id ? { ...m, activo: !m.activo } : m
    );
    onUpdate(nuevos);
  };

  const handleUpdate = (id: string, updates: Partial<MaterialItem>) => {
    const nuevos = materialesMostrar.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    onUpdate(nuevos);
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
    onUpdate(nuevos);
  };

  // Calcular subtotal global de materiales activos
  const subtotalGlobal = useMemo(() => {
    const materialesActivos = materialesMostrar.filter(m => m.activo);
    return calcularCostoMateriales(materialesActivos, superficieACotizar);
  }, [materialesMostrar, superficieACotizar]);

  const materialesActivosCount = materialesMostrar.filter(m => m.activo).length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header informativo */}
      <div className="mb-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-900 leading-relaxed">
          Selecciona los materiales y sistemas que incluirás en el presupuesto.
        </p>
      </div>

      {/* Lista de materiales con scroll */}
      <div className="flex-1 overflow-y-auto pb-36" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="space-y-2">
          {/* Grupo de Cerámicos */}
          {ceramicos.length > 0 && (
            <div className="space-y-2">
              {ceramicos.map((material) => (
                <MaterialCardCollapsable
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
            <div className="space-y-2">
              {otrosMateriales.map((material) => (
                <MaterialCardCollapsable
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

      {/* Footer sticky con resumen y CTA */}
      <StickyFooter
        primaryLabel="Continuar"
        onPrimaryClick={onNext}
        summary={
          materialesActivosCount > 0
            ? {
                label: 'Subtotal materiales',
                value: `$${subtotalGlobal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
              }
            : undefined
        }
      />
    </div>
  );
};


