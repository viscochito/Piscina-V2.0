/**
 * Endpoint serverless para generar PDF con Puppeteer
 * Para usar en Vercel/Netlify Functions
 */

import type { Presupuesto, CalculoResultado } from '../src/models/types';
import { templateHTML } from './pdf-template';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { presupuesto, calculos } = await req.json() as {
      presupuesto: Presupuesto;
      calculos: CalculoResultado;
    };

    // Generar HTML del presupuesto
    const html = templateHTML(presupuesto, calculos);

    // En producción, usar Puppeteer para generar PDF
    // Por ahora, retornamos el HTML para que el cliente lo procese
    // En Vercel/Netlify, instalar puppeteer-core y chromium
    
    // Ejemplo con Puppeteer (descomentar cuando se configure):
    /*
    const puppeteer = require('puppeteer-core');
    const chromium = require('@sparticuz/chromium');
    
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });
    
    await browser.close();
    
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PRESUPUESTO_${presupuesto.cliente.nombre.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf"`,
      },
    });
    */

    // Por ahora, retornar HTML (el cliente lo procesará con jsPDF)
    return new Response(JSON.stringify({ html }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return new Response(
      JSON.stringify({ error: 'Error al generar PDF', details: String(error) }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}


