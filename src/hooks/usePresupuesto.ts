/**
 * Hook para gestionar el estado del presupuesto
 * Maneja el wizard, validaciones y persistencia
 */

import { useState, useCallback } from 'react';
import { useCalculadora } from './useCalculadora';
import type { Presupuesto, Cliente, TipoTrabajo, TipoPileta, Dimensiones, MaterialItem, ManoObra } from '@/models/types';

const PRESUPUESTO_STORAGE_KEY = 'presupuesto_draft';

export function usePresupuesto() {
  const [presupuesto, setPresupuesto] = useState<Presupuesto>(() => {
    // Cargar draft desde localStorage si existe
    const saved = localStorage.getItem(PRESUPUESTO_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return crearPresupuestoVacio();
      }
    }
    return crearPresupuestoVacio();
  });

  const calculos = useCalculadora(presupuesto);

  // Actualizar presupuesto y guardar en localStorage
  const actualizarPresupuesto = useCallback((updates: Partial<Presupuesto>) => {
    setPresupuesto((prev: Presupuesto) => {
      const nuevo = { ...prev, ...updates };
      localStorage.setItem(PRESUPUESTO_STORAGE_KEY, JSON.stringify(nuevo));
      return nuevo;
    });
  }, []);

  const actualizarCliente = useCallback((cliente: Partial<Cliente>) => {
    actualizarPresupuesto({
      cliente: { ...presupuesto.cliente, ...cliente },
    });
  }, [presupuesto.cliente, actualizarPresupuesto]);

  const actualizarTipoTrabajo = useCallback((tipo: TipoTrabajo, tipoPileta?: TipoPileta) => {
    actualizarPresupuesto({ 
      tipoTrabajo: tipo,
      tipoPileta: tipoPileta || 'rectangular'
    });
  }, [actualizarPresupuesto]);

  const actualizarDimensiones = useCallback((dimensiones: Partial<Dimensiones>) => {
    actualizarPresupuesto({
      dimensiones: { ...presupuesto.dimensiones, ...dimensiones },
    });
  }, [presupuesto.dimensiones, actualizarPresupuesto]);

  const actualizarMateriales = useCallback((materiales: MaterialItem[]) => {
    actualizarPresupuesto({ materiales });
  }, [actualizarPresupuesto]);

  const toggleMaterial = useCallback((materialId: string) => {
    const nuevosMateriales = presupuesto.materiales.map((m: MaterialItem) =>
      m.id === materialId ? { ...m, activo: !m.activo } : m
    );
    actualizarMateriales(nuevosMateriales);
  }, [presupuesto.materiales, actualizarMateriales]);

  const actualizarManoObra = useCallback((manoObra: Partial<ManoObra>) => {
    actualizarPresupuesto({
      manoObra: { ...presupuesto.manoObra, ...manoObra },
    });
  }, [presupuesto.manoObra, actualizarPresupuesto]);

  const resetearPresupuesto = useCallback(() => {
    const nuevo = crearPresupuestoVacio();
    setPresupuesto(nuevo);
    localStorage.removeItem(PRESUPUESTO_STORAGE_KEY);
  }, []);

  const limpiarDraft = useCallback(() => {
    localStorage.removeItem(PRESUPUESTO_STORAGE_KEY);
  }, []);

  return {
    presupuesto,
    calculos,
    actualizarPresupuesto,
    actualizarCliente,
    actualizarTipoTrabajo,
    actualizarDimensiones,
    actualizarMateriales,
    toggleMaterial,
    actualizarManoObra,
    resetearPresupuesto,
    limpiarDraft,
  };
}

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

function crearPresupuestoVacio(): Presupuesto {
  return {
    cliente: CLIENTE_DEFAULT,
    tipoTrabajo: 'construccion',
    tipoPileta: 'rectangular',
    dimensiones: {
      largo: 0,
      ancho: 0,
      profundidadPromedio: 0,
    },
    materiales: [],
    manoObra: {
      calcularAutomatico: true,
      tarifaPorHora: 2000,
      dificultadAcceso: 'normal',
      requierePermisos: false,
      m2PorHora: 2.5,
    },
    factorDesperdicio: 0.10,
    margen: 0.20,
    iva: 0.21,
  };
}

