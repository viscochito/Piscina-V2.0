/**
 * Servicio de API para comunicación con backend
 */

import type { Presupuesto, CalculoResultado, Plantilla } from '@/models/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export async function guardarPresupuesto(
  presupuesto: Presupuesto,
  calculos: CalculoResultado
): Promise<Presupuesto> {
  try {
    const response = await fetch(`${API_BASE_URL}/presupuestos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        presupuesto,
        calculos,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al guardar presupuesto');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al guardar presupuesto:', error);
    // En caso de error, guardar en localStorage como fallback
    const presupuestos = JSON.parse(localStorage.getItem('presupuestos') || '[]');
    const nuevo = {
      ...presupuesto,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      calculos,
    };
    presupuestos.push(nuevo);
    localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
    return nuevo;
  }
}

export async function obtenerPresupuestos(): Promise<Presupuesto[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/presupuestos`);
    
    if (!response.ok) {
      throw new Error('Error al obtener presupuestos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    // Fallback a localStorage
    return JSON.parse(localStorage.getItem('presupuestos') || '[]');
  }
}

export async function obtenerPresupuesto(id: string): Promise<Presupuesto> {
  try {
    const response = await fetch(`${API_BASE_URL}/presupuestos/${id}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener presupuesto');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener presupuesto:', error);
    throw error;
  }
}

export async function guardarPlantilla(plantilla: Plantilla): Promise<Plantilla> {
  try {
    const response = await fetch(`${API_BASE_URL}/plantillas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plantilla),
    });

    if (!response.ok) {
      throw new Error('Error al guardar plantilla');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al guardar plantilla:', error);
    // Fallback a localStorage
    const plantillas = JSON.parse(localStorage.getItem('plantillas') || '[]');
    const nueva = {
      ...plantilla,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    plantillas.push(nueva);
    localStorage.setItem('plantillas', JSON.stringify(plantillas));
    return nueva;
  }
}

export async function obtenerPlantillas(): Promise<Plantilla[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/plantillas`);
    
    if (!response.ok) {
      throw new Error('Error al obtener plantillas');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    // Fallback a localStorage
    return JSON.parse(localStorage.getItem('plantillas') || '[]');
  }
}


