import React from 'react';
import { Select } from '../ui/Select';
import type { MaterialItem } from '@/models/types';

interface MaterialCardProps {
  material: MaterialItem;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<MaterialItem>) => void;
  superficieACotizar: number;
  onCalidadChange?: (calidad: 'estandar' | 'premium' | 'lujo') => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onToggle,
  onUpdate,
  superficieACotizar,
  onCalidadChange,
}) => {
  const precioTotal = material.activo
    ? material.tipo === 'm2'
      ? (material.precioPorM2 || 0) * superficieACotizar
      : (material.precioPorUnidad || 0) * (material.cantidad || 1)
    : 0;

  return (
    <div className="w-full border rounded-lg p-3 mb-3 bg-white shadow-sm">
      {/* fila principal: checkbox | contenido */}
      <div className="flex items-start gap-3 w-full">
        {/* checkbox: hit area grande para touch */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => onToggle(material.id)}
            aria-pressed={material.activo}
            className={`flex items-center justify-center rounded-md
              ${material.activo ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}
              min-w-[44px] min-h-[44px] p-2 focus:outline-none focus:ring-2 focus:ring-primary-400`}
          >
            {material.activo ? (
              // icono check
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              // vacio para mantener tamaño (podés usar un svg de caja)
              <svg className="w-4 h-4 opacity-0" viewBox="0 0 24 24" />
            )}
          </button>
        </div>

        {/* contenido principal: título, subtotal, controls */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="font-semibold text-base text-gray-800 break-words">
              {material.nombre}
            </h3>

            {/* Si es tipo unidad y activo: control de cantidad (responsive) */}
            {material.activo && material.tipo === 'unidad' && (
              <div className="flex-shrink-0">
                <div className="flex items-center border rounded-lg overflow-hidden bg-white border-gray-300">
                  {/* Decrementar */}
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate(material.id, { cantidad: Math.max(1, Math.floor((material.cantidad || 1) - 1)) })
                    }
                    disabled={(material.cantidad || 1) <= 1}
                    aria-label="Decrementar"
                    className={`flex items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 font-semibold
                      ${ (material.cantidad || 1) <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50' }`}
                  >
                    −
                  </button>

                  {/* valor central: flexible para que ocupe todo el espacio posible */}
                  <div className="flex-1 min-w-[56px] px-3 py-2 border-l border-r border-gray-300 text-center">
                    <span className="text-sm font-medium text-gray-900">
                      {material.cantidad || 1}
                    </span>
                  </div>

                  {/* Incrementar */}
                  <button
                    type="button"
                    onClick={() => onUpdate(material.id, { cantidad: Math.floor((material.cantidad || 1) + 1) })}
                    aria-label="Incrementar"
                    className="flex items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 font-semibold bg-white text-gray-700 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* calidad (solo si aplica y no es cerámico o según lógica) */}
          {material.calidad && material.id !== 'ceramico' && (
            <span className="text-xs text-gray-500 capitalize block">
              Calidad: {material.calidad}
            </span>
          )}

          {/* subtotal visible cuando está activo */}
          {material.activo && precioTotal > 0 && (
            <span className="text-xs text-gray-500 block">
              Subtotal: ${precioTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>

      {/* Contenido expandido / detalle (aparecen solo si está activo) */}
      {material.activo && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          {/* Selector de Calidad para cerámicos */}
          {material.id === 'ceramico' && onCalidadChange && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Calidad de los cerámicos</h4>
              <Select
                label=""
                value={material.calidad || 'estandar'}
                onChange={(e) => onCalidadChange(e.target.value as 'estandar' | 'premium' | 'lujo')}
                options={[
                  { value: 'estandar', label: '1. Estándar ($50/m²)' },
                  { value: 'premium', label: '2. Premium ($75/m²)' },
                  { value: 'lujo', label: '3. Lujo ($120/m²)' },
                ]}
                className="w-full"
              />
            </div>
          )}

          {/* info para m2 */}
          {material.tipo === 'm2' && (
            <div className="text-sm text-gray-600 space-y-1">
              <p>Precio por m²: ${material.precioPorM2?.toLocaleString('es-AR') || 0}</p>
              <p>Superficie a cotizar: {superficieACotizar.toFixed(2)} m²</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
