import React from 'react';

interface StepperProps {
  currentStep: number;
  totalSteps?: number;
  steps: string[];
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  totalSteps,
  steps,
}) => {
  return (
    <div className="w-full mb-6 sm:mb-8">
      <div className="flex items-center justify-between overflow-x-auto overflow-y-visible pb-2 pt-2 -mx-2 px-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center flex-1 min-w-0 pt-1">
                <div
                  className={`
                    min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center
                    font-semibold text-sm transition-colors flex-shrink-0
                    touch-manipulation relative z-10
                    ${isActive ? 'bg-primary-600 text-white shadow-lg scale-110' : ''}
                    ${isCompleted ? 'bg-primary-200 text-primary-700' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? (
                    <span className="text-lg sm:text-xl">✓</span>
                  ) : (
                    stepNumber
                  )}
                </div>
                <p
                  className={`
                    mt-2 text-xs text-center flex-1 truncate
                    hidden sm:block
                    ${isActive ? 'text-primary-600 font-medium' : 'text-gray-500'}
                  `}
                >
                  {step}
                </p>
                {/* Versión móvil: solo mostrar número del paso actual */}
                <p
                  className={`
                    mt-1 text-[10px] text-center truncate
                    sm:hidden
                    ${isActive ? 'text-primary-600 font-medium' : 'text-transparent'}
                  `}
                >
                  {isActive ? step : ''}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 py-0.5 px-1 flex-shrink
                    ${isCompleted ? 'bg-primary-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

