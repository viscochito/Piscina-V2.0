import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import type { Cliente } from '@/models/types';

// Valores por defecto hardcodeados para el cliente
const CLIENTE_DEFAULT: Cliente = {
  nombre: 'Cliente Demo',
  telefono: '+5491112345678',
  email: 'cliente@example.com',
  direccion: 'Dirección a completar',
  cuit: '',
  localidad: '',
  provincia: '',
  condicionIva: 'Consumidor Final',
};

// Schema dinámico que se ajusta según si se omiten los datos
const crearSchema = (omitirDatos: boolean) => {
  if (omitirDatos) {
    return z.object({
      nombre: z.string().optional(),
      telefono: z.string().optional(),
      email: z.string().optional(),
      direccion: z.string().optional(),
      cuit: z.string().optional(),
      localidad: z.string().optional(),
      provincia: z.string().optional(),
      condicionIva: z.string().optional(),
    });
  }
  
  return z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    telefono: z.string().min(8, 'El teléfono debe tener al menos 8 caracteres'),
    email: z.string().email('Email inválido'),
    direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
    cuit: z.string().optional(),
    localidad: z.string().optional(),
    provincia: z.string().optional(),
    condicionIva: z.string().optional(),
  });
};

interface Paso1DatosClienteProps {
  cliente: Cliente;
  onNext: (data: Cliente) => void;
}

export const Paso1DatosCliente: React.FC<Paso1DatosClienteProps> = ({
  cliente,
  onNext,
}) => {
  const [omitirDatos, setOmitirDatos] = useState(
    !cliente.nombre || cliente.nombre === CLIENTE_DEFAULT.nombre
  );

  // Valores por defecto: usar los del cliente si existen, sino los hardcodeados
  const valoresIniciales = cliente.nombre && cliente.nombre !== CLIENTE_DEFAULT.nombre
    ? cliente
    : { ...CLIENTE_DEFAULT, ...cliente };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Cliente>({
    resolver: zodResolver(crearSchema(omitirDatos)),
    defaultValues: valoresIniciales,
  });

  const onSubmit = (data: Cliente) => {
    // Si se omiten los datos, usar valores por defecto
    const datosFinales = omitirDatos ? CLIENTE_DEFAULT : data;
    onNext(datosFinales);
  };

  return (
    <form key={omitirDatos ? 'omitir' : 'completar'} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="mb-4 p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Toggle
          label="Omitir datos del cliente por ahora"
          checked={omitirDatos}
          onChange={setOmitirDatos}
          description="Los datos del cliente se completarán cuando el presupuesto sea aprobado. Por ahora se usarán valores por defecto."
        />
      </div>

      {!omitirDatos && (
        <>
          <Input
            label="Razón Social / Nombre completo"
            {...register('nombre')}
            error={errors.nombre?.message}
            placeholder="Juan Pérez"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="CUIT (opcional)"
              {...register('cuit')}
              error={errors.cuit?.message}
              placeholder="20-12345678-9"
            />
            <Input
              label="Condición IVA (opcional)"
              {...register('condicionIva')}
              error={errors.condicionIva?.message}
              placeholder="Consumidor Final"
            />
          </div>
          <Input
            label="Domicilio"
            {...register('direccion')}
            error={errors.direccion?.message}
            placeholder="Calle 123"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Localidad (opcional)"
              {...register('localidad')}
              error={errors.localidad?.message}
              placeholder="Villa Crespo"
            />
            <Input
              label="Provincia (opcional)"
              {...register('provincia')}
              error={errors.provincia?.message}
              placeholder="CABA"
            />
          </div>
          <Input
            label="Teléfono"
            type="tel"
            {...register('telefono')}
            error={errors.telefono?.message}
            placeholder="+5491112345678"
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="juan@example.com"
          />
        </>
      )}

      {omitirDatos && (
        <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs md:text-sm text-gray-700 mb-2">
            <strong>Datos que se usarán por defecto:</strong>
          </p>
          <ul className="text-xs md:text-sm text-gray-600 space-y-1">
            <li>• Nombre: {CLIENTE_DEFAULT.nombre}</li>
            <li>• Teléfono: {CLIENTE_DEFAULT.telefono}</li>
            <li>• Email: {CLIENTE_DEFAULT.email}</li>
            <li>• Dirección: {CLIENTE_DEFAULT.direccion}</li>
          </ul>
          <p className="text-xs text-gray-500 mt-3 italic">
            Estos datos se actualizarán cuando el cliente apruebe el presupuesto.
          </p>
        </div>
      )}

      <Button type="submit" fullWidth>
        Continuar
      </Button>
    </form>
  );
};

