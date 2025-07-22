import React from 'react';

interface CheckboxFilterProps {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export default function CheckboxFilter({ checked, onChange, label }: CheckboxFilterProps): React.ReactElement {
  return (
    <label className="flex items-center text-white cursor-pointer hover:text-gray-200 transition-colors">
      <input
        type="checkbox"
        checked={checked || false}
        onChange={(e) => onChange(e.target.checked)}
        className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700"
        aria-label={label}
      />
      {label}
    </label>
  );
}