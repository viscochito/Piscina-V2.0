import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5 md:mb-2">
        {label}
      </label>
      <select
        className={`
          w-full px-4 py-3.5 md:py-3 border rounded-lg bg-white text-base md:text-sm
          min-h-[48px] md:min-h-0
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};


