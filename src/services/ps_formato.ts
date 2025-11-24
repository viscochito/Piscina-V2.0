/**
 * COPIA DE SEGURIDAD - Formato PDF actual (ps_formato)
 * 
 * Este archivo contiene una copia de seguridad del estilo actual del PDF.
 * Úsalo como referencia para restaurar el formato si es necesario.
 * 
 * Fecha de creación: ${new Date().toISOString().split('T')[0]}
 */

import type { Presupuesto, CalculoResultado } from '@/models/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

/**
 * Función de generación de PDF - Formato actual guardado como copia de seguridad
 */
export async function generarPDFBasico_ps_formato(
  presupuesto: Presupuesto,
  calculos: CalculoResultado
): Promise<string> {
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
  const fechaCorta = format(new Date(), 'dd/MM/yyyy', { locale: es });
  const tipoTrabajoLabels: Record<string, string> = {
    construccion: 'Construcción',
    reparacion: 'Reparación',
    revestimiento: 'Revestimiento',
    limpieza: 'Limpieza',
    otro: 'Otro'
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
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Empresa: Pool Smart S.A.', 60, 28);
  doc.text('Dirección: Av. Principal 1234, CABA', 60, 33);
  doc.text('Teléfono: (011) 1234-5678', 60, 38);
  doc.text('Email: contacto@poolsmart.com.ar', 60, 43);
  
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

  // Datos del Cliente - Título
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...darkPrimaryColor);
  doc.text('Datos del Cliente', margin, y);
  y += 10;
  
  // Datos del cliente en dos columnas
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  
  const leftColX = margin;
  const rightColX = pageWidth / 2 + 10;
  
  doc.text(`Razón Social: ${presupuesto.cliente.nombre}`, leftColX, y);
  doc.text(`CUIT: ${presupuesto.cliente.cuit || '-'}`, rightColX, y);
  y += 6;
  
  doc.text(`Domicilio: ${presupuesto.cliente.direccion}`, leftColX, y);
  doc.text(`Localidad: ${presupuesto.cliente.localidad || '-'}`, rightColX, y);
  y += 6;
  
  doc.text(`Provincia: ${presupuesto.cliente.provincia || 'CIUDAD AUTÓNOMA DE BUENOS AIRES'}`, leftColX, y);
  doc.text(`Fecha: ${fechaCorta}`, rightColX, y);
  y += 6;
  
  doc.text(`Condición IVA: ${presupuesto.cliente.condicionIva || 'Consumidor Final'}`, leftColX, y);
  doc.text(`Teléfono: ${presupuesto.cliente.telefono}`, rightColX, y);
  y += 6;
  
  doc.text(`Email: ${presupuesto.cliente.email}`, leftColX, y);
  y += 10;
  
  // Línea separadora
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ========== SECCIÓN 1: MATERIALES ==========
  const materialesActivos = presupuesto.materiales.filter((m) => m.activo);
  
  if (materialesActivos.length > 0) {
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...darkPrimaryColor);
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

  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...darkPrimaryColor);
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

  // ========== TÉRMINOS Y CONDICIONES ==========
  if (y > pageHeight - 60) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...darkPrimaryColor);
  doc.text('Términos y Condiciones', margin, y);
  y += 10;
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Duración del trabajo: ${Math.ceil(calculos.horasCalculadas / 8)} días`, margin, y);
  y += 6;
  doc.text('Adelanto el 30% y el resto al finalizar el trabajo', margin, y);
  y += 6;
  doc.text('Este presupuesto tiene una validez de 30 días desde la fecha de emisión.', margin, y);
  y += 6;
  doc.text('Los precios están sujetos a disponibilidad de materiales.', margin, y);
  y += 12;

  // ========== RESUMEN DE TOTALES (caja en esquina inferior derecha) ==========
  if (y > pageHeight - 60) {
    doc.addPage();
    y = margin;
  }

  // Caja de resumen en la esquina inferior derecha
  const summaryWidth = 80;
  const summaryX = pageWidth - margin - summaryWidth;
  const summaryY = pageHeight - 80;
  
  // Fondo de la caja gris claro
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.roundedRect(summaryX, summaryY, summaryWidth, 50, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  let summaryYPos = summaryY + 8;
  
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
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(summaryX + 5, summaryYPos, summaryX + summaryWidth - 5, summaryYPos);
  summaryYPos += 5;
  
  // TOTAL
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Total:', summaryX + 5, summaryYPos);
  doc.text(`$${calculos.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth - 5, summaryYPos, { align: 'right' });

  // Footer centrado
  y = pageHeight - 30;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('PoolSmart - Construcción de Piletas', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text(`Documento generado el ${fechaCorta} | Presupuesto N° ${numeroPresupuesto}`, pageWidth / 2, y, { align: 'center' });

  // Generar URL del PDF
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  
  // En desarrollo, abrir en nueva pestaña para ver cambios en tiempo real
  // En producción, descargar el archivo
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    // Abrir PDF en nueva pestaña para vista previa
    window.open(url, '_blank');
    // No revocar la URL inmediatamente para que la pestaña pueda cargarla
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else {
    // Descargar PDF en producción
    const link = document.createElement('a');
    link.href = url;
    link.download = `PRESUPUESTO_${presupuesto.cliente.nombre.replace(/\s/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return url;
}





