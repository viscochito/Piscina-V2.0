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

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        inputMode={getInputMode()}
        className={`
          w-full px-4 py-3 border rounded-lg text-base
          touch-manipulation
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          transition-all
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'}
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


