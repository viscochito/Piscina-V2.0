/**
 * Hook personalizado para cálculos de presupuesto
 * Encapsula la lógica de cálculo y proporciona resultados reactivos
 */

import { useMemo } from 'react';
import { calcularPresupuesto } from '@/utils/calculations';
import type { Presupuesto, CalculoResultado } from '@/models/types';

export function useCalculadora(presupuesto: Presupuesto): CalculoResultado {
  const resultado = useMemo(() => {
    try {
      return calcularPresupuesto(presupuesto);
    } catch (error) {
      console.error('Error en cálculo:', error);
      // Retornar valores por defecto en caso de error
      return {
        volumen: 0,
        superficiePiso: 0,
        superficieParedes: 0,
        superficieTotal: 0,
        superficieACotizar: 0,
        horasCalculadas: 0,
        subtotalMateriales: 0,
        subtotalManoObra: 0,
        subtotalCostosAdicionales: 0,
        subtotal: 0,
        margen: presupuesto.margen || 0.20,
        totalMargen: 0,
        totalIva: 0,
        total: 0,
      };
    }
  }, [
    presupuesto.dimensiones,
    presupuesto.materiales,
    presupuesto.manoObra,
    presupuesto.factorDesperdicio,
    presupuesto.margen,
    presupuesto.iva,
  ]);

  return resultado;
}

