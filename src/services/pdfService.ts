/**
 * Servicio para generar PDFs de presupuestos
 * En producción, esto debería llamar a un endpoint backend que use Puppeteer
 */

import type { Presupuesto, CalculoResultado } from '@/models/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { guardarPDFCompleto } from './supabase';

export interface PDFResultado {
  blob: Blob;
  urlLocal: string;
  urlSupabase: string | null;
  presupuestoId: string | null;
}

export async function generarPDF(
  presupuesto: Presupuesto,
  calculos: CalculoResultado
): Promise<PDFResultado> {
  // Intentar usar el endpoint backend primero (con template HTML profesional)
  // Si falla, usar fallback con jsPDF mejorado
  
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
    
    // Solo intentar endpoint si está configurado
    if (API_BASE_URL) {
      const response = await fetch(`${API_BASE_URL}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presupuesto,
          calculos,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const urlLocal = URL.createObjectURL(blob);
        const nombreArchivo = `PRESUPUESTO_${presupuesto.cliente.nombre.replace(/\s/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
        
        // Guardar en Supabase (Storage + DB) - NO descargar automáticamente
        let urlSupabase: string | null = null;
        let presupuestoId: string | null = null;
        try {
          console.log('📤 Intentando guardar PDF en Supabase...');
          console.log('   Nombre archivo:', nombreArchivo);
          console.log('   Tamaño blob:', blob.size, 'bytes');
          const resultado = await guardarPDFCompleto(blob, nombreArchivo, presupuesto, calculos);
          urlSupabase = resultado.pdfUrl;
          presupuestoId = resultado.presupuestoId;
          if (urlSupabase) {
            console.log('✅ PDF guardado exitosamente en Supabase');
            console.log('   URL del PDF:', urlSupabase);
            console.log('   ID del presupuesto:', presupuestoId);
            console.log('   📍 Para ver el PDF:');
            console.log('      - Ve a Supabase Dashboard > Storage > presupuestos');
            console.log('      - O abre esta URL en el navegador:', urlSupabase);
          } else {
            console.warn('⚠️  PDF generado pero NO se pudo guardar en Supabase');
            console.warn('   Verifica la configuración de Supabase en .env');
          }
        } catch (error: any) {
          console.error('❌ Error al guardar PDF en Supabase:', error);
          console.error('   Mensaje:', error.message);
          console.error('   Verifica:');
          console.error('   1. Variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env');
          console.error('   2. Que el bucket "presupuestos" exista en Supabase');
          console.error('   3. Que las políticas de Storage permitan escritura');
        }

        return {
          blob,
          urlLocal,
          urlSupabase,
          presupuestoId,
        };
      }
    }
    
    // Si no hay endpoint o falla, usar fallback mejorado
    throw new Error('Usando generación local');
  } catch (error) {
    console.log('Generando PDF con jsPDF (versión mejorada)...');
    // Fallback: generar PDF mejorado en cliente
    return generarPDFBasico(presupuesto, calculos);
  }
}

async function generarPDFBasico(
  presupuesto: Presupuesto,
  calculos: CalculoResultado
): Promise<PDFResultado> {
  const { jsPDF } = await import('jspdf');
  const doc = new (jsPDF as any)();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10; // Márgenes reducidos para maximizar ancho
  const maxContentWidth = 150;
  const contentStartX = (pageWidth - maxContentWidth) / 2;
  let y = margin;

  // Función para calcular anchos de columnas dinámicamente basados en porcentajes
  const calcularAnchosColumnas = (anchoDisponible: number) => {
    // Porcentajes de ancho para cada columna
    const porcentajes = {
      descripcion: 0.40,  // 40% - flexible, puede crecer
      cantidad: 0.12,     // 12% - fijo
      unidad: 0.08,       // 8% - fijo
      precioUnit: 0.15,   // 15% - fijo
      total: 0.25         // 25% - con min/max
    };
    
    // Anchos mínimos y máximos (en mm, jsPDF usa mm por defecto)
    const minWidths = {
      descripcion: 50,
      cantidad: 20,
      unidad: 12,
      precioUnit: 25,
      total: 35  // minWidth para Total
    };
    
    const maxWidths = {
      descripcion: anchoDisponible * 0.50, // max 50% del ancho
      cantidad: 30,
      unidad: 18,
      precioUnit: 40,
      total: 50  // maxWidth para Total
    };
    
    // Calcular anchos base
    let descripcion = anchoDisponible * porcentajes.descripcion;
    const cantidad = Math.max(minWidths.cantidad, Math.min(maxWidths.cantidad, anchoDisponible * porcentajes.cantidad));
    const unidad = Math.max(minWidths.unidad, Math.min(maxWidths.unidad, anchoDisponible * porcentajes.unidad));
    const precioUnit = Math.max(minWidths.precioUnit, Math.min(maxWidths.precioUnit, anchoDisponible * porcentajes.precioUnit));
    let total = Math.max(minWidths.total, Math.min(maxWidths.total, anchoDisponible * porcentajes.total));
    
    // Ajustar descripción para que el total sume exactamente el ancho disponible
    const anchoFijo = cantidad + unidad + precioUnit + total;
    descripcion = anchoDisponible - anchoFijo;
    
    // Asegurar que descripción respete sus límites
    if (descripcion < minWidths.descripcion) {
      const diferencia = minWidths.descripcion - descripcion;
      total = Math.max(minWidths.total, total - diferencia);
      descripcion = minWidths.descripcion;
    } else if (descripcion > maxWidths.descripcion) {
      const diferencia = descripcion - maxWidths.descripcion;
      total = Math.min(maxWidths.total, total + diferencia);
      descripcion = maxWidths.descripcion;
    }
    
    return [
      Math.round(descripcion),
      Math.round(cantidad),
      Math.round(unidad),
      Math.round(precioUnit),
      Math.round(total)
    ];
  };

  // Color primario morado
  const primaryColor = [99, 102, 241]; // #6366f1
  // Color más oscuro para títulos de secciones
  const darkPrimaryColor = [67, 56, 202]; // #4338ca - más oscuro

  const numeroPresupuesto = presupuesto.numero || Math.floor(Math.random() * 10000);
  const fechaActual = new Date();
  const fechaCorta = format(fechaActual, 'dd/MM/yyyy', { locale: es });
  // Calcular fecha de vencimiento (15 días después)
  const fechaVencimiento = new Date(fechaActual);
  fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);
  const fechaVencimientoTexto = format(fechaVencimiento, 'dd/MM/yyyy', { locale: es });
  const tipoTrabajoLabels: Record<string, string> = {
    construccion: 'Construcción',
    reparacion: 'Reparación',
    revestimiento: 'Revestimiento',
    limpieza: 'Limpieza',
    otro: 'Otro'
  };

  const tipoPiletaLabels: Record<string, string> = {
    rectangular: 'Rectangular',
    oval: 'Oval',
    circular: 'Circular',
    irregular: 'Irregular',
    otra: 'Otra'
  };

  // Header con fondo blanco
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 70, 'F');
  
  // Logo circular morado (izquierda)
  doc.setFillColor(...primaryColor);
  doc.circle(35, 25, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('PS', 35, 28, { align: 'center' });
  
  // Información de la empresa (izquierda, al lado del logo)
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('POOL SMART', 60, 20);
  
  // Tagline de autoridad
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(99, 102, 241);
  doc.text('Especialistas en construcción de piscinas desde 2010', 60, 25);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Empresa: Pool Smart S.A.', 60, 30);
  doc.text('Dirección: Av. Principal 1234, CABA', 60, 35);
  doc.text('Teléfono: (011) 1234-5678', 60, 40);
  doc.text('Email: contacto@poolsmart.com.ar', 60, 45);
  
  // Título PRESUPUESTO (derecha)
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('PRESUPUESTO', pageWidth - margin, 20, { align: 'right' });
  
  // Número y fecha (derecha)
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`N°: ${String(numeroPresupuesto).padStart(8, '0')}`, pageWidth - margin, 30, { align: 'right' });
  doc.text(`FECHA: ${fechaCorta}`, pageWidth - margin, 37, { align: 'right' });
  
  // Línea separadora morada
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.line(margin, 50, pageWidth - margin, 50);
  
  y = 60;

  // Presupuesto personalizado - Título
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...darkPrimaryColor);
  const textoInicio = 'Presupuesto personalizado | ';
  doc.text(textoInicio, margin, y);
  // Nombre del cliente en negro
  const inicioX = margin + doc.getTextWidth(textoInicio);
  doc.setTextColor(0, 0, 0); // Color negro
  doc.text(presupuesto.cliente.nombre, inicioX, y);
  
  y += 10;
  
  // Datos del cliente en dos columnas
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  
  const leftColX = margin;
  const rightColX = pageWidth / 2 + 10;
  const startY = y; // Guardar posición inicial para alinear ambos lados
  
  // Construir descripción de la piscina
  const tipoTrabajoTexto = tipoTrabajoLabels[presupuesto.tipoTrabajo] || presupuesto.tipoTrabajo;
  const dim = presupuesto.dimensiones;
  // Usar el tipo de pileta seleccionado por el usuario, o inferir si no está definido
  const tipoPiletaTexto = presupuesto.tipoPileta 
    ? tipoPiletaLabels[presupuesto.tipoPileta] || presupuesto.tipoPileta
    : (dim.largo === dim.ancho ? 'Cuadrada' : 'Rectangular');
  const descripcionTipo = `${tipoPiletaTexto}, ${tipoTrabajoTexto}`;
  const descripcionDimensiones = `${dim.largo}m x ${dim.ancho}m x ${dim.profundidadPromedio}m`;
  
  // Lado izquierdo
  doc.setFont(undefined, 'bold');
  doc.text('Piscina:', leftColX, startY);
  doc.setFont(undefined, 'normal');
  doc.text(descripcionTipo, leftColX + 28, startY);
  doc.text(descripcionDimensiones, leftColX + 28, startY + 5);
  
  doc.setFont(undefined, 'bold');
  doc.text('Domicilio:', leftColX, startY + 11);
  doc.setFont(undefined, 'normal');
  doc.text(presupuesto.cliente.direccion, leftColX + 28, startY + 11);
  
  // Información del asesor (separada de los datos del cliente)
  doc.setFont(undefined, 'bold');
  doc.text('Atendido por:', leftColX, startY + 20);
  doc.setFont(undefined, 'normal');
  doc.text('Pool Smart - Asesor Técnico', leftColX + 28, startY + 20);
  
  // Aclaración de validez (destacada)
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(220, 38, 38); // Color rojo para destacar
  doc.text(`VALIDEZ: Este presupuesto es válido hasta el ${fechaVencimientoTexto} (15 días)`, leftColX, startY + 26);
  doc.setFontSize(10); // Restaurar tamaño
  doc.setTextColor(0, 0, 0); // Restaurar color negro
  
  // Lado derecho
  doc.setFont(undefined, 'bold');
  doc.text('Teléfono:', rightColX, startY);
  doc.setFont(undefined, 'normal');
  doc.text(presupuesto.cliente.telefono, rightColX + 32, startY);
  
  doc.setFont(undefined, 'bold');
  doc.text('Email:', rightColX, startY + 6);
  doc.setFont(undefined, 'normal');
  doc.text(presupuesto.cliente.email, rightColX + 32, startY + 6);
  
  doc.setFont(undefined, 'bold');
  doc.text('Condición IVA:', rightColX, startY + 12);
  doc.setFont(undefined, 'normal');
  doc.text(presupuesto.cliente.condicionIva || 'Consumidor Final', rightColX + 32, startY + 12);
  
  y = startY + 33; // Actualizar y para la siguiente sección (incluye línea del asesor y validez)
  
  // Línea separadora
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ========== SECCIÓN 1: MATERIALES ==========
  const materialesActivos = presupuesto.materiales.filter((m) => m.activo);
  
  if (materialesActivos.length > 0) {
    doc.setFontSize(13); // Aumentado de 12 a 13 (+1)
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...darkPrimaryColor); // Color más oscuro
    doc.text('Materiales', margin, y);
    y += 10;

    // Tabla de materiales - anchos dinámicos basados en porcentajes
    const tableStartX = margin;
    const tableWidth = pageWidth - (margin * 2); // 100% del ancho utilizable
    const colWidths = calcularAnchosColumnas(tableWidth); // Anchos adaptativos
    const headerHeight = 10;
    
    // Header de tabla con fondo morado
    doc.setFillColor(79, 70, 229);
    doc.rect(tableStartX, y - 5, tableWidth, headerHeight, 'F');
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    
    let x = tableStartX;
    doc.text('Descripción', x + 4, y + 1);
    x += colWidths[0];
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.3);
    doc.line(x, y - 5, x, y + 5);
    doc.text('Cantidad', x + colWidths[1] / 2, y + 1, { align: 'center' });
    x += colWidths[1];
    doc.line(x, y - 5, x, y + 5);
    doc.text('Unidad', x + colWidths[2] / 2, y + 1, { align: 'center' });
    x += colWidths[2];
    doc.line(x, y - 5, x, y + 5);
    doc.text('Precio Uni.', x + colWidths[3] - 4, y + 1, { align: 'right' });
    x += colWidths[3];
    doc.line(x, y - 5, x, y + 5);
    doc.text('Total', x + colWidths[4] - 4, y + 1, { align: 'right' });
    
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.8);
    doc.line(tableStartX, y + 5, tableStartX + tableWidth, y + 5);
    y += headerHeight + 2;

    // Filas de materiales
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    let rowIndex = 0;
    materialesActivos.forEach(m => {
      if (y > pageHeight - 50) {
        doc.addPage();
        y = margin + 10;
      }
      
      const cantidad = m.tipo === 'm2' ? calculos.superficieACotizar : (m.cantidad || 1);
      const precioUnit = m.tipo === 'm2' ? (m.precioPorM2 || 0) : (m.precioPorUnidad || 0);
      const subtotal = m.tipo === 'm2' 
        ? (m.precioPorM2 || 0) * calculos.superficieACotizar
        : (m.precioPorUnidad || 0) * (m.cantidad || 1);
      const unidadTexto = m.tipo === 'm2' ? 'm²' : 'Unidad';

      const rowHeight = 8;
      if (rowIndex % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(tableStartX, y - 4, tableWidth, rowHeight, 'F');
      }

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.15);
      
      x = tableStartX;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      const nombreCompleto = m.nombre + (m.calidad ? ` - Calidad ${m.calidad}` : '');
      doc.text(nombreCompleto.substring(0, 40), x + 4, y);
      doc.setFont(undefined, 'normal');
      x += colWidths[0];
      doc.line(x, y - 4, x, y + 4);
      doc.setTextColor(51, 65, 85);
      doc.text(cantidad.toFixed(2), x + colWidths[1] / 2, y, { align: 'center' });
      x += colWidths[1];
      doc.line(x, y - 4, x, y + 4);
      doc.text(unidadTexto, x + colWidths[2] / 2, y, { align: 'center' });
      x += colWidths[2];
      doc.line(x, y - 4, x, y + 4);
      doc.text(`$ ${precioUnit.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, x + colWidths[3] - 4, y, { align: 'right' });
      x += colWidths[3];
      doc.line(x, y - 4, x, y + 4);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`$ ${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, x + colWidths[4] - 4, y, { align: 'right' });
      doc.setFont(undefined, 'normal');
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(tableStartX, y + 4, tableStartX + tableWidth, y + 4);
      
      y += rowHeight + 1;
      rowIndex++;
    });
    y += 5;
    
    // Línea separadora
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  }

  // ========== SECCIÓN 2: CONSTRUCCIÓN Y MANO DE OBRA ==========
  if (y > pageHeight - 50) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...darkPrimaryColor);
  doc.text('Construcción y Mano de Obra', margin, y);
  y += 10;

  // Tabla de mano de obra - anchos dinámicos basados en porcentajes
  const tableStartX2 = margin;
  const tableWidth2 = pageWidth - (margin * 2); // 100% del ancho utilizable
  const colWidths2 = calcularAnchosColumnas(tableWidth2); // Anchos adaptativos
  const headerHeight2 = 10;
  
  doc.setFillColor(79, 70, 229);
  doc.rect(tableStartX2, y - 5, tableWidth2, headerHeight2, 'F');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  
  let x2 = tableStartX2;
  doc.text('Descripción', x2 + 4, y + 1);
  x2 += colWidths2[0];
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.3);
  doc.line(x2, y - 5, x2, y + 5);
  doc.text('Cantidad', x2 + colWidths2[1] / 2, y + 1, { align: 'center' });
  x2 += colWidths2[1];
  doc.line(x2, y - 5, x2, y + 5);
  doc.text('Unidad', x2 + colWidths2[2] / 2, y + 1, { align: 'center' });
  x2 += colWidths2[2];
  doc.line(x2, y - 5, x2, y + 5);
  doc.text('Precio Uni.', x2 + colWidths2[3] - 4, y + 1, { align: 'right' });
  x2 += colWidths2[3];
  doc.line(x2, y - 5, x2, y + 5);
  doc.text('Total', x2 + colWidths2[4] - 4, y + 1, { align: 'right' });
  
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.8);
  doc.line(tableStartX2, y + 5, tableStartX2 + tableWidth2, y + 5);
  y += headerHeight2 + 2;

  // Fila de mano de obra
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const horas = presupuesto.manoObra.calcularAutomatico ? calculos.horasCalculadas : (presupuesto.manoObra.horas || 0);
  const descripcionMO = `Mano de Obra - ${tipoTrabajoLabels[presupuesto.tipoTrabajo] || presupuesto.tipoTrabajo}${presupuesto.manoObra.dificultadAcceso !== 'normal' ? ` (Dificultad: ${presupuesto.manoObra.dificultadAcceso})` : ''}`;
  const rowHeight2 = 8;
  
  doc.setFillColor(248, 250, 252);
  doc.rect(tableStartX2, y - 4, tableWidth2, rowHeight2, 'F');
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.15);
  
  x2 = tableStartX2;
  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, 'bold');
  doc.text(descripcionMO.substring(0, 40), x2 + 4, y);
  doc.setFont(undefined, 'normal');
  x2 += colWidths2[0];
  doc.line(x2, y - 4, x2, y + 4);
  doc.setTextColor(51, 65, 85);
  doc.text(horas.toFixed(2), x2 + colWidths2[1] / 2, y, { align: 'center' });
  x2 += colWidths2[1];
  doc.line(x2, y - 4, x2, y + 4);
  doc.text('Horas', x2 + colWidths2[2] / 2, y, { align: 'center' });
  x2 += colWidths2[2];
  doc.line(x2, y - 4, x2, y + 4);
  doc.text(`$ ${presupuesto.manoObra.tarifaPorHora.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, x2 + colWidths2[3] - 4, y, { align: 'right' });
  x2 += colWidths2[3];
  doc.line(x2, y - 4, x2, y + 4);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`$ ${calculos.subtotalManoObra.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, x2 + colWidths2[4] - 4, y, { align: 'right' });
  doc.setFont(undefined, 'normal');
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(tableStartX2, y + 4, tableStartX2 + tableWidth2, y + 4);
  
  y += rowHeight2 + 3;
  
  // Línea separadora
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ========== SECCIÓN 3: COSTOS ADICIONALES ==========
  if (y > pageHeight - 50) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(13); // Aumentado de 12 a 13 (+1)
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...darkPrimaryColor); // Color más oscuro
  doc.text('Costos Adicionales', margin, y);
  y += 10;

  // Tabla de costos adicionales - anchos dinámicos basados en porcentajes
  const tableStartX3 = margin;
  const tableWidth3 = pageWidth - (margin * 2); // 100% del ancho utilizable
  const colWidths3 = calcularAnchosColumnas(tableWidth3); // Anchos adaptativos
  const headerHeight3 = 10;
  
  doc.setFillColor(79, 70, 229);
  doc.rect(tableStartX3, y - 5, tableWidth3, headerHeight3, 'F');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  
  let x3 = tableStartX3;
  doc.text('Descripción', x3 + 4, y + 1);
  x3 += colWidths3[0];
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.3);
  doc.line(x3, y - 5, x3, y + 5);
  doc.text('Cantidad', x3 + colWidths3[1] / 2, y + 1, { align: 'center' });
  x3 += colWidths3[1];
  doc.line(x3, y - 5, x3, y + 5);
  doc.text('Unidad', x3 + colWidths3[2] / 2, y + 1, { align: 'center' });
  x3 += colWidths3[2];
  doc.line(x3, y - 5, x3, y + 5);
  doc.text('Precio Uni.', x3 + colWidths3[3] - 4, y + 1, { align: 'right' });
  x3 += colWidths3[3];
  doc.line(x3, y - 5, x3, y + 5);
  doc.text('Total', x3 + colWidths3[4] - 4, y + 1, { align: 'right' });
  
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.8);
  doc.line(tableStartX3, y + 5, tableStartX3 + tableWidth3, y + 5);
  y += headerHeight3 + 2;

  // Filas de costos adicionales
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  
  if (presupuesto.manoObra.requierePermisos && calculos.subtotalCostosAdicionales > 0) {
    const rowHeight3 = 8;
    doc.setFillColor(248, 250, 252);
    doc.rect(tableStartX3, y - 4, tableWidth3, rowHeight3, 'F');
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.15);
    
    x3 = tableStartX3;
    doc.setTextColor(15, 23, 42);
    doc.setFont(undefined, 'bold');
    doc.text('Permisos y Licencias Municipales', x3 + 4, y);
    doc.setFont(undefined, 'normal');
    x3 += colWidths3[0];
    doc.line(x3, y - 4, x3, y + 4);
    doc.setTextColor(51, 65, 85);
    doc.text('1,00', x3 + colWidths3[1] / 2, y, { align: 'center' });
    x3 += colWidths3[1];
    doc.line(x3, y - 4, x3, y + 4);
    doc.text('Trámite', x3 + colWidths3[2] / 2, y, { align: 'center' });
    x3 += colWidths3[2];
    doc.line(x3, y - 4, x3, y + 4);
    doc.text(`$ ${calculos.subtotalCostosAdicionales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, x3 + colWidths3[3] - 4, y, { align: 'right' });
    x3 += colWidths3[3];
    doc.line(x3, y - 4, x3, y + 4);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`$ ${calculos.subtotalCostosAdicionales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, x3 + colWidths3[4] - 4, y, { align: 'right' });
    doc.setFont(undefined, 'normal');
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(tableStartX3, y + 4, tableStartX3 + tableWidth3, y + 4);
    
    y += rowHeight3 + 3;
  } else {
    doc.setTextColor(156, 163, 175);
    doc.text('No se han agregado costos adicionales', margin, y);
    y += 8;
  }
  y += 5;

  // ========== RESUMEN DE TOTALES (justo después de Costos Adicionales) ==========
  if (y > pageHeight - 80) {
    doc.addPage();
    y = margin;
  }

  // Caja de resumen
  const summaryWidth = 80;
  const summaryX = pageWidth - margin - summaryWidth;
  const summaryStartY = y;
  const summaryHeight = 50;
  
  // Fondo de la caja gris claro
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.roundedRect(summaryX, summaryStartY, summaryWidth, summaryHeight, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  let summaryYPos = summaryStartY + 8;
  
  // Cantidad de Items
  const totalItems = materialesActivos.length + 1 + (presupuesto.manoObra.requierePermisos && calculos.subtotalCostosAdicionales > 0 ? 1 : 0);
  doc.text('Cantidad de Items:', summaryX + 5, summaryYPos);
  doc.text(totalItems.toFixed(2), summaryX + summaryWidth - 5, summaryYPos, { align: 'right' });
  summaryYPos += 7;
  
  // Total General
  doc.text('Total General:', summaryX + 5, summaryYPos);
  doc.text(`$${calculos.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 5, summaryYPos, { align: 'right' });
  summaryYPos += 7;
  
  // IVA
  doc.text('Impuestos (IVA):', summaryX + 5, summaryYPos);
  doc.text(`$${calculos.totalIva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 5, summaryYPos, { align: 'right' });
  summaryYPos += 7;
  
  // Línea separadora
  doc.setDrawColor(229, 231, 235); // #E5E7EB gris sutil
  doc.setLineWidth(0.5);
  doc.line(summaryX + 5, summaryYPos, summaryX + summaryWidth - 5, summaryYPos);
  summaryYPos += 5;
  
  // TOTAL con color corporativo
  const corporateBlueTotal = [91, 95, 239]; // #5B5FEF
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55); // #1F2937 para "Total:"
  doc.text('Total:', summaryX + 5, summaryYPos);
  doc.setFontSize(13);
  doc.setTextColor(...corporateBlueTotal); // #5B5FEF para el monto
  doc.text(`$${calculos.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 5, summaryYPos, { align: 'right' });

  y = summaryStartY + summaryHeight + 10;

  // ========== SECCIÓN: INFORMACIÓN IMPORTANTE (ESTILO CONSISTENTE CON PÁGINA 1) ==========
  if (y > pageHeight - 120) {
    doc.addPage();
    y = margin;
  }

  const sectionStartY = y;
  const sectionMargin = margin;
  const sectionWidth = pageWidth - (sectionMargin * 2);
  const cellPadding = 8; // Padding consistente

  // Calcular anticipo y saldo
  const anticipo = calculos.total * 0.30;
  const saldo = calculos.total * 0.70;
  const diasEjecucion = Math.ceil(calculos.horasCalculadas / 8);

  // Color corporativo #5B5FEF
  const corporateBlue = [91, 95, 239]; // #5B5FEF
  const grayLight = [249, 250, 251]; // #F9FAFB
  const grayBorder = [209, 213, 219]; // #D1D5DB
  const grayText = [55, 65, 81]; // #374151
  const grayTextSecondary = [75, 85, 99]; // #4B5563
  const greenColor = [5, 150, 105]; // #059669
  const redColor = [220, 38, 38]; // #DC2626

  // Box principal con fondo blanco y borde sutil
  const boxBorderWidth = 0.5;
  doc.setFillColor(255, 255, 255); // #FFFFFF
  doc.setDrawColor(...grayBorder); // #D1D5DB
  doc.setLineWidth(boxBorderWidth);
  
  // Header con el mismo estilo que las tablas (fondo azul corporativo)
  const headerHeight = 10;
  doc.setFillColor(...corporateBlue); // #5B5FEF
  doc.rect(sectionMargin, sectionStartY, sectionWidth, headerHeight, 'FD');
  doc.setDrawColor(...grayBorder);
  doc.setLineWidth(0.5);
  doc.line(sectionMargin, sectionStartY + headerHeight, sectionMargin + sectionWidth, sectionStartY + headerHeight);
  
  y = sectionStartY + headerHeight / 2 + 1;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255); // Blanco
  doc.text('INFORMACIÓN IMPORTANTE', pageWidth / 2, y, { align: 'center' });
  
  y = sectionStartY + headerHeight;

  // ========== FILA 1: INCLUIDO / NO INCLUYE (2 columnas 50/50) ==========
  const fila1StartY = y;
  const colWidth = (sectionWidth - boxBorderWidth) / 2;
  const infoLeftColX = sectionMargin;
  const infoRightColX = sectionMargin + colWidth;
  const colContentX = cellPadding;
  const itemSpacing = 6;
  
  const itemsIncluidos = [
    'Todos los materiales y equipos detallados',
    'Mano de obra especializada y permisos',
    'Garantías (2 años m.o. + fábrica en equipos)',
    '2 mantenimientos gratuitos y asesoramiento'
  ];
  const itemsNoIncluidos = [
    'Trabajos de paisajismo o solado perimetral',
    'Conexión a red eléctrica principal',
    'Productos químicos iniciales',
    'Cerramiento o valla perimetral'
  ];
  
  // Calcular altura del contenido
  const titleHeight = 7;
  const itemsHeight = itemsIncluidos.length * itemSpacing;
  
  // Padding superior fijo (mismo espaciado que con "INFORMACIÓN IMPORTANTE")
  const paddingTop = cellPadding; // 8mm
  
  // Padding inferior dinámico: se adapta según cantidad de items
  // Mínimo 4mm, más 0.5mm por cada item (máximo 8mm para mantener equilibrio)
  const paddingBottom = Math.min(cellPadding, Math.max(4, itemsIncluidos.length * 0.5 + 2));
  
  const fila1Height = titleHeight + itemsHeight + paddingTop + paddingBottom;
  
  // Fondos grises sutiles (mismo para ambas columnas)
  doc.setFillColor(...grayLight); // #F9FAFB
  doc.rect(infoLeftColX, fila1StartY, colWidth, fila1Height, 'FD');
  doc.rect(infoRightColX, fila1StartY, colWidth, fila1Height, 'FD');
  
  // Borde vertical entre columnas
  doc.setDrawColor(229, 231, 235); // #E5E7EB
  doc.setLineWidth(0.5);
  doc.line(infoRightColX, fila1StartY, infoRightColX, fila1StartY + fila1Height);
  
  // Columna izquierda: INCLUIDO
  let leftY = fila1StartY + paddingTop + 2; // Bajado +2mm
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...greenColor); // #059669
  doc.text('INCLUIDO EN ESTE PRESUPUESTO', infoLeftColX + colContentX, leftY);
  leftY += titleHeight;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...grayText); // #374151
  itemsIncluidos.forEach(item => {
    doc.text(`• ${item}`, infoLeftColX + colContentX, leftY, { maxWidth: colWidth - colContentX * 2 });
    leftY += itemSpacing;
  });

  // Columna derecha: NO INCLUYE
  let rightY = fila1StartY + paddingTop + 2; // Bajado +2mm
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...redColor); // #DC2626
  doc.text('NO INCLUYE', infoRightColX + colContentX, rightY);
  rightY += titleHeight;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...grayText); // #374151
  itemsNoIncluidos.forEach(item => {
    doc.text(`• ${item}`, infoRightColX + colContentX, rightY, { maxWidth: colWidth - colContentX * 2 });
    rightY += itemSpacing;
  });

  // Borde inferior de fila 1
  y = fila1StartY + fila1Height;
  doc.setDrawColor(229, 231, 235); // #E5E7EB
  doc.setLineWidth(0.5);
  doc.line(sectionMargin, y, sectionMargin + sectionWidth, y);

  // ========== FILA 2: CONSIDERACIONES IMPORTANTES (ancho completo) ==========
  const fila2StartY = y;
  const contentX = sectionMargin + cellPadding;
  
  // Calcular altura con nuevo layout
  const titleHeightF2 = 7;
  const spaceAfterTitle = 2; // Reducido: espaciado entre título y "Formas de pago"
  const colContentHeight = 12; // Altura de contenido en 2 columnas
  const spaceBeforeSeparator = 6; // Aumentado: espaciado antes de la línea de separación
  const separatorHeight = 1;
  const spaceAfterSeparator = 8; // Aumentado el espaciado después de la línea de separación
  const itemSpacingF2 = 6; // Mismo espaciado que "INCLUIDO EN ESTE PRESUPUESTO"
  const consideracionesHeight = itemSpacingF2 * 4;
  
  const paddingBottomF2 = 2; // Reducido aún más: padding inferior de la sección
  const fila2Height = cellPadding + titleHeightF2 + spaceAfterTitle + 
                      colContentHeight + spaceBeforeSeparator + separatorHeight + spaceAfterSeparator + 
                      consideracionesHeight + paddingBottomF2;
  
  // Fondo blanco (sin colores saturados)
  doc.setFillColor(255, 255, 255); // #FFFFFF
  doc.rect(sectionMargin, fila2StartY, sectionWidth, fila2Height, 'FD');
  
  // Contenido
  let fila2Y = fila2StartY + cellPadding;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...corporateBlue); // #5B5FEF - mantener color original
  doc.text('CONSIDERACIONES IMPORTANTES', contentX, fila2Y);
  fila2Y += titleHeightF2 + spaceAfterTitle;

  // Layout en 2 columnas: Formas de pago (izq) | Plazo/Validez (der)
  const colWidthF2 = (sectionWidth - cellPadding * 2) / 2;
  const leftColXF2 = contentX;
  // Alinear "Plazo" con la misma distancia horizontal que "NO INCLUYE"
  // "NO INCLUYE" está en: infoRightColX + colContentX = sectionMargin + colWidth + cellPadding
  const colWidthF1 = (sectionWidth - boxBorderWidth) / 2;
  const rightColXF2 = sectionMargin + colWidthF1 + cellPadding; // Misma distancia que "NO INCLUYE"
  const colStartY = fila2Y;

  // Columna izquierda: Formas de pago - contenido alineado horizontalmente
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55); // #1F2937
  doc.text('Formas de pago:', leftColXF2, colStartY);
  let leftYF2 = colStartY + 6; // Mismo espaciado que "INCLUIDO EN ESTE PRESUPUESTO"
  
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...grayTextSecondary); // #4B5563
  
  // Calcular el ancho máximo de las etiquetas para alinear el contenido
  const anticipoLabel = '• Anticipo:';
  const saldoLabel = '• Saldo:';
  const labelWidthF2 = Math.max(doc.getTextWidth(anticipoLabel), doc.getTextWidth(saldoLabel));
  const contentOffsetF2 = labelWidthF2 + 3; // Espacio fijo después de la etiqueta más larga
  
  doc.text(anticipoLabel, leftColXF2, leftYF2);
  doc.text(`30% ($${anticipo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}) al firmar contrato`, leftColXF2 + contentOffsetF2, leftYF2);
  leftYF2 += 6; // Mismo espaciado que "INCLUIDO EN ESTE PRESUPUESTO"
  doc.text(saldoLabel, leftColXF2, leftYF2);
  doc.text(`70% ($${saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}) al finalizar obra`, leftColXF2 + contentOffsetF2, leftYF2);

  // Columna derecha: Plazo y Validez - contenido alineado horizontalmente
  let rightYF2 = colStartY;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55); // #1F2937
  
  // Calcular el ancho máximo de las etiquetas para alinear el contenido
  const labelWidth = Math.max(doc.getTextWidth('Plazo:'), doc.getTextWidth('Validez:'));
  const contentOffset = labelWidth + 3; // Espacio fijo después de la etiqueta más larga
  
  doc.text('Plazo:', rightColXF2, rightYF2);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...grayText); // #374151
  doc.text(`${diasEjecucion} días hábiles desde anticipo`, rightColXF2 + contentOffset, rightYF2);
  
  rightYF2 += 6; // Mismo espaciado que "INCLUIDO EN ESTE PRESUPUESTO"
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Validez:', rightColXF2, rightYF2);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...grayText);
  doc.text(`30 días (hasta ${fechaVencimientoTexto})`, rightColXF2 + contentOffset, rightYF2);
  
  // Línea de separación (con más espacio antes)
  fila2Y = colStartY + colContentHeight + spaceBeforeSeparator;
  doc.setDrawColor(229, 231, 235); // #E5E7EB
  doc.setLineWidth(0.5);
  doc.line(sectionMargin + cellPadding, fila2Y, sectionMargin + sectionWidth - cellPadding, fila2Y);
  fila2Y += separatorHeight + spaceAfterSeparator;

  // Consideraciones adicionales
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...grayTextSecondary); // #4B5563
  const consideraciones = [
    'Los precios están sujetos a disponibilidad de materiales',
    'Modificaciones al proyecto pueden alterar el presupuesto',
    'Se requiere acceso con agua y electricidad en el lugar',
    'El cliente debe facilitar espacio para acopio de materiales'
  ];
  consideraciones.forEach(item => {
    doc.text(`• ${item}`, contentX, fila2Y, { maxWidth: sectionWidth - cellPadding * 2 });
    fila2Y += itemSpacingF2;
  });
  
  // Borde inferior de fila 2
  y = fila2StartY + fila2Height;
  doc.setDrawColor(229, 231, 235); // #E5E7EB
  doc.setLineWidth(0.5);
  doc.line(sectionMargin, y, sectionMargin + sectionWidth, y);

  // ========== FILA 3: DUDAS O CONSULTAS (ancho completo con fondo gris claro) ==========
  const fila3StartY = y;
  const fila3Height = 28; // Aumentado para dar más espacio al final
  
  // Fondo con gradiente sutil (azul muy claro)
  doc.setFillColor(239, 246, 255); // #EFF6FF - azul muy claro
  doc.rect(sectionMargin, fila3StartY, sectionWidth, fila3Height, 'FD');
  
  // Borde superior destacado en color corporativo
  doc.setDrawColor(...corporateBlue);
  doc.setLineWidth(1);
  doc.line(sectionMargin, fila3StartY, sectionMargin + sectionWidth, fila3StartY);

  // Contenido de contacto
  let fila3Y = fila3StartY + cellPadding;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...corporateBlue); // #5B5FEF - mantener color original
  doc.text('DUDAS O CONSULTAS', contentX, fila3Y);
  fila3Y += 9; // Mismo espaciado que entre "CONSIDERACIONES IMPORTANTES" y "Formas de pago" (titleHeightF2 + spaceAfterTitle = 7 + 2)

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(31, 41, 55); // #1F2937
  doc.text('Pool Smart - Asesor Técnico', contentX, fila3Y);
  fila3Y += 6; // Mismo espaciado que entre "Formas de pago" y el primer item
  doc.setFontSize(10); // Mismo tamaño que los otros items
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...grayText); // #374151
  doc.text('Tel: (011) 1234-5678 | Email: asesor@poolsmart.com.ar', contentX, fila3Y);
  fila3Y += 4; // Espaciado antes de la línea final del recuadro

  // Actualizar posición Y final
  y = fila3StartY + fila3Height;
  
  // Dibujar borde exterior del box completo
  const totalHeight = y - sectionStartY;
  doc.setDrawColor(...grayBorder); // #D1D5DB
  doc.setLineWidth(boxBorderWidth);
  doc.roundedRect(sectionMargin, sectionStartY, sectionWidth, totalHeight, 2, 2, 'D');

  // Footer centrado
  y = pageHeight - 30;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('PoolSmart - Construcción de Piletas', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text(`Documento generado el ${fechaCorta} | Presupuesto N° ${numeroPresupuesto}`, pageWidth / 2, y, { align: 'center' });

  // Generar blob del PDF
  const blob = doc.output('blob');
  const urlLocal = URL.createObjectURL(blob);
  
  // Nombre del archivo
  const nombreArchivo = `PRESUPUESTO_${presupuesto.cliente.nombre.replace(/\s/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  
  // Guardar en Supabase (Storage + DB) - NO descargar automáticamente
  let urlSupabase: string | null = null;
  let presupuestoId: string | null = null;
  try {
    console.log('📤 Intentando guardar PDF en Supabase...');
    console.log('   Nombre archivo:', nombreArchivo);
    console.log('   Tamaño blob:', blob.size, 'bytes');
    const resultado = await guardarPDFCompleto(blob, nombreArchivo, presupuesto, calculos);
    urlSupabase = resultado.pdfUrl;
    presupuestoId = resultado.presupuestoId;
    if (urlSupabase) {
      console.log('✅ PDF guardado exitosamente en Supabase');
      console.log('   URL del PDF:', urlSupabase);
      console.log('   ID del presupuesto:', presupuestoId);
      console.log('   📍 Para ver el PDF:');
      console.log('      - Ve a Supabase Dashboard > Storage > presupuestos');
      console.log('      - O abre esta URL en el navegador:', urlSupabase);
    } else {
      console.warn('⚠️  PDF generado pero NO se pudo guardar en Supabase');
      console.warn('   Verifica la configuración de Supabase en .env');
    }
  } catch (error: any) {
    console.error('❌ Error al guardar PDF en Supabase:', error);
    console.error('   Mensaje:', error.message);
    console.error('   Verifica:');
    console.error('   1. Variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env');
    console.error('   2. Que el bucket "presupuestos" exista en Supabase');
    console.error('   3. Que las políticas de Storage permitan escritura');
    // Continuar aunque falle el guardado en Supabase
  }

  return {
    blob,
    urlLocal,
    urlSupabase,
    presupuestoId,
  };
}
