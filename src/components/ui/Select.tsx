
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
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          className={`
            w-full px-4 py-3 pr-10
            border rounded-lg bg-white text-base font-medium
            appearance-none
            touch-manipulation
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            transition-all
            ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
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

        {/* Flechita custom tipo iOS */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-500'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
