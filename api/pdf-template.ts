/**
 * Template HTML para el PDF del presupuesto
 */

import type { Presupuesto, CalculoResultado } from '../src/models/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

export function templateHTML(
  presupuesto: Presupuesto,
  calculos: CalculoResultado
): string {
  const fechaCorta = format(new Date(), 'dd/MM/yyyy', { locale: es });
  const numeroPresupuesto = presupuesto.numero || Math.floor(Math.random() * 10000);
  const materialesActivos = presupuesto.materiales.filter((m) => m.activo);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presupuesto #${numeroPresupuesto}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      font-size: 12px;
    }
    h1 {
      font-size: 18px;
      margin-bottom: 10px;
    }
    h2 {
      font-size: 14px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>
  <h1>PRESUPUESTO</h1>
  <p><strong>N°:</strong> ${String(numeroPresupuesto).padStart(8, '0')}</p>
  <p><strong>Fecha:</strong> ${fechaCorta}</p>

  <h2>Datos del Cliente</h2>
  <p><strong>Razón Social:</strong> ${presupuesto.cliente.nombre}</p>
  <p><strong>CUIT:</strong> ${presupuesto.cliente.cuit || '-'}</p>
  <p><strong>Domicilio:</strong> ${presupuesto.cliente.direccion}</p>
  <p><strong>Localidad:</strong> ${presupuesto.cliente.localidad || '-'}</p>
  <p><strong>Provincia:</strong> ${presupuesto.cliente.provincia || 'CIUDAD AUTÓNOMA DE BUENOS AIRES'}</p>
  <p><strong>Teléfono:</strong> ${presupuesto.cliente.telefono}</p>
  <p><strong>Email:</strong> ${presupuesto.cliente.email}</p>

  ${materialesActivos.length > 0 ? `
  <h2>Materiales</h2>
  <table>
    <tr>
      <th>Descripción</th>
      <th>Cantidad</th>
      <th>Unidad</th>
      <th>Precio Unit.</th>
      <th>Total</th>
    </tr>
    ${materialesActivos.map(m => {
      const cantidad = m.tipo === 'm2' ? calculos.superficieACotizar : (m.cantidad || 1);
      const precioUnit = m.tipo === 'm2' ? (m.precioPorM2 || 0) : (m.precioPorUnidad || 0);
      const subtotal = m.tipo === 'm2' 
        ? (m.precioPorM2 || 0) * calculos.superficieACotizar
        : (m.precioPorUnidad || 0) * (m.cantidad || 1);
      const unidadTexto = m.tipo === 'm2' ? 'm²' : 'Unidad';
      return `
      <tr>
        <td>${m.nombre}</td>
        <td>${cantidad.toFixed(2)}</td>
        <td>${unidadTexto}</td>
        <td>$ ${precioUnit.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
        <td>$ ${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
      </tr>
      `;
    }).join('')}
  </table>
  ` : ''}

  <h2>Mano de Obra</h2>
  <p>${presupuesto.manoObra.calcularAutomatico ? calculos.horasCalculadas.toFixed(2) : (presupuesto.manoObra.horas || 0).toFixed(2)} horas x $${presupuesto.manoObra.tarifaPorHora.toLocaleString('es-AR', { minimumFractionDigits: 2 })} = $${calculos.subtotalManoObra.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>

  ${presupuesto.manoObra.requierePermisos && calculos.subtotalCostosAdicionales > 0 ? `
  <h2>Costos Adicionales</h2>
  <p>Permisos y Licencias: $${calculos.subtotalCostosAdicionales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
  ` : ''}

  <h2>Resumen</h2>
  <p><strong>Subtotal:</strong> $${calculos.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
  <p><strong>IVA:</strong> $${calculos.totalIva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
  <p><strong>TOTAL:</strong> $${calculos.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
</body>
</html>
  `.trim();
}
