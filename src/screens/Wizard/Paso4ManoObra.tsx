import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import type { ManoObra } from '@/models/types';

const schema = z.object({
  horas: z.number().optional().nullable(),
  calcularAutomatico: z.boolean().default(true),
  tarifaPorHora: z.number({ 
    required_error: 'La tarifa por hora es requerida',
    invalid_type_error: 'La tarifa debe ser un número'
  }).min(1, 'La tarifa debe ser mayor a 0'),
  dificultadAcceso: z.enum(['normal', 'media', 'alta']).default('normal'),
  requierePermisos: z.boolean().default(false),
  m2PorHora: z.number().optional().nullable(),
});

interface Paso4ManoObraProps {
  manoObra: ManoObra;
  superficieTotal: number;
  onNext: (manoObra: ManoObra) => void;
}

export const Paso4ManoObra: React.FC<Paso4ManoObraProps> = ({
  manoObra,
  superficieTotal,
  onNext,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ManoObra>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...manoObra,
      tarifaPorHora: manoObra.tarifaPorHora || 2000,
      calcularAutomatico: manoObra.calcularAutomatico ?? true,
      dificultadAcceso: manoObra.dificultadAcceso || 'normal',
      requierePermisos: manoObra.requierePermisos ?? false,
      m2PorHora: manoObra.m2PorHora || 2.5,
    },
  });

  const calcularAutomatico = watch('calcularAutomatico');

  const onSubmit = (data: ManoObra) => {
    console.log('Datos del formulario:', data);
    onNext(data);
  };

  const onError = (errors: any) => {
    console.error('Errores de validación:', errors);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
      <Toggle
        label="Calcular horas automáticamente"
        checked={calcularAutomatico}
        onChange={(checked: boolean) => setValue('calcularAutomatico', checked)}
        description="Basado en la superficie total y productividad estándar"
      />

      {calcularAutomatico && (
        <Input
          label="Productividad (m² por hora)"
          type="number"
          step="0.1"
          min="0.5"
          inputMode="decimal"
          {...register('m2PorHora', { valueAsNumber: true })}
          error={errors.m2PorHora?.message}
          helperText={`Superficie total: ${superficieTotal.toFixed(2)} m². Valor por defecto: 2.5 m²/hora`}
          defaultValue={2.5}
        />
      )}

      {!calcularAutomatico && (
        <Input
          label="Horas estimadas"
          type="number"
          min="1"
          inputMode="numeric"
          {...register('horas', { valueAsNumber: true })}
          error={errors.horas?.message}
          helperText="Ingresa las horas estimadas de trabajo"
        />
      )}

      <Input
        label="Tarifa por hora ($)"
        type="number"
        min="1"
        inputMode="numeric"
        {...register('tarifaPorHora', { 
          valueAsNumber: true,
          required: 'La tarifa por hora es requerida',
          min: { value: 1, message: 'La tarifa debe ser mayor a 0' }
        })}
        error={errors.tarifaPorHora?.message}
        placeholder="2000"
      />

      <Select
        label="Dificultad de acceso"
        options={[
          { value: 'normal', label: 'Normal' },
          { value: 'media', label: 'Media (+15%)' },
          { value: 'alta', label: 'Alta (+30%)' },
        ]}
        {...register('dificultadAcceso')}
        error={errors.dificultadAcceso?.message}
      />

      <Toggle
        label="Requiere permisos especiales"
        checked={watch('requierePermisos')}
        onChange={(checked: boolean) => setValue('requierePermisos', checked)}
        description="Si el trabajo requiere permisos municipales o especiales"
      />

      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-800 mb-1">Por favor, corrige los siguientes errores:</p>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.tarifaPorHora && <li>• {errors.tarifaPorHora.message}</li>}
            {errors.dificultadAcceso && <li>• {errors.dificultadAcceso.message}</li>}
            {errors.horas && <li>• {errors.horas.message}</li>}
            {errors.m2PorHora && <li>• {errors.m2PorHora.message}</li>}
          </ul>
        </div>
      )}

      <Button type="submit" fullWidth>
        Continuar
      </Button>
    </form>
  );
};

