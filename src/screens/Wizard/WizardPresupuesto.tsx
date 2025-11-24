import React, { useState } from 'react';
import { Stepper } from '@/components/ui/Stepper';
import { Button } from '@/components/ui/Button';
import { usePresupuesto } from '@/hooks/usePresupuesto';
import { Paso1DatosCliente } from './Paso1DatosCliente';
import { Paso2TipoTrabajo } from './Paso2TipoTrabajo';
import { Paso3DimensionesYMateriales } from './Paso3DimensionesYMateriales';
import { Paso4ManoObra } from './Paso4ManoObra';
import { Paso5Resumen } from './Paso5Resumen';
import { generarPDF } from '@/services/pdfService';
import { compartirWhatsApp } from '@/services/shareService';

const PASOS = [
  'Cliente',
  'Tipo',
  'Dimensiones y Materiales',
  'Mano de obra',
  'Resumen',
];

export const WizardPresupuesto: React.FC = () => {
  const [pasoActual, setPasoActual] = useState(1);
  const {
    presupuesto,
    calculos,
    actualizarCliente,
    actualizarTipoTrabajo,
    actualizarDimensiones,
    actualizarMateriales,
    actualizarManoObra,
    resetearPresupuesto,
  } = usePresupuesto();

  const handleNext = () => {
    if (pasoActual < PASOS.length) {
      setPasoActual(pasoActual + 1);
    }
  };

  const handleBack = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  const handlePaso1Next = (cliente: typeof presupuesto.cliente) => {
    actualizarCliente(cliente);
    handleNext();
  };

  const handlePaso2Next = (tipo: typeof presupuesto.tipoTrabajo, tipoPileta: typeof presupuesto.tipoPileta) => {
    actualizarTipoTrabajo(tipo, tipoPileta);
    handleNext();
  };

  const handlePaso3Next = (dimensiones: typeof presupuesto.dimensiones, materiales: typeof presupuesto.materiales) => {
    actualizarDimensiones(dimensiones);
    actualizarMateriales(materiales);
    handleNext();
  };

  const handlePaso4Next = (manoObra: typeof presupuesto.manoObra) => {
    actualizarManoObra(manoObra);
    handleNext();
  };

  const handleGenerarPDF = async () => {
    try {
      const resultado = await generarPDF(presupuesto, calculos);
      // Retornar el resultado para que Paso5Resumen pueda mostrar el PDF
      return resultado;
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  };

  const handleCompartirWhatsApp = () => {
    compartirWhatsApp(presupuesto, calculos);
  };


  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <Paso1DatosCliente
            cliente={presupuesto.cliente}
            onNext={handlePaso1Next}
          />
        );
      case 2:
        return (
          <Paso2TipoTrabajo
            tipoTrabajo={presupuesto.tipoTrabajo}
            tipoPileta={presupuesto.tipoPileta}
            onNext={handlePaso2Next}
          />
        );
      case 3:
        return (
          <Paso3DimensionesYMateriales
            dimensiones={presupuesto.dimensiones}
            materiales={presupuesto.materiales}
            superficieACotizar={calculos.superficieACotizar}
            onNext={handlePaso3Next}
            onUpdateMateriales={actualizarMateriales}
          />
        );
      case 4:
        return (
          <Paso4ManoObra
            manoObra={presupuesto.manoObra}
            superficieTotal={calculos.superficieTotal}
            onNext={handlePaso4Next}
          />
        );
      case 5:
        return (
          <Paso5Resumen
            presupuesto={presupuesto}
            calculos={calculos}
            onGenerarPDF={handleGenerarPDF}
            onCompartirWhatsApp={handleCompartirWhatsApp}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 w-full px-4 py-4">
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Generar Presupuesto
          </h1>
          <p className="text-gray-600 text-sm">
            Completa los pasos para generar un presupuesto profesional
          </p>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col flex-1 min-h-0">
          <Stepper
            currentStep={pasoActual}
            totalSteps={PASOS.length}
            steps={PASOS}
          />

          <div className="mt-6 flex-1 min-h-0">
            {renderPaso()}
          </div>

          {/* Botón Volver solo si no es el paso 4 (que tiene su propio footer) */}
          {pasoActual > 1 && pasoActual < PASOS.length && pasoActual !== 4 && (
            <div className="mt-6">
              <Button onClick={handleBack} variant="outline" size="md">
                Volver
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


