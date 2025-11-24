import React, { useState } from 'react';
import { PriceRow } from '@/components/ui/PriceRow';
import { Button } from '@/components/ui/Button';
import { PDFModal } from '@/components/ui/PDFModal';
import type { Presupuesto, CalculoResultado, MaterialItem } from '@/models/types';
import type { PDFResultado } from '@/services/pdfService';

interface Paso6ResumenProps {
  presupuesto: Presupuesto;
  calculos: CalculoResultado;
  onGenerarPDF: () => Promise<PDFResultado>;
  onCompartirWhatsApp: () => void;
}

export const Paso6Resumen: React.FC<Paso6ResumenProps> = ({
  presupuesto,
  calculos,
  onGenerarPDF,
  onCompartirWhatsApp,
}) => {
  const [generando, setGenerando] = useState(false);
  const [pdfResultado, setPdfResultado] = useState<PDFResultado | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const handleGenerarPDF = async () => {
    setGenerando(true);
    try {
      const resultado = await onGenerarPDF();
      setPdfResultado(resultado);
      setMostrarModal(true);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('❌ Error al generar el PDF. Por favor, intenta nuevamente.');
    } finally {
      setGenerando(false);
    }
  };

  const materialesActivos = presupuesto.materiales.filter((m) => m.activo);

  // Usar URL de Supabase si está disponible, sino usar URL local
  const pdfUrlParaMostrar = pdfResultado?.urlSupabase || pdfResultado?.urlLocal || '';
  const nombreArchivo = pdfResultado
    ? `PRESUPUESTO_${presupuesto.cliente.nombre.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    : 'presupuesto.pdf';

  return (
    <>
      <div className="space-y-6">
      {/* Información del cliente */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Cliente</h3>
        <p className="text-sm text-gray-700">{presupuesto.cliente.nombre}</p>
        <p className="text-sm text-gray-600">{presupuesto.cliente.telefono}</p>
        <p className="text-sm text-gray-600">{presupuesto.cliente.email}</p>
      </div>

      {/* Dimensiones */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Dimensiones</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Largo:</span>
            <p className="font-medium">{presupuesto.dimensiones.largo} m</p>
          </div>
          <div>
            <span className="text-gray-600">Ancho:</span>
            <p className="font-medium">{presupuesto.dimensiones.ancho} m</p>
          </div>
          <div>
            <span className="text-gray-600">Prof:</span>
            <p className="font-medium">{presupuesto.dimensiones.profundidadPromedio} m</p>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <p>Volumen: {calculos.volumen.toFixed(2)} m³</p>
          <p>Superficie total: {calculos.superficieTotal.toFixed(2)} m²</p>
        </div>
      </div>

      {/* Materiales */}
      {materialesActivos.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Materiales seleccionados</h3>
          <ul className="space-y-1 text-sm text-gray-700">
          {materialesActivos.map((m: MaterialItem) => (
            <li key={m.id}>• {m.nombre}</li>
          ))}
          </ul>
        </div>
      )}

      {/* Resumen de costos */}
      <div className="bg-white border-2 border-primary-200 p-4 rounded-lg">
        <h3 className="font-semibold text-primary-800 mb-4">Resumen de costos</h3>
        <div className="space-y-1">
          <PriceRow label="Materiales" value={calculos.subtotalMateriales} />
          <PriceRow label="Construcción y Mano de obra" value={calculos.subtotalManoObra} />
          {calculos.subtotalCostosAdicionales > 0 && (
            <PriceRow label="Costos Adicionales" value={calculos.subtotalCostosAdicionales} />
          )}
          <PriceRow label="Subtotal" value={calculos.subtotal} />
          <PriceRow label={`Margen (${(presupuesto.margen * 100).toFixed(0)}%)`} value={calculos.totalMargen} />
          <PriceRow label={`IVA (${(presupuesto.iva * 100).toFixed(0)}%)`} value={calculos.totalIva} />
          <PriceRow label="TOTAL" value={calculos.total} highlight />
        </div>
      </div>

      {/* Acciones */}
      <div className="space-y-3">
        <Button
          onClick={handleGenerarPDF}
          disabled={generando}
          fullWidth
          variant="primary"
        >
          {generando ? 'Generando PDF...' : 'Generar PDF'}
        </Button>
        <Button
          onClick={onCompartirWhatsApp}
          disabled={!presupuesto.pdfUrl}
          fullWidth
          variant="outline"
        >
          Compartir por WhatsApp
        </Button>
      </div>
    </div>

    {pdfResultado && (
      <PDFModal
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        pdfUrl={pdfUrlParaMostrar}
        nombreArchivo={nombreArchivo}
      />
    )}
    </>
  );
};

