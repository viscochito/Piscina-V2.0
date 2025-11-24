import React from 'react';
import { MaterialCard } from '@/components/form/MaterialCard';
import { Button } from '@/components/ui/Button';
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

export const Paso4Materiales: React.FC<Paso4MaterialesProps> = ({
  materiales,
  superficieACotizar,
  onUpdate,
  onNext,
}) => {
  const materialesMostrar = materiales.length > 0 ? materiales : materialesBase;

  // Separar cerámicos del resto de materiales
  const ceramicos = materialesMostrar.filter(m => m.id.startsWith('ceramico-'));
  const otrosMateriales = materialesMostrar.filter(m => !m.id.startsWith('ceramico-'));

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

  return (
    <div className="space-y-4">
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

      <Button onClick={onNext} fullWidth size="md">
        Continuar
      </Button>
    </div>
  );
};


