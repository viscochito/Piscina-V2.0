import React, { useState } from 'react';
import { Select } from '../ui/Select';
import type { MaterialItem } from '@/models/types';

interface MaterialCardCollapsableProps {
  material: MaterialItem;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<MaterialItem>) => void;
  superficieACotizar: number;
  onCalidadChange?: (calidad: 'estandar' | 'premium' | 'lujo') => void;
}

/**
 * MaterialCardCollapsable - versión mobile-first, minimalista y accesible.
 * - Checkbox como botón con hit area >=44px
 * - Quantity control: botones con min-w/min-h 44px y centro flexible (flex-1)
 * - Acordeón suave: max-h cambia con transición (max-h-[60vh])
 * - Evita anchos fijos; usa w-full y flex
 *
 * Referencia visual: file:///mnt/data/884b8a62-5644-4f33-990a-d3c3845b8231.png
 */
export const MaterialCardCollapsable: React.FC<MaterialCardCollapsableProps> = ({
  material,
  onToggle,
  onUpdate,
  superficieACotizar,
  onCalidadChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const precioTotal = material.activo
    ? material.tipo === 'm2'
      ? (material.precioPorM2 || 0) * superficieACotizar
      : (material.precioPorUnidad || 0) * (material.cantidad || 1)
    : 0;

  const handleCardClick = () => {
    if (!material.activo) {
      onToggle(material.id);
      // when enabling, keep collapsed by default to avoid big jumps
      setIsExpanded(false);
    } else {
      setIsExpanded((s) => !s);
    }
  };

  const handleToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onToggle(material.id);
    // if we're toggling off, collapse details
    if (material.activo) setIsExpanded(false);
  };

  return (
    <div
      className={`w-full border rounded-lg p-4 mb-3 bg-white transition-all duration-200
        ${material.activo ? 'border-primary-400 bg-primary-50/40 shadow-sm' : 'border-gray-200 shadow-sm'}
      `}
    >
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        className="flex items-center gap-3 w-full"
        aria-expanded={material.activo ? isExpanded : false}
      >
        {/* Checkbox button with big hit area */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={handleToggle}
            aria-pressed={!!material.activo}
            aria-label={`${material.activo ? 'Deseleccionar' : 'Seleccionar'} ${material.nombre}`}
            className={`flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400
              ${material.activo ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}
              min-w-[44px] min-h-[44px] p-2`}
          >
            {material.activo ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              // placeholder to keep visual balance
              <svg className="w-4 h-4 opacity-0" viewBox="0 0 24 24" />
            )}
          </button>
        </div>

        {/* Main content: title + subtotal */}
        <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 break-words leading-tight">
              {material.nombre}
            </h3>

            {material.activo && precioTotal > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                Subtotal:&nbsp;
                <span className="font-semibold text-gray-900">
                  ${precioTotal.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </span>
              </p>
            )}
          </div>

          {/* Controls area (quantity or expand button) */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Quantity control for 'unidad' */}
            {material.activo && material.tipo === 'unidad' && (
              <div className="flex items-center border rounded-lg overflow-hidden bg-white border-gray-300">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(material.id, { cantidad: Math.max(1, Math.floor((material.cantidad || 1) - 1)) });
                  }}
                  disabled={(material.cantidad || 1) <= 1}
                  aria-label="Decrementar cantidad"
                  className={`flex items-center justify-center min-w-[44px] min-h-[44px] px-3 font-semibold
                    ${((material.cantidad || 1) <= 1) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  −
                </button>

                <div className="flex-1 min-w-[56px] px-3 py-2 text-center border-l border-r border-gray-300">
                  <span className="text-sm font-medium text-gray-900">{material.cantidad || 1}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(material.id, { cantidad: Math.floor((material.cantidad || 1) + 1) });
                  }}
                  aria-label="Incrementar cantidad"
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] px-3 font-semibold bg-white text-gray-700 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            )}

            {/* Expand button for m2 or ceramico */}
            {material.activo && (material.tipo === 'm2' || material.id === 'ceramico') && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded((s) => !s);
                }}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Colapsar detalles' : 'Expandir detalles'}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 p-2"
              >
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible panel */}
      {material.activo && (
        <div
          className={`overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out
            ${isExpanded ? 'max-h-[60vh] opacity-100 mt-3 pt-3 border-t border-gray-100' : 'max-h-0 opacity-0'}`
          }
          aria-hidden={!isExpanded}
        >
          <div className="space-y-3">
            {/* Calidad selector (cerámico) */}
            {material.id === 'ceramico' && onCalidadChange && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calidad de los cerámicos</label>
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

            {/* Info para m2 */}
            {material.tipo === 'm2' && (
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Precio por m²:</span> ${material.precioPorM2?.toLocaleString('es-AR') || 0}
                </p>
                <p>
                  <span className="font-medium">Superficie a cotizar:</span> {superficieACotizar.toFixed(2)} m²
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
