import React from 'react';

interface FilterHeaderProps {
  activeFiltersCount: number;
  onToggle: () => void;
  isExpanded: boolean;
}

export default function FilterHeader({ activeFiltersCount, onToggle, isExpanded }: FilterHeaderProps): React.ReactElement {
  if (!isExpanded) {
    return (
      <div className="p-4">
        <button
          onClick={onToggle}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Afficher les filtres"
        >
          Afficher les filtres {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-white font-semibold">
        Filtres {activeFiltersCount > 0 ? `(${activeFiltersCount} actif${activeFiltersCount > 1 ? 's' : ''})` : ''}
      </h3>
      <button
        onClick={onToggle}
        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
        aria-label="Masquer les filtres"
      >
        Masquer
      </button>
    </div>
  );
}