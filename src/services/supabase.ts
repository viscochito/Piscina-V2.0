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


