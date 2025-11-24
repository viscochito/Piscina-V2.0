/**
 * Servicio para compartir presupuestos por WhatsApp y email
 */

import type { Presupuesto, CalculoResultado } from '@/models/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

export function compartirWhatsApp(
  presupuesto: Presupuesto,
  calculos: CalculoResultado
): void {
  const mensaje = `Hola ${presupuesto.cliente.nombre},

Te envío el presupuesto para tu pileta:

*Tipo de trabajo:* ${presupuesto.tipoTrabajo}
*Dimensiones:* ${presupuesto.dimensiones.largo}m x ${presupuesto.dimensiones.ancho}m
*Total:* $${calculos.total.toFixed(2)}

Fecha: ${format(new Date(), 'dd/MM/yyyy', { locale: es })}

El presupuesto completo se adjunta en PDF.

Saludos!`;

  const telefono = presupuesto.cliente.telefono.replace(/\D/g, ''); // Solo números
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  
  window.open(url, '_blank');
}

export function compartirEmail(
  presupuesto: Presupuesto,
  calculos: CalculoResultado
): void {
  const asunto = `Presupuesto - ${presupuesto.cliente.nombre}`;
  const cuerpo = `Hola ${presupuesto.cliente.nombre},

Te envío el presupuesto para tu pileta:

Tipo de trabajo: ${presupuesto.tipoTrabajo}
Dimensiones: ${presupuesto.dimensiones.largo}m x ${presupuesto.dimensiones.ancho}m
Total: $${calculos.total.toFixed(2)}

Fecha: ${format(new Date(), 'dd/MM/yyyy', { locale: es })}

El presupuesto completo se adjunta en PDF.

Saludos!`;

  const mailtoLink = `mailto:${presupuesto.cliente.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  
  window.location.href = mailtoLink;
}

