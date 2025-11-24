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
import { guardarPresupuesto } from '@/services/api';

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
      const pdfUrl = await generarPDF(presupuesto, calculos);
      // Actualizar presupuesto con PDF URL
      // En una implementación real, esto se haría a través del hook
      console.log('PDF generado:', pdfUrl);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
  };

  const handleCompartirWhatsApp = () => {
    compartirWhatsApp(presupuesto, calculos);
  };

  const handleGuardar = async () => {
    try {
      await guardarPresupuesto(presupuesto, calculos);
      alert('Presupuesto guardado correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el presupuesto. Por favor, intenta nuevamente.');
    }
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
            onGuardar={handleGuardar}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
            Generar Presupuesto
          </h1>
          <p className="text-gray-600 text-xs md:text-sm">
            Completa los pasos para generar un presupuesto profesional
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <Stepper
            currentStep={pasoActual}
            totalSteps={PASOS.length}
            steps={PASOS}
          />

          <div className="mt-6 md:mt-8">
            {renderPaso()}
          </div>

          {pasoActual > 1 && pasoActual < PASOS.length && (
            <div className="mt-4 md:mt-6">
              <Button onClick={handleBack} variant="outline" fullWidth size="md">
                Volver
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


