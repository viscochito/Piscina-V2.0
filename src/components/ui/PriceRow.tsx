import React from 'react';

interface PriceRowProps {
  label: string;
  value: number;
  currency?: string;
  highlight?: boolean;
  className?: string;
}

export const PriceRow: React.FC<PriceRowProps> = ({
  label,
  value,
  currency = '$',
  highlight = false,
  className = '',
}) => {
  const formattedValue = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <div
      className={`
        flex justify-between items-center py-2
        ${highlight ? 'font-bold text-lg border-t-2 border-primary-600 pt-4' : ''}
        ${className}
      `}
    >
      <span className={highlight ? 'text-primary-700' : 'text-gray-700'}>
        {label}
      </span>
      <span className={highlight ? 'text-primary-700' : 'text-gray-900'}>
        {currency} {formattedValue}
      </span>
    </div>
  );
};


