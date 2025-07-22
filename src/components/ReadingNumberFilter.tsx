import React, { useState, useCallback } from 'react';

interface ReadingNumberFilterProps {
  minValue?: number | null;
  maxValue?: number | null;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
  onReset: () => void;
  label?: string;
  className?: string;
  placeholder?: {
    min?: string;
    max?: string;
  };
}

const ReadingNumberFilter: React.FC<ReadingNumberFilterProps> = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  onReset,
  label = 'Numéro de lecture',
  className = '',
  placeholder = {
    min: 'Min',
    max: 'Max'
  }
}) => {
  const [minInput, setMinInput] = useState<string>(minValue?.toString() || '');
  const [maxInput, setMaxInput] = useState<string>(maxValue?.toString() || '');

  const handleMinChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setMinInput(value);
    
    if (value === '') {
      onMinChange(null);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        onMinChange(numValue);
      }
    }
  }, [onMinChange]);

  const handleMaxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setMaxInput(value);
    
    if (value === '') {
      onMaxChange(null);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        onMaxChange(numValue);
      }
    }
  }, [onMaxChange]);

  const handleReset = useCallback((): void => {
    setMinInput('');
    setMaxInput('');
    onReset();
  }, [onReset]);

  const hasActiveFilter = minValue !== null || maxValue !== null;

  return (
    <div className={`reading-number-filter ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        {hasActiveFilter && (
          <button
            onClick={handleReset}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
            type="button"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="number"
            value={minInput}
            onChange={handleMinChange}
            placeholder={placeholder.min}
            min="1"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        
        <span className="self-center text-gray-400 px-1">-</span>
        
        <div className="flex-1">
          <input
            type="number"
            value={maxInput}
            onChange={handleMaxChange}
            placeholder={placeholder.max}
            min="1"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {hasActiveFilter && (
        <div className="mt-2 text-xs text-gray-400">
          {minValue && maxValue
            ? `Issues ${minValue} à ${maxValue}`
            : minValue
            ? `Issues à partir de ${minValue}`
            : maxValue
            ? `Issues jusqu'à ${maxValue}`
            : ''
          }
        </div>
      )}
    </div>
  );
};

export default ReadingNumberFilter;