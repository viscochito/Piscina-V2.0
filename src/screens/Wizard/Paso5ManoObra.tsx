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
  horas: z.number().optional(),
  calcularAutomatico: z.boolean(),
  tarifaPorHora: z.number().min(1, 'La tarifa debe ser mayor a 0'),
  dificultadAcceso: z.enum(['normal', 'media', 'alta']),
  requierePermisos: z.boolean(),
  m2PorHora: z.number().optional(),
});

interface Paso5ManoObraProps {
  manoObra: ManoObra;
  superficieTotal: number;
  onNext: (manoObra: ManoObra) => void;
}

export const Paso5ManoObra: React.FC<Paso5ManoObraProps> = ({
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
    defaultValues: manoObra,
  });

  const calcularAutomatico = watch('calcularAutomatico');

  const onSubmit = (data: ManoObra) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        {...register('tarifaPorHora', { valueAsNumber: true })}
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

      <Button type="submit" fullWidth>
        Continuar
      </Button>
    </form>
  );
};

