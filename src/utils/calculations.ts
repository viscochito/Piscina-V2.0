/**
 * Motor de cálculo para presupuestos de piletas
 * Implementa todas las fórmulas según el brief técnico
 */

import type { Dimensiones, MaterialItem, ManoObra, Presupuesto, CalculoResultado } from '@/models/types';

/**
 * Calcula el volumen de la pileta en m³
 */
export function calcularVolumen(dimensiones: Dimensiones): number {
  return dimensiones.largo * dimensiones.ancho * dimensiones.profundidadPromedio;
}

/**
 * Calcula la superficie del piso en m²
 */
export function calcularSuperficiePiso(dimensiones: Dimensiones): number {
  return dimensiones.largo * dimensiones.ancho;
}

/**
 * Calcula la superficie de las paredes en m²
 */
export function calcularSuperficieParedes(dimensiones: Dimensiones): number {
  const paredLargo1 = dimensiones.largo * dimensiones.profundidadPromedio;
  const paredLargo2 = dimensiones.largo * dimensiones.profundidadPromedio;
  const paredAncho1 = dimensiones.ancho * dimensiones.profundidadPromedio;
  const paredAncho2 = dimensiones.ancho * dimensiones.profundidadPromedio;
  
  return paredLargo1 + paredLargo2 + paredAncho1 + paredAncho2;
}

/**
 * Calcula la superficie total (piso + paredes) en m²
 */
export function calcularSuperficieTotal(dimensiones: Dimensiones): number {
  const piso = calcularSuperficiePiso(dimensiones);
  const paredes = calcularSuperficieParedes(dimensiones);
  return piso + paredes;
}

/**
 * Calcula la superficie a cotizar considerando desperdicio
 */
export function calcularSuperficieACotizar(
  superficieTotal: number,
  factorDesperdicio: number = 0.10
): number {
  return superficieTotal * (1 + factorDesperdicio);
}

/**
 * Calcula el costo total de materiales
 */
export function calcularCostoMateriales(
  materiales: MaterialItem[],
  superficieACotizar: number
): number {
  return materiales
    .filter(m => m.activo)
    .reduce((total, material) => {
      if (material.tipo === 'm2' && material.precioPorM2) {
        return total + (material.precioPorM2 * superficieACotizar);
      } else if (material.tipo === 'unidad' && material.precioPorUnidad) {
        const cantidad = material.cantidad || 1;
        return total + (material.precioPorUnidad * cantidad);
      }
      return total;
    }, 0);
}

/**
 * Calcula las horas estimadas de mano de obra
 */
export function calcularHorasManoObra(
  superficieTotal: number,
  m2PorHora: number = 2.5
): number {
  return Math.ceil(superficieTotal / m2PorHora);
}

/**
 * Calcula el costo de mano de obra
 */
export function calcularCostoManoObra(
  manoObra: ManoObra,
  superficieTotal: number
): { horas: number; costo: number } {
  let horas: number;
  
  if (manoObra.calcularAutomatico) {
    horas = calcularHorasManoObra(superficieTotal, manoObra.m2PorHora || 2.5);
  } else {
    horas = manoObra.horas || 0;
  }

  // Ajuste por dificultad de acceso
  let multiplicadorDificultad = 1;
  if (manoObra.dificultadAcceso === 'media') multiplicadorDificultad = 1.15;
  if (manoObra.dificultadAcceso === 'alta') multiplicadorDificultad = 1.30;

  const costoBase = horas * manoObra.tarifaPorHora;
  const costo = costoBase * multiplicadorDificultad;

  return { horas, costo };
}

/**
 * Calcula todos los valores del presupuesto
 */
export function calcularPresupuesto(presupuesto: Presupuesto): CalculoResultado {
  const { dimensiones, materiales, manoObra, factorDesperdicio = 0.10, margen = 0.20, iva = 0.21 } = presupuesto;

  // Cálculos de dimensiones
  const volumen = calcularVolumen(dimensiones);
  const superficiePiso = calcularSuperficiePiso(dimensiones);
  const superficieParedes = calcularSuperficieParedes(dimensiones);
  const superficieTotal = calcularSuperficieTotal(dimensiones);
  const superficieACotizar = calcularSuperficieACotizar(superficieTotal, factorDesperdicio);

  // Cálculos de materiales
  const subtotalMateriales = calcularCostoMateriales(materiales, superficieACotizar);

  // Cálculos de mano de obra
  const { horas: horasCalculadas, costo: subtotalManoObra } = calcularCostoManoObra(manoObra, superficieTotal);

  // Cálculos de costos adicionales (permisos, licencias, etc.)
  // Si requiere permisos, se calcula como 5% del subtotal de materiales + mano de obra
  const subtotalBase = subtotalMateriales + subtotalManoObra;
  const subtotalCostosAdicionales = manoObra.requierePermisos ? subtotalBase * 0.05 : 0;

  // Subtotales
  const subtotal = subtotalBase + subtotalCostosAdicionales;

  // Margen
  const totalMargen = subtotal * margen;

  // Total antes de IVA
  const totalAntesIva = subtotal + totalMargen;

  // IVA
  const totalIva = totalAntesIva * iva;

  // Total final
  const total = totalAntesIva + totalIva;

  return {
    volumen,
    superficiePiso,
    superficieParedes,
    superficieTotal,
    superficieACotizar,
    horasCalculadas,
    subtotalMateriales,
    subtotalManoObra,
    subtotalCostosAdicionales,
    subtotal,
    margen,
    totalMargen,
    totalIva,
    total,
  };
}

