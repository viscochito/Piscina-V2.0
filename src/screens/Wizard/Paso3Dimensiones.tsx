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
      
      <Button type="submit" fullWidth>
        Continuar
      </Button>
    </form>
  );
};


