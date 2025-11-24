import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  type,
  ...props
}) => {
  // Determinar inputMode para mejor UX en móvil
  const getInputMode = () => {
    if (type === 'number' || type === 'tel') {
      return 'numeric';
    }
    if (type === 'email') {
      return 'email';
    }
    return 'text';
  };

  // Asegurar tamaño mínimo para área de toque en móvil (48px recomendado)
  return (
    <div className="w-full">
      <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5 md:mb-2">
        {label}
      </label>
      <input
        type={type}
        inputMode={getInputMode()}
        className={`
          w-full px-4 py-3.5 md:py-3 border rounded-lg text-base md:text-sm
          min-h-[48px] md:min-h-0
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};


