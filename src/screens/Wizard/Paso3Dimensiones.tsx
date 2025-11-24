import React, { useState, useEffect } from 'react';
import { NumberSelector } from '@/components/ui/NumberSelector';
import { Button } from '@/components/ui/Button';
import type { Dimensiones } from '@/models/types';

interface Paso3DimensionesProps {
  dimensiones: Dimensiones;
  onNext: (dimensiones: Dimensiones) => void;
}

export const Paso3Dimensiones: React.FC<Paso3DimensionesProps> = ({
  dimensiones,
  onNext,
}) => {
  const [largo, setLargo] = useState(dimensiones.largo || 0);
  const [ancho, setAncho] = useState(dimensiones.ancho || 0);
  const [profundidadPromedio, setProfundidadPromedio] = useState(dimensiones.profundidadPromedio || 0);
  
  const [errors, setErrors] = useState<{
    largo?: string;
    ancho?: string;
    profundidadPromedio?: string;
  }>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({ largo, ancho, profundidadPromedio });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <Button type="submit" fullWidth>
        Continuar
      </Button>
    </form>
  );
};


