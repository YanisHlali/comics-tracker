import React from 'react';

interface SearchFilterProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
}

export default function SearchFilter({ value, onChange, placeholder, label }: SearchFilterProps): React.ReactElement {
  return (
    <div>
      <label className="block text-white mb-2">{label}:</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none transition-colors"
        placeholder={placeholder}
        aria-label={label}
      />
    </div>
  );
}