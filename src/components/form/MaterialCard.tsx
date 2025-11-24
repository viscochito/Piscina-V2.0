import React from 'react';
import { NumberSelector } from '../ui/NumberSelector';
import type { MaterialItem } from '@/models/types';

interface MaterialCardProps {
  material: MaterialItem;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<MaterialItem>) => void;
  superficieACotizar: number;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onToggle,
  onUpdate,
  superficieACotizar,
}) => {
  const precioTotal = material.activo
    ? material.tipo === 'm2'
      ? (material.precioPorM2 || 0) * superficieACotizar
      : (material.precioPorUnidad || 0) * (material.cantidad || 1)
    : 0;

  return (
    <div className="border rounded-lg p-3 md:p-4 mb-3 md:mb-4 bg-white">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 mt-0.5">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={material.activo}
              onChange={() => onToggle(material.id)}
              className="
                w-5 h-5 md:w-6 md:h-6
                rounded border-2 border-gray-300
                appearance-none
                cursor-pointer
                transition-all
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                checked:bg-primary-600 checked:border-primary-600
                hover:border-primary-400
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />
            {material.activo && (
              <svg
                className="absolute left-0.5 top-0.5 w-4 h-4 md:w-5 md:h-5 text-white pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </label>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm md:text-base text-gray-800 break-words">{material.nombre}</h3>
          {material.calidad && (
            <span className="text-xs text-gray-500 capitalize block mt-1">
              Calidad: {material.calidad}
            </span>
          )}
        </div>
      </div>

      {material.activo && (
        <div className="space-y-3 mt-4 pt-4 border-t">
          {material.tipo === 'm2' ? (
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Precio por m²: ${material.precioPorM2?.toLocaleString('es-AR') || 0}
              </p>
              <p className="text-sm text-gray-600">
                Superficie a cotizar: {superficieACotizar.toFixed(2)} m²
              </p>
            </div>
          ) : (
            <NumberSelector
              label="Cantidad"
              value={material.cantidad || 1}
              onChange={(newValue) =>
                onUpdate(material.id, { cantidad: Math.max(1, Math.floor(newValue)) })
              }
              min={1}
              step={1}
            />
          )}
          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-gray-700">
              Subtotal: ${precioTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};


