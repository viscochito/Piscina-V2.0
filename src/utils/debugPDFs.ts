/**
 * Utilidad para depurar y ver dónde se guardan los PDFs
 */

import { supabase } from '@/services/supabase';
import { listarPDFs, obtenerPresupuestosGuardados } from '@/services/supabase';

export async function verificarConfiguracionPDFs() {
  console.log('=== VERIFICACIÓN DE CONFIGURACIÓN DE PDFs ===\n');

  // 1. Verificar variables de entorno
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('1. Variables de Entorno:');
  console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ NO configurado');
  console.log('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurado' : '❌ NO configurado');
  console.log('');

  if (!supabase) {
    console.error('❌ Supabase no está inicializado. Verifica las variables de entorno.');
    return;
  }

  // 2. Verificar conexión
  console.log('2. Verificando conexión con Supabase...');
  try {
    const { data, error } = await supabase.from('presupuestos').select('count').limit(1);
    if (error) {
      console.error('❌ Error al conectar:', error.message);
    } else {
      console.log('✅ Conexión exitosa con Supabase');
    }
  } catch (error: any) {
    console.error('❌ Error de conexión:', error.message);
  }
  console.log('');

  // 3. Verificar bucket de Storage
  console.log('3. Verificando bucket "presupuestos" en Storage...');
  try {
    const { data, error } = await supabase.storage.from('presupuestos').list('', { limit: 1 });
    if (error) {
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        console.error('❌ El bucket "presupuestos" NO existe.');
        console.log('   💡 Solución: Ve a Supabase Dashboard > Storage > Create bucket > nombre: "presupuestos"');
      } else {
        console.error('❌ Error al acceder al bucket:', error.message);
      }
    } else {
      console.log('✅ Bucket "presupuestos" existe y es accesible');
    }
  } catch (error: any) {
    console.error('❌ Error al verificar bucket:', error.message);
  }
  console.log('');

  // 4. Listar PDFs en Storage
  console.log('4. Listando PDFs en Storage...');
  try {
    const pdfs = await listarPDFs();
    if (pdfs.length === 0) {
      console.log('⚠️  No se encontraron PDFs en Storage');
      console.log('   Esto es normal si aún no has generado ningún PDF');
    } else {
      console.log(`✅ Se encontraron ${pdfs.length} PDF(s):`);
      pdfs.forEach((pdf, index) => {
        console.log(`   ${index + 1}. ${pdf.nombre}`);
        console.log(`      URL: ${pdf.url}`);
        console.log(`      Fecha: ${pdf.fecha.toLocaleString()}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Error al listar PDFs:', error.message);
  }
  console.log('');

  // 5. Listar presupuestos en DB
  console.log('5. Listando presupuestos en la base de datos...');
  try {
    const presupuestos = await obtenerPresupuestosGuardados();
    if (presupuestos.length === 0) {
      console.log('⚠️  No se encontraron presupuestos en la base de datos');
    } else {
      console.log(`✅ Se encontraron ${presupuestos.length} presupuesto(s):`);
      presupuestos.forEach((p, index) => {
        console.log(`   ${index + 1}. Presupuesto #${p.numero}`);
        console.log(`      Cliente: ${p.cliente?.nombre || 'N/A'}`);
        console.log(`      PDF URL: ${p.pdfUrl || 'Sin PDF'}`);
        console.log(`      Fecha: ${p.createdAt.toLocaleString()}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Error al listar presupuestos:', error.message);
  }
  console.log('');

  console.log('=== FIN DE VERIFICACIÓN ===');
}

// Función para ejecutar desde la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).verificarPDFs = verificarConfiguracionPDFs;
  console.log('💡 Para verificar la configuración de PDFs, ejecuta en la consola: verificarPDFs()');
}

