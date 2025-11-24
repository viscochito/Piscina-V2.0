/**
 * Tests unitarios para las funciones de cálculo
 */

import {
  calcularVolumen,
  calcularSuperficiePiso,
  calcularSuperficieParedes,
  calcularSuperficieTotal,
  calcularSuperficieACotizar,
  calcularCostoMateriales,
  calcularHorasManoObra,
  calcularCostoManoObra,
  calcularPresupuesto,
} from './calculations';
import type { Dimensiones, MaterialItem, ManoObra, Presupuesto } from '@/models/types';

describe('Cálculos de dimensiones', () => {
  const dimensiones: Dimensiones = {
    largo: 10,
    ancho: 5,
    profundidadPromedio: 1.5,
  };

  test('calcularVolumen debe calcular correctamente', () => {
    const resultado = calcularVolumen(dimensiones);
    expect(resultado).toBe(75); // 10 * 5 * 1.5
  });

  test('calcularSuperficiePiso debe calcular correctamente', () => {
    const resultado = calcularSuperficiePiso(dimensiones);
    expect(resultado).toBe(50); // 10 * 5
  });

  test('calcularSuperficieParedes debe calcular correctamente', () => {
    const resultado = calcularSuperficieParedes(dimensiones);
    // 2 * (10 * 1.5) + 2 * (5 * 1.5) = 30 + 15 = 45
    expect(resultado).toBe(45);
  });

  test('calcularSuperficieTotal debe sumar piso y paredes', () => {
    const resultado = calcularSuperficieTotal(dimensiones);
    expect(resultado).toBe(95); // 50 + 45
  });

  test('calcularSuperficieACotizar debe aplicar factor de desperdicio', () => {
    const superficieTotal = 100;
    const factorDesperdicio = 0.10;
    const resultado = calcularSuperficieACotizar(superficieTotal, factorDesperdicio);
    expect(resultado).toBe(110); // 100 * 1.10
  });
});

describe('Cálculos de materiales', () => {
  test('calcularCostoMateriales debe calcular por m²', () => {
    const materiales: MaterialItem[] = [
      {
        id: '1',
        nombre: 'Cerámico estándar',
        tipo: 'm2',
        precioPorM2: 50,
        activo: true,
      },
    ];
    const superficieACotizar = 100;
    const resultado = calcularCostoMateriales(materiales, superficieACotizar);
    expect(resultado).toBe(5000); // 50 * 100
  });

  test('calcularCostoMateriales debe calcular por unidad', () => {
    const materiales: MaterialItem[] = [
      {
        id: '1',
        nombre: 'Bomba',
        tipo: 'unidad',
        precioPorUnidad: 15000,
        cantidad: 2,
        activo: true,
      },
    ];
    const superficieACotizar = 100;
    const resultado = calcularCostoMateriales(materiales, superficieACotizar);
    expect(resultado).toBe(30000); // 15000 * 2
  });

  test('calcularCostoMateriales debe ignorar materiales inactivos', () => {
    const materiales: MaterialItem[] = [
      {
        id: '1',
        nombre: 'Cerámico',
        tipo: 'm2',
        precioPorM2: 50,
        activo: true,
      },
      {
        id: '2',
        nombre: 'Bomba',
        tipo: 'unidad',
        precioPorUnidad: 15000,
        activo: false,
      },
    ];
    const superficieACotizar = 100;
    const resultado = calcularCostoMateriales(materiales, superficieACotizar);
    expect(resultado).toBe(5000); // Solo el activo
  });
});

describe('Cálculos de mano de obra', () => {
  test('calcularHorasManoObra debe calcular correctamente', () => {
    const superficieTotal = 100;
    const m2PorHora = 2.5;
    const resultado = calcularHorasManoObra(superficieTotal, m2PorHora);
    expect(resultado).toBe(40); // Math.ceil(100 / 2.5)
  });

  test('calcularCostoManoObra con cálculo automático', () => {
    const manoObra: ManoObra = {
      calcularAutomatico: true,
      tarifaPorHora: 2000,
      dificultadAcceso: 'normal',
      requierePermisos: false,
      m2PorHora: 2.5,
    };
    const superficieTotal = 100;
    const { horas, costo } = calcularCostoManoObra(manoObra, superficieTotal);
    expect(horas).toBe(40);
    expect(costo).toBe(80000); // 40 * 2000
  });

  test('calcularCostoManoObra con horas manuales', () => {
    const manoObra: ManoObra = {
      horas: 30,
      calcularAutomatico: false,
      tarifaPorHora: 2000,
      dificultadAcceso: 'normal',
      requierePermisos: false,
    };
    const superficieTotal = 100;
    const { horas, costo } = calcularCostoManoObra(manoObra, superficieTotal);
    expect(horas).toBe(30);
    expect(costo).toBe(60000); // 30 * 2000
  });

  test('calcularCostoManoObra debe aplicar multiplicador por dificultad', () => {
    const manoObra: ManoObra = {
      horas: 30,
      calcularAutomatico: false,
      tarifaPorHora: 2000,
      dificultadAcceso: 'alta',
      requierePermisos: false,
    };
    const superficieTotal = 100;
    const { costo } = calcularCostoManoObra(manoObra, superficieTotal);
    expect(costo).toBe(78000); // 60000 * 1.30
  });
});

describe('Cálculo completo de presupuesto', () => {
  const presupuesto: Presupuesto = {
    cliente: {
      nombre: 'Juan Pérez',
      telefono: '+5491112345678',
      email: 'juan@example.com',
      direccion: 'Calle 123',
    },
    tipoTrabajo: 'construccion',
    dimensiones: {
      largo: 10,
      ancho: 5,
      profundidadPromedio: 1.5,
    },
    materiales: [
      {
        id: '1',
        nombre: 'Cerámico estándar',
        tipo: 'm2',
        precioPorM2: 50,
        activo: true,
      },
    ],
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

  test('calcularPresupuesto debe calcular todos los valores', () => {
    const resultado = calcularPresupuesto(presupuesto);

    expect(resultado.volumen).toBe(75);
    expect(resultado.superficiePiso).toBe(50);
    expect(resultado.superficieParedes).toBe(45);
    expect(resultado.superficieTotal).toBe(95);
    expect(resultado.superficieACotizar).toBeCloseTo(104.5, 1); // 95 * 1.10
    expect(resultado.horasCalculadas).toBe(38); // Math.ceil(95 / 2.5)
    expect(resultado.subtotalMateriales).toBeGreaterThan(0);
    expect(resultado.subtotalManoObra).toBeGreaterThan(0);
    expect(resultado.total).toBeGreaterThan(0);
  });
});


