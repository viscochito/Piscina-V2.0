import React from 'react';
import { Button } from './Button';

interface StickyFooterProps {
  primaryLabel: string;
  onPrimaryClick: () => void;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
  summary?: {
    label: string;
    value: string;
  };
  className?: string;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({
  primaryLabel,
  onPrimaryClick,
  secondaryLabel,
  onSecondaryClick,
  summary,
  className = '',
}) => {
  return (
    <div
      className={`
        w-full fixed bottom-0 left-0 right-0 
        bg-white/95 backdrop-blur-md 
        border-t border-gray-200 
        shadow-lg z-50
        ${className}
      `}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <div className="w-full px-4 py-4">
        
        {summary && (
          <div className="mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {summary.label}
              </span>
              <span className="text-base font-bold text-primary-600">
                {summary.value}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {secondaryLabel && onSecondaryClick && (
            <Button
              onClick={onSecondaryClick}
              variant="outline"
              size="lg"
              className="w-full"
            >
              {secondaryLabel}
            </Button>
          )}

          <Button
            onClick={onPrimaryClick}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
