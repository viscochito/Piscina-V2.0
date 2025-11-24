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
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5 md:mb-2">
          {label}
        </label>
      )}
      
      <div className={`flex items-center border rounded-lg overflow-hidden bg-white ${error ? 'border-red-300' : 'border-gray-300'}`}>
        {/* Botón Decrementar */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={`
            w-12 md:w-10 py-2 md:py-1.5 text-lg md:text-base font-semibold
            border-r border-gray-300
            transition-colors min-h-[44px] md:min-h-[40px]
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset
            ${value <= min 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
            }
          `}
          aria-label="Decrementar"
        >
          −
        </button>

        {/* Input editable para el valor */}
        <div className="flex-1 flex items-center justify-center border-r border-gray-300 min-h-[44px] md:min-h-[40px]">
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
                w-full text-center text-base md:text-sm font-medium
                focus:outline-none bg-transparent
                ${error ? 'text-red-700' : 'text-gray-900'}
              `}
            />
          ) : (
            <button
              type="button"
              onClick={handleInputFocus}
              className={`
                w-full py-2 md:py-1.5 text-base md:text-sm font-medium text-center
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset
                ${error 
                  ? 'text-red-700 hover:bg-red-50' 
                  : 'text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {formatValue(value)}
            </button>
          )}
        </div>

        {/* Botón Incrementar */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={max !== undefined && value >= max}
          className={`
            w-12 md:w-10 py-2 md:py-1.5 text-lg md:text-base font-semibold
            transition-colors min-h-[44px] md:min-h-[40px]
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset
            ${max !== undefined && value >= max
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
            }
          `}
          aria-label="Incrementar"
        >
          +
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

