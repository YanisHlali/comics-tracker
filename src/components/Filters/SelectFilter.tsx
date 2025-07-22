import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label: string;
}

export default function SelectFilter({ value, onChange, options, label }: SelectFilterProps): React.ReactElement {
  return (
    <div>
      <label className="block text-white mb-2">{label}:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none transition-colors"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}