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
    <div className={`w-full flex items-center justify-between p-4 border rounded-lg ${className}`}>
      <div className="flex-1 pr-3">
        <label className="text-sm font-medium text-gray-700 cursor-pointer block">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex min-w-[44px] min-h-[44px] items-center justify-center rounded-full transition-colors flex-shrink-0
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${checked ? 'bg-primary-600' : 'bg-gray-300'}
        `}
        aria-label={checked ? 'Desactivar' : 'Activar'}
      >
        <span
          className={`
            inline-flex items-center justify-center rounded-full bg-white transition-transform shadow-sm
            ${checked ? 'translate-x-3' : '-translate-x-3'}
          `}
          style={{ width: '20px', height: '20px' }}
        />
      </button>
    </div>
  );
};


