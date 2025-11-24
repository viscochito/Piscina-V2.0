import React, { useState, useRef, useEffect } from 'react';

interface NumberSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  error?: string;
  helperText?: string;
  allowDecimals?: boolean;
  className?: string;
}

export const NumberSelector: React.FC<NumberSelectorProps> = ({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  label,
  error,
  helperText,
  allowDecimals = false,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDecrement = () => {
    // Los botones siempre se mueven en números enteros
    const newValue = Math.max(min, Math.floor(value) - 1);
    onChange(newValue);
  };

  const handleIncrement = () => {
    // Los botones siempre se mueven en números enteros
    const newValue = Math.floor(value) + 1;
    const finalValue = max !== undefined ? Math.min(max, newValue) : newValue;
    onChange(finalValue);
  };

  const formatValue = (val: number) => {
    if (allowDecimals) {
      return val.toFixed(1);
    }
    return val.toString();
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    setInputValue(formatValue(value));
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = allowDecimals ? parseFloat(inputValue) : parseInt(inputValue);

    if (!isNaN(numValue)) {
      let finalValue = numValue;
      if (min !== undefined && finalValue < min) finalValue = min;
      if (max !== undefined && finalValue > max) finalValue = max;
      onChange(finalValue);
    } else {
      setInputValue(formatValue(value));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // allow only numbers and decimal separator if allowed
    const raw = e.target.value;
    // basic sanitation: allow digits, optional dot or comma
    const sanitized = allowDecimals ? raw.replace(/[^0-9.,-]/g, '') : raw.replace(/[^0-9-]/g, '');
    setInputValue(sanitized);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        {label && (
          <label className="text-sm font-medium text-gray-700 flex-shrink-0">
            {label}
          </label>
        )}

        {/* CONTENEDOR PRINCIPAL DEL CONTROL: evita shrink y permite que el centro crezca */}
        <div
          className={`flex items-center border rounded-lg overflow-hidden bg-white flex-shrink-0 ${error ? 'border-red-300' : 'border-gray-300'}`}
        >
          {/* BOTÓN DECREMENTAR - hit area mínimo 44x44 */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            aria-label="Decrementar"
            className={`
              flex items-center justify-center
              min-w-[44px] min-h-[44px]
              px-3
              text-base font-semibold
              transition-colors
              touch-manipulation
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset
              ${value <= min
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              }
            `}
          >
            −
          </button>

          {/* INPUT / VALOR - CENTRO FLEXIBLE: ocupa todo el ancho sobrante */}
          <div className="flex-1 min-w-[56px] px-3 py-2.5 border-l border-r border-gray-300 flex items-center justify-center">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                inputMode={allowDecimals ? 'decimal' : 'numeric'}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className={`
                  w-full text-center text-sm font-medium
                  focus:outline-none bg-transparent
                  ${error ? 'text-red-700' : 'text-gray-900'}
                `}
                aria-label={label || 'Cantidad'}
                style={{ outlineOffset: 2 }}
              />
            ) : (
              <button
                type="button"
                onClick={handleInputFocus}
                className={`
                  w-full py-2.5 text-sm font-medium text-center
                  touch-manipulation
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset
                  ${error ? 'text-red-700 hover:bg-red-50' : 'text-gray-900 hover:bg-gray-50'}
                `}
                aria-label={label || 'Editar cantidad'}
              >
                {formatValue(value)}
              </button>
            )}
          </div>

          {/* BOTÓN INCREMENTAR - hit area mínimo 44x44 */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={max !== undefined && value >= max}
            aria-label="Incrementar"
            className={`
              flex items-center justify-center
              min-w-[44px] min-h-[44px]
              px-3
              text-base font-semibold
              transition-colors
              touch-manipulation
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset
              ${max !== undefined && value >= max
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              }
            `}
          >
            +
          </button>
        </div>
      </div>

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};
