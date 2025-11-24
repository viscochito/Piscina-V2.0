/**
 * Configuración de Supabase
 * Para autenticación, base de datos y storage
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase no configurado. Usando modo offline.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Funciones de autenticación
export async function iniciarSesion(email: string) {
  if (!supabase) {
    throw new Error('Supabase no configurado');
  }
  return await supabase.auth.signInWithOtp({ email });
}

export async function cerrarSesion() {
  if (!supabase) {
    return;
  }
  return await supabase.auth.signOut();
}

export async function obtenerUsuarioActual() {
  if (!supabase) {
    return null;
  }
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Sube un PDF a Supabase Storage
 */
export async function subirPDF(blob: Blob, nombreArchivo: string): Promise<string | null> {
  if (!supabase) {
    console.warn('Supabase no configurado. No se puede subir el PDF.');
    return null;
  }

  try {
    // Obtener usuario actual (opcional, puede funcionar sin autenticación si las políticas lo permiten)
    const user = await obtenerUsuarioActual();
    const userId = user?.id || 'anonymous';

    // Crear ruta única para el archivo
    const timestamp = Date.now();
    const rutaArchivo = `${userId}/${timestamp}_${nombreArchivo}`;

    // Subir el archivo al bucket 'presupuestos'
    const { data, error } = await supabase.storage
      .from('presupuestos')
      .upload(rutaArchivo, blob, {
        contentType: 'application/pdf',
        upsert: false, // No sobrescribir si existe
      });

    if (error) {
      console.error('Error al subir PDF a Supabase:', error);
      return null;
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('presupuestos')
      .getPublicUrl(rutaArchivo);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error al subir PDF:', error);
    return null;
  }
}

/**
 * Guarda un registro de presupuesto en la base de datos
 */
export async function guardarPresupuestoEnDB(
  presupuesto: any,
  calculos: any,
  pdfUrl: string | null
): Promise<string | null> {
  if (!supabase) {
    console.warn('Supabase no configurado. No se puede guardar el presupuesto.');
    return null;
  }

  try {
    const user = await obtenerUsuarioActual();
    
    // Preparar datos para insertar
    const datosPresupuesto = {
      cliente: presupuesto.cliente,
      tipo_trabajo: presupuesto.tipoTrabajo,
      tipo_pileta: presupuesto.tipoPileta,
      dimensiones: presupuesto.dimensiones,
      materiales: presupuesto.materiales,
      mano_obra: presupuesto.manoObra,
      factor_desperdicio: presupuesto.factorDesperdicio || 0.10,
      margen: presupuesto.margen || 0.20,
      iva: presupuesto.iva || 0.21,
      calculos: calculos,
      pdf_url: pdfUrl,
      estado: 'completado',
      user_id: user?.id || null,
    };

    const { data, error } = await supabase
      .from('presupuestos')
      .insert([datosPresupuesto])
      .select()
      .single();

    if (error) {
      console.error('Error al guardar presupuesto en DB:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error al guardar presupuesto:', error);
    return null;
  }
}

/**
 * Guarda un PDF y su registro en Supabase
 */
export async function guardarPDFCompleto(
  blob: Blob,
  nombreArchivo: string,
  presupuesto: any,
  calculos: any
): Promise<{ pdfUrl: string | null; presupuestoId: string | null }> {
  // Primero subir el PDF
  const pdfUrl = await subirPDF(blob, nombreArchivo);
  
  // Luego guardar el registro en la base de datos
  const presupuestoId = await guardarPresupuestoEnDB(presupuesto, calculos, pdfUrl);

  return {
    pdfUrl,
    presupuestoId,
  };
}

/**
 * Lista todos los PDFs guardados en Supabase Storage
 */
export async function listarPDFs(): Promise<Array<{ nombre: string; url: string; fecha: Date }>> {
  if (!supabase) {
    console.warn('Supabase no configurado.');
    return [];
  }

  try {
    const { data, error } = await supabase.storage
      .from('presupuestos')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error al listar PDFs:', error);
      return [];
    }

    const pdfs = await Promise.all(
      (data || []).map(async (file) => {
        const { data: urlData } = supabase.storage
          .from('presupuestos')
          .getPublicUrl(file.name);

        return {
          nombre: file.name,
          url: urlData.publicUrl,
          fecha: new Date(file.created_at),
        };
      })
    );

    return pdfs;
  } catch (error) {
    console.error('Error al listar PDFs:', error);
    return [];
  }
}

/**
 * Obtiene todos los presupuestos guardados con sus PDFs
 */
export async function obtenerPresupuestosGuardados(): Promise<Array<{
  id: string;
  numero: number;
  cliente: any;
  pdfUrl: string | null;
  createdAt: Date;
}>> {
  if (!supabase) {
    console.warn('Supabase no configurado.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('presupuestos')
      .select('id, numero, cliente, pdf_url, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error al obtener presupuestos:', error);
      return [];
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      numero: p.numero,
      cliente: p.cliente,
      pdfUrl: p.pdf_url,
      createdAt: new Date(p.created_at),
    }));
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    return [];
  }
}


