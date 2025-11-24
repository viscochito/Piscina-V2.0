import React from 'react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { TipoTrabajo, TipoPileta } from '@/models/types';

const tiposTrabajo = [
  { value: 'construccion', label: 'Construcción' },
  { value: 'reparacion', label: 'Reparación' },
  { value: 'revestimiento', label: 'Revestimiento' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'otro', label: 'Otro' },
];

const tiposPileta = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'oval', label: 'Oval' },
  { value: 'circular', label: 'Circular' },
  { value: 'irregular', label: 'Irregular' },
  { value: 'otra', label: 'Otra' },
];

interface Paso2TipoTrabajoProps {
  tipoTrabajo: TipoTrabajo;
  tipoPileta?: TipoPileta;
  onNext: (tipo: TipoTrabajo, tipoPileta: TipoPileta) => void;
}

export const Paso2TipoTrabajo: React.FC<Paso2TipoTrabajoProps> = ({
  tipoTrabajo,
  tipoPileta,
  onNext,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const tipo = formData.get('tipo') as TipoTrabajo;
    const tipoPiletaSeleccionado = (formData.get('tipoPileta') as TipoPileta) || 'rectangular';
    onNext(tipo, tipoPiletaSeleccionado);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Tipo de trabajo"
        name="tipo"
        options={tiposTrabajo}
        defaultValue={tipoTrabajo}
        required
      />
      
      <Select
        label="Tipo de pileta"
        name="tipoPileta"
        options={tiposPileta}
        defaultValue={tipoPileta || 'rectangular'}
        required
      />

      <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 rounded-lg">
        <p className="text-xs md:text-sm text-blue-800">
          <strong>Tipos de trabajo:</strong>
        </p>
        <ul className="text-xs md:text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
          <li><strong>Construcción:</strong> Pileta nueva desde cero</li>
          <li><strong>Reparación:</strong> Arreglo de pileta existente</li>
          <li><strong>Revestimiento:</strong> Cambio de revestimiento</li>
          <li><strong>Limpieza:</strong> Limpieza profunda y mantenimiento</li>
        </ul>
      </div>
      <Button type="submit" fullWidth>
        Continuar
      </Button>
    </form>
  );
};


