import React from 'react';

interface FilterActionsProps {
  onFilterWithoutFrench: () => void;
  onReset: () => void;
}

export default function FilterActions({ onFilterWithoutFrench, onReset }: FilterActionsProps): React.ReactElement {
  return (
    <div className="mt-4 flex flex-wrap gap-4">
      <button
        onClick={onFilterWithoutFrench}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        type="button"
        aria-label="Filtrer les issues sans éditions françaises"
      >
        Issues sans éditions françaises
      </button>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
        type="button"
        aria-label="Réinitialiser tous les filtres"
      >
        Réinitialiser
      </button>
    </div>
  );
}