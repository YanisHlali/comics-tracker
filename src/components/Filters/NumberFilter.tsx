import React from 'react';

interface NumberFilterProps {
  value?: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  label: string;
  min?: number;
  max?: number;
}

export default function NumberFilter({ value, onChange, placeholder, label, min, max }: NumberFilterProps): React.ReactElement {
  return (
    <div>
      <label className="block text-white mb-2">{label}:</label>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none transition-colors"
        placeholder={placeholder}
        min={min}
        max={max}
        aria-label={label}
      />
    </div>
  );
}