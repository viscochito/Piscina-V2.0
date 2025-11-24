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
    <div className="w-full mb-6 md:mb-8">
      <div className="flex items-center justify-between overflow-x-auto pb-2 -mx-2 px-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center
                    font-semibold text-sm md:text-base transition-colors flex-shrink-0
                    ${isActive ? 'bg-primary-600 text-white shadow-lg scale-110' : ''}
                    ${isCompleted ? 'bg-primary-200 text-primary-700' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? (
                    <span className="text-lg md:text-xl">✓</span>
                  ) : (
                    stepNumber
                  )}
                </div>
                <p
                  className={`
                    mt-2 text-[10px] md:text-xs text-center max-w-[60px] md:max-w-[80px] truncate
                    hidden sm:block
                    ${isActive ? 'text-primary-600 font-medium' : 'text-gray-500'}
                  `}
                >
                  {step}
                </p>
                {/* Versión móvil: solo mostrar número del paso actual */}
                <p
                  className={`
                    mt-1 text-[9px] text-center truncate
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
                    flex-1 h-1 mx-1 md:mx-2 min-w-[20px] flex-shrink
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

