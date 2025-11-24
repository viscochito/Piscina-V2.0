import React from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  description,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between p-4 md:p-3 border rounded-lg min-h-[64px] md:min-h-0 ${className}`}>
      <div className="flex-1 pr-3">
        <label className="text-sm md:text-base font-medium text-gray-700 cursor-pointer block">
          {label}
        </label>
        {description && (
          <p className="text-xs md:text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-7 w-12 md:h-6 md:w-11 items-center rounded-full transition-colors flex-shrink-0
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${checked ? 'bg-primary-600' : 'bg-gray-300'}
        `}
        aria-label={checked ? 'Desactivar' : 'Activar'}
      >
        <span
          className={`
            inline-block h-5 w-5 md:h-4 md:w-4 transform rounded-full bg-white transition-transform shadow-sm
            ${checked ? 'translate-x-6 md:translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
};


